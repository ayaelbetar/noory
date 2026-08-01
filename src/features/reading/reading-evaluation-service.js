import { evaluateArabicLetterSound } from "./isolated-letter-evaluator.js";
import { evaluateReading } from "./evaluator.js";

/** Story/word reading and isolated-letter sound evaluation remain separate. */
export async function evaluateChildReading({ page, attempt, retryCount = 0, acousticAssessor = evaluateArabicLetterSound } = {}) {
  if (!page?.expectedText) throw new Error("MISSING_EXPECTED_PAGE_TEXT");
  if (page.activityType === "letter-sound" && page.letterActivity) {
    const acoustic = await acousticAssessor({
      childAudioUrl: attempt?.childAudioUrl || "",
      baseLetter: page.letterActivity.baseLetter,
      targetDiacritic: page.letterActivity.targetDiacritic,
      activityConfig: page.letterActivity,
      attemptCount: retryCount + 1
    });
    const passed = acoustic.passed === true && acoustic.status === "correct";
    const exhausted = !passed && retryCount + 1 >= 3;
    // An uncalibrated activity remains safe practice: the child may retry,
    // but only after three unverified attempts can the book continue.
    const canContinue = exhausted;
    return {
      outcome: passed ? "SUCCESS" : acoustic.status === "incorrect" ? "RETRY" : "UNCERTAIN",
      offerContinue: canContinue,
      canContinue,
      canRetry: !passed && !exhausted,
      score: passed ? 1 : 0,
      band: passed ? "Experimental Narrator Reference Match" : "Needs Practice",
      missingWords: passed ? [] : [page.expectedSpokenForm],
      passed,
      status: passed ? "correct" : exhausted ? "needs-practice" : acoustic.status,
      assessmentLabel: "Experimental narrator-reference letter assessment",
      diagnostic: acoustic
    };
  }
  return evaluateReading({
    expectedText: page.expectedText,
    activityType: page.activityType,
    expectedSpokenForm: page.expectedSpokenForm,
    expectedPhonemes: page.expectedPhonemes,
    transcript: attempt?.transcript || "",
    retryCount
  });
}
