// Local, configurable Arabic consonant-and-diacritic assessment. It compares
// child microphone audio to supplied references with MFCC/log-Mel features and
// DTW. It never uses a browser transcript, raw waveform, speaker identity, or
// volume as a correctness signal.

const SAMPLE_RATE = 16_000;
const FRAME = 400;
const HOP = 160;
const MEL_BANDS = 20;
const COEFFICIENTS = 12;
const referenceCache = new Map();

function hzToMel(hz) { return 2595 * Math.log10(1 + hz / 700); }
function melToHz(mel) { return 700 * (10 ** (mel / 2595) - 1); }
function rms(values) { return Math.sqrt(values.reduce((sum, value) => sum + value * value, 0) / Math.max(1, values.length)); }
function similarity(distance) { return Number.isFinite(distance) ? 1 / (1 + distance) : 0; }

function toMono(buffer) {
  const output = new Float32Array(buffer.length);
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const input = buffer.getChannelData(channel);
    for (let index = 0; index < input.length; index += 1) output[index] += input[index] / buffer.numberOfChannels;
  }
  return output;
}

function resample(samples, sourceRate) {
  if (sourceRate === SAMPLE_RATE) return samples;
  const length = Math.max(1, Math.round(samples.length * SAMPLE_RATE / sourceRate));
  const output = new Float32Array(length);
  for (let index = 0; index < length; index += 1) {
    const position = index * sourceRate / SAMPLE_RATE;
    const left = Math.floor(position);
    const right = Math.min(samples.length - 1, left + 1);
    output[index] = samples[left] * (1 - (position - left)) + samples[right] * (position - left);
  }
  return output;
}

/** Adaptive energy VAD. It retains one hop at both ends so a short vowel is
 * not aggressively cut off, then selects one complete/clearest attempt when a
 * recording contains repeated attempts separated by silence. */
function selectSpeechAttempt(samples) {
  const levels = [];
  for (let start = 0; start + FRAME <= samples.length; start += HOP) levels.push(rms(samples.slice(start, start + FRAME)));
  if (!levels.length) return null;
  const sorted = [...levels].sort((a, b) => a - b);
  const noiseFloor = sorted[Math.floor(sorted.length * 0.2)] || 0;
  const threshold = Math.max(0.006, noiseFloor * 2.5);
  const voiced = levels.map(level => level >= threshold);
  let best = null; let runStart = -1;
  for (let index = 0; index <= voiced.length; index += 1) {
    if (voiced[index] && runStart < 0) runStart = index;
    if ((!voiced[index] || index === voiced.length) && runStart >= 0) {
      const runEnd = index - 1;
      const runLevels = levels.slice(runStart, runEnd + 1);
      const average = runLevels.reduce((sum, level) => sum + level, 0) / runLevels.length;
      const candidate = { start: runStart, end: runEnd, score: average * Math.sqrt(runLevels.length) };
      if (!best || candidate.score > best.score) best = candidate;
      runStart = -1;
    }
  }
  if (!best) return null;
  const from = Math.max(0, best.start * HOP - HOP);
  const to = Math.min(samples.length, best.end * HOP + FRAME + HOP);
  const speech = samples.slice(from, to);
  return rms(speech) >= 0.006 ? speech : null;
}

function normalizeVolume(samples) {
  const level = rms(samples);
  if (!level) return samples;
  const scale = Math.min(12, 0.1 / level);
  return Float32Array.from(samples, sample => Math.max(-1, Math.min(1, sample * scale)));
}

function spectrum(frame) {
  const values = new Float32Array(FRAME / 2 + 1);
  for (let bin = 0; bin < values.length; bin += 1) {
    let real = 0; let imaginary = 0;
    for (let index = 0; index < FRAME; index += 1) {
      const windowed = frame[index] * (0.54 - 0.46 * Math.cos((2 * Math.PI * index) / (FRAME - 1)));
      const phase = (2 * Math.PI * bin * index) / FRAME;
      real += windowed * Math.cos(phase); imaginary -= windowed * Math.sin(phase);
    }
    values[bin] = real * real + imaginary * imaginary;
  }
  return values;
}

function filters() {
  const low = hzToMel(80); const high = hzToMel(7600);
  const points = Array.from({ length: MEL_BANDS + 2 }, (_, index) => Math.floor(melToHz(low + (high - low) * index / (MEL_BANDS + 1)) * FRAME / SAMPLE_RATE));
  return Array.from({ length: MEL_BANDS }, (_, index) => [points[index], points[index + 1], points[index + 2]]);
}

