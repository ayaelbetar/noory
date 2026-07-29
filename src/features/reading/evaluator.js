const ARABIC_DIACRITICS = /[\u064b-\u065f\u0670\u06d6-\u06ed]/g;
const PUNCTUATION = /[^\p{Script=Arabic}\p{Number}\s]/gu;
const SPACES = /\s+/g;

export const SUCCESS_THRESHOLD = 0.7;

/**
 * Normalizes Arabic text for comparison without changing child-visible copy.
 *
 * @param {unknown} input
 * @returns {string} Normalized comparison text.
 */
export function normalizeArabic(input) {
  return String(input || "")
    .trim()
    .replace(ARABIC_DIACRITICS, "")
    .replace(/\u0640/g, "")
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(PUNCTUATION, " ")
    .replace(SPACES, " ")
    .trim();
}

/** @param {unknown} input @returns {string[]} Normalized comparison tokens. */
export function tokenizeArabic(input) {
  const normalized = normalizeArabic(input);
  return normalized ? normalized.split(" ") : [];
}

/** @param {string} a @param {string} b @returns {number} Character edit distance. */
export function levenshtein(a, b) {
  const left = [...a];
  const right = [...b];
  const rows = Array.from({ length: left.length + 1 }, () => []);

  for (let i = 0; i <= left.length; i += 1) rows[i][0] = i;
  for (let j = 0; j <= right.length; j += 1) rows[0][j] = j;

  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      rows[i][j] = Math.min(
        rows[i - 1][j] + 1,
        rows[i][j - 1] + 1,
        rows[i - 1][j - 1] + cost
      );
    }
  }

  return rows[left.length][right.length];
}

function stringSimilarity(a, b) {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const maxLength = Math.max([...a].length, [...b].length);
  return 1 - levenshtein(a, b) / maxLength;
}

function tokenCoverage(expectedTokens, transcriptTokens) {
  if (!expectedTokens.length) return 0;

  const used = new Set();
  let matched = 0;
  const missing = [];

  expectedTokens.forEach((expected) => {
    let bestIndex = -1;
    let bestScore = 0;

    transcriptTokens.forEach((heard, index) => {
      if (used.has(index)) return;
      const score = stringSimilarity(expected, heard);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });

    if (bestScore >= 0.72) {
      used.add(bestIndex);
      matched += 1;
    } else {
      missing.push(expected);
    }
  });

  return {
    score: matched / expectedTokens.length,
    matched,
    missing
  };
}

function lengthConfidence(expectedTokens, transcriptTokens) {
  if (!expectedTokens.length || !transcriptTokens.length) return 0;
  const ratio = Math.min(expectedTokens.length, transcriptTokens.length) /
    Math.max(expectedTokens.length, transcriptTokens.length);
  return Math.max(0, Math.min(1, ratio));
}

/**
 * Produces the local POC outcome from expected page text and a transcript.
 * The numeric score is internal; child UI receives only Success, Retry, or Continue.
 *
 * @param {{ expectedText: string, transcript: string, retryCount?: number }} input
 * @returns {{ outcome: "SUCCESS" | "RETRY", offerContinue: boolean, score: number, band: string, missingWords: string[] }}
 */
export function evaluateReading({ expectedText, transcript, retryCount = 0 }) {
  const expected = normalizeArabic(expectedText);
  const heard = normalizeArabic(transcript);
  const expectedTokens = tokenizeArabic(expectedText);
  const transcriptTokens = tokenizeArabic(transcript);

  if (!heard || !transcriptTokens.length) {
    return {
      outcome: "RETRY",
      offerContinue: retryCount + 1 >= 3,
      score: 0,
      band: "Needs Full Assistance",
      missingWords: expectedTokens
    };
  }

  const coverage = tokenCoverage(expectedTokens, transcriptTokens);
  const characterScore = stringSimilarity(expected, heard);
  const lengthScore = lengthConfidence(expectedTokens, transcriptTokens);
  const score = Math.max(
    0,
    Math.min(1, characterScore * 0.45 + coverage.score * 0.4 + lengthScore * 0.15)
  );
  const outcome = score >= SUCCESS_THRESHOLD ? "SUCCESS" : "RETRY";

  return {
    outcome,
    offerContinue: outcome === "RETRY" && retryCount + 1 >= 3,
    score,
    band: readingBand(score),
    missingWords: coverage.missing
  };
}

/** @param {number} score @returns {string} An analytics-only reading band. */
export function readingBand(score) {
  if (score >= 0.9) return "Excellent Reading";
  if (score >= 0.8) return "Good Reading";
  if (score >= 0.7) return "Minor Mistakes";
  if (score >= 0.5) return "Major Mistakes";
  return "Needs Full Assistance";
}
