import { normalizeArabic } from "./evaluator.js";

/**
 * Aligns only the child's live speech-recognition transcript to page text.
 * Audio URLs, Nouri prompts, timers, and narrator playback are deliberately
 * not accepted as inputs, so they cannot advance reading highlights.
 *
 * @param {string} expectedText
 * @param {string} transcript
 * @param {{ isFinal?: boolean, confidence?: number }} options
 * @returns {{ state: "unread" | "partial" | "correct" | "uncertain" | "incorrect", partialLength?: number }[]}
 */
export function alignLiveReading(expectedText, transcript, { isFinal = false, confidence = 0 } = {}) {
  const expected = String(expectedText || "").split(/\s+/).filter(Boolean);
  const heard = normalizeArabic(transcript).split(" ").filter(Boolean);
  const alignment = expected.map(() => ({ state: "unread" }));
  let expectedIndex = 0;
  let heardIndex = 0;
  const confidentlyRecognized = confidence === 0 || confidence >= 0.55;

  while (expectedIndex < expected.length && heardIndex < heard.length) {
    const expectedWord = normalizeArabic(expected[expectedIndex]);
    const heardWord = heard[heardIndex];

    if (expectedWord === heardWord && confidentlyRecognized) {
      alignment[expectedIndex] = { state: isFinal ? "correct" : "uncertain" };
      expectedIndex += 1;
      heardIndex += 1;
      continue;
    }

    // A partial interim token is enough to illuminate the matching prefix,
    // but not enough to mark the word fully correct.
    if (!isFinal && heardWord.length >= 2 && expectedWord.startsWith(heardWord)) {
      alignment[expectedIndex] = { state: "partial", partialLength: heardWord.length };
      break;
    }

    if (!isFinal && expectedWord.startsWith(heardWord)) {
      alignment[expectedIndex] = { state: "uncertain" };
      break;
    }

    if (isFinal) alignment[expectedIndex] = { state: "incorrect" };
    break;
  }

  return alignment;
}

/**
 * Returns a strict completion result for automatic recording completion.
 * Unlike the normal page evaluator, it deliberately accepts no fuzzy spelling
 * variants: every final STT token must be present once and in page order.
 */
export function getConfirmedReadingCompletion(expectedText, confirmedTranscript, { confidence = 0 } = {}) {
  const expectedWords = normalizeArabic(expectedText).split(" ").filter(Boolean);
  const heardWords = normalizeArabic(confirmedTranscript).split(" ").filter(Boolean);
  const alignment = alignLiveReading(expectedText, confirmedTranscript, { isFinal: true, confidence });
  const correctWordCount = alignment.filter((word) => word.state === "correct").length;
  const missingWords = expectedWords.filter((_, index) => alignment[index]?.state !== "correct");
  const orderCorrect = expectedWords.length === heardWords.length &&
    expectedWords.every((word, index) => word === heardWords[index]);
  const completion = expectedWords.length ? correctWordCount / expectedWords.length : 0;

  return {
    completion,
    missingWords,
    orderCorrect,
    confirmedWordCount: correctWordCount,
    allWordsConfirmed: completion === 1 && missingWords.length === 0 && orderCorrect
  };
}