function feature(frame, filterBank) {
  const power = spectrum(frame);
  const mel = filterBank.map(([left, center, right]) => {
    let total = 0;
    for (let bin = Math.max(0, left); bin < Math.min(power.length, right); bin += 1) {
      const weight = bin <= center ? (bin - left) / Math.max(1, center - left) : (right - bin) / Math.max(1, right - center);
      total += power[bin] * Math.max(0, weight);
    }
    return Math.log(total + 1e-10);
  });
  return Array.from({ length: COEFFICIENTS }, (_, coefficient) => mel.reduce((sum, value, index) => sum + value * Math.cos(Math.PI * coefficient * (index + 0.5) / MEL_BANDS), 0));
}

function mfcc(samples) {
  const bank = filters(); const values = [];
  for (let start = 0; start + FRAME <= samples.length; start += HOP) values.push(feature(samples.slice(start, start + FRAME), bank));
  if (values.length < 3) return [];
  return values.map(vector => vector.map((value, dimension) => {
    const dimensionValues = values.map(row => row[dimension]);
    const mean = dimensionValues.reduce((sum, item) => sum + item, 0) / dimensionValues.length;
    const variance = dimensionValues.reduce((sum, item) => sum + (item - mean) ** 2, 0) / dimensionValues.length;
    return (value - mean) / Math.sqrt(variance + 1e-6);
  }));
}

function dtw(left, right) {
  if (!left.length || !right.length) return Infinity;
  const previous = new Float64Array(right.length + 1).fill(Infinity); previous[0] = 0;
  for (let row = 1; row <= left.length; row += 1) {
    const current = new Float64Array(right.length + 1).fill(Infinity);
    for (let column = 1; column <= right.length; column += 1) {
      const distance = Math.sqrt(left[row - 1].reduce((sum, value, index) => sum + (value - right[column - 1][index]) ** 2, 0) / left[row - 1].length);
      current[column] = distance + Math.min(previous[column], current[column - 1], previous[column - 1]);
    }
    previous.set(current);
  }
  return previous[right.length] / (left.length + right.length);
}

function region(features, fromRatio, toRatio) {
  const from = Math.floor(features.length * fromRatio);
  const to = Math.max(from + 1, Math.ceil(features.length * toRatio));
  return features.slice(from, to);
}

function segmentation(config = {}) {
  // Ratios are activity configuration, not a b-specific assumption. They only
  // become acceptance criteria after a per-activity calibration approves them.
  return {
    consonantEndRatio: config.consonantEndRatio ?? 0.45,
    vowelStartRatio: config.vowelStartRatio ?? 0.40,
    vowelEndRatio: config.vowelEndRatio ?? 1
  };
}

async function decode(url) {
  if (!url) throw new Error("CHILD_AUDIO_UNAVAILABLE");
  const response = await fetch(url);
  if (!response.ok) throw new Error("LETTER_AUDIO_UNAVAILABLE");
  const bytes = await response.arrayBuffer();
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) throw new Error("WEB_AUDIO_UNAVAILABLE");
  const context = new Context();
  try { return await context.decodeAudioData(bytes.slice(0)); } finally { await context.close(); }
}

function prepareBuffer(buffer) {
  const speech = selectSpeechAttempt(resample(toMono(buffer), buffer.sampleRate));
  if (!speech) return { speechDetected: false, durationMs: 0, features: [] };
  return { speechDetected: true, durationMs: speech.length / SAMPLE_RATE * 1000, features: mfcc(normalizeVolume(speech)) };
}

async function prepareReference(url) {
  if (!referenceCache.has(url)) referenceCache.set(url, decode(url).then(prepareBuffer));
  return referenceCache.get(url);
}

async function prepareClassReferences(referenceUrls = []) {
  const urls = Array.isArray(referenceUrls) ? referenceUrls : referenceUrls ? [referenceUrls] : [];
  const prepared = await Promise.all(urls.map(prepareReference));
  return prepared.filter(reference => reference.speechDetected && reference.features.length);
}

function defaultResult(activityConfig = {}, overrides = {}) {
  return {
    passed: false,
    status: "uncertain",
    targetClass: activityConfig.targetClass || "",
    detectedClass: "uncertain",
    speechDetected: false,
    consonantMatch: 0,
    vowelMatch: 0,
    overallMatch: 0,
    bestDistance: null,
    secondBestDistance: null,
    absoluteMargin: null,
    relativeMargin: null,
    attemptCount: 1,
    canContinue: false,
    ...overrides
  };
}

function aggregateClassDistance(child, references, split) {
  const candidates = references.map(reference => {
    const whole = dtw(child.features, reference.features);
    const consonant = dtw(region(child.features, 0, split.consonantEndRatio), region(reference.features, 0, split.consonantEndRatio));
    const vowel = dtw(region(child.features, split.vowelStartRatio, split.vowelEndRatio), region(reference.features, split.vowelStartRatio, split.vowelEndRatio));
    // Vowel carries enough weight to stop a strong consonant alone masking a
    // wrong diacritic. These are generic feature weights, not thresholds.
    return { whole, consonant, vowel, combined: whole * 0.35 + consonant * 0.25 + vowel * 0.40 };
  }).filter(candidate => Number.isFinite(candidate.combined));
  return candidates.sort((left, right) => left.combined - right.combined)[0] || null;
}

/**
 * Generic evaluator for a configured isolated Arabic consonant/diacritic.
 * `references` maps a class id to one or more approved recordings. Calibrated
 * thresholds are required for an automatic success; absent calibration is a
 * safe, explicitly reported `not-calibrated` result.
 */
export async function evaluateArabicLetterSound({ audio, childAudioUrl, baseLetter, targetDiacritic, activityConfig = {}, attemptCount = 1 }) {
  const config = { ...activityConfig, baseLetter: activityConfig.baseLetter || baseLetter, targetDiacritic: activityConfig.targetDiacritic || targetDiacritic };
  const calibration = config.calibration || {};
  const inputUrl = childAudioUrl || audio;
  try {
    // An uncalibrated activity never opens audio/reference resources or makes
    // an acoustic claim. It stays usable for practice and can continue safely.
    if (calibration.approved !== true) {
      return defaultResult(config, { status: "not-calibrated", canContinue: true, attemptCount });
    }
    const child = prepareBuffer(await decode(inputUrl));
    const base = defaultResult(config, { speechDetected: child.speechDetected, durationMs: child.durationMs, attemptCount });
    if (!child.speechDetected || !child.features.length) return base;
    const minDuration = calibration.minimumSpeechDurationMs ?? 120;
    const maxDuration = calibration.maximumSpeechDurationMs ?? 1800;
    if (child.durationMs < minDuration || child.durationMs > maxDuration) return defaultResult(config, { ...base, status: "uncertain" });
    const classIds = [config.targetClass, ...(config.contrastClasses || [])].filter(Boolean);
    const uniqueClassIds = [...new Set(classIds)];
    if (!config.targetClass || uniqueClassIds.length < 2) return defaultResult(config, { ...base, status: "not-calibrated", canContinue: true });
    const split = segmentation(config.segmentation);
    const distances = {};
    for (const classId of uniqueClassIds) {
      const references = await prepareClassReferences(config.references?.[classId]);
      const match = aggregateClassDistance(child, references, split);
      if (!match) return defaultResult(config, { ...base, status: "not-calibrated", canContinue: true, missingReferenceClass: classId });
      distances[classId] = match;
    }
    const ranked = Object.entries(distances).sort(([, left], [, right]) => left.combined - right.combined);
    const [bestClass, best] = ranked[0];
    const second = ranked[1]?.[1];
    const absoluteMargin = second ? second.combined - best.combined : 0;
    const relativeMargin = absoluteMargin / Math.max(best.combined, 1e-6);
    const threshold = calibration.absoluteThreshold;
    const clear = Number.isFinite(threshold) && best.combined <= threshold &&
      absoluteMargin >= (calibration.absoluteMargin ?? Infinity) &&
      relativeMargin >= (calibration.relativeMargin ?? Infinity);
    const detectedClass = clear ? bestClass : "uncertain";
    const passed = clear && bestClass === config.targetClass;
    return defaultResult(config, {
      speechDetected: true, durationMs: child.durationMs, attemptCount,
      detectedClass, passed, status: passed ? "correct" : clear ? "incorrect" : "uncertain",
      consonantMatch: similarity(best.consonant), vowelMatch: similarity(best.vowel), overallMatch: similarity(best.combined),
      bestDistance: best.combined, secondBestDistance: second?.combined ?? null,
      absoluteMargin, relativeMargin,
      classDistances: Object.fromEntries(Object.entries(distances).map(([id, value]) => [id, value.combined]))
    });
  } catch (error) {
    return defaultResult(config, { attemptCount, reason: error?.message || "acoustic-analysis-failed" });
  }
}

// Compatibility entry point for existing callers. New code should pass the
// full activity configuration to evaluateArabicLetterSound.
export async function assessIsolatedArabicLetter({ childAudioUrl, activityConfig, attemptCount = 1 }) {
  return evaluateArabicLetterSound({ childAudioUrl, activityConfig, attemptCount });
}
