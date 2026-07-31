import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateArabicLetterSound } from "../src/features/reading/isolated-letter-evaluator.js";
import { evaluateChildReading } from "../src/features/reading/reading-evaluation-service.js";
import { arabicLetterActivities } from "../src/data/arabic-letter-activities.js";

const baActivity = {
  id: "baa-fatha", baseLetter: "ب", targetDiacritic: "fatha", displayText: "بَ", targetClass: "ba",
  contrastClasses: ["bi", "bu", "baa-name"], references: { ba: ["ba.wav"], bi: ["bi.wav"], bu: ["bu.wav"], "baa-name": ["baa.wav"] },
  calibration: { approved: true, absoluteThreshold: 1, absoluteMargin: 0.01, relativeMargin: 0.01, minimumSpeechDurationMs: 120, maximumSpeechDurationMs: 1800 }
};

describe("generic isolated Arabic letter evaluation", () => {
  it("scores story text from the child's transcript only", async () => {
    const result = await evaluateChildReading({
      page: { id: "page-1", expectedText: "هذا قمر جميل", narratorAudioUrl: "./professional/page-1.mp3" },
      attempt: { pageId: "page-1", childAudioUrl: "blob:child-recording", transcript: "هذا قمر جميل" }
    });
    assert.equal(result.outcome, "SUCCESS");
  });

  it("passes a generic configured target without hard-coded letter classes", async () => {
    let received;
    const result = await evaluateChildReading({
      page: { id: "meem-fatha", expectedText: "مَ", expectedSpokenForm: "مَ", activityType: "letter-sound", letterActivity: { id: "meem-fatha", baseLetter: "م", targetDiacritic: "fatha", targetClass: "ma", contrastClasses: ["mi", "mu", "meem-name"], references: {}, calibration: { approved: true } } },
      attempt: { childAudioUrl: "blob:child", transcript: "" },
      acousticAssessor: async input => { received = input; return { passed: true, status: "correct", detectedClass: "ma" }; }
    });
    assert.equal(result.outcome, "SUCCESS");
    assert.equal(received.baseLetter, "م");
    assert.equal(received.targetDiacritic, "fatha");
    assert.equal(received.activityConfig.targetClass, "ma");
  });

  it("represents بَ، بِ، and بُ only through activity configuration", () => {
    assert.deepEqual(Object.values(arabicLetterActivities).map(activity => activity.targetClass), ["ba", "bi", "bu"]);
    for (const activity of Object.values(arabicLetterActivities)) assert.equal(activity.baseLetter, "ب");
  });

  it("returns not-calibrated for an uncalibrated activity without accessing audio", async () => {
    const result = await evaluateArabicLetterSound({ childAudioUrl: "not-used", baseLetter: "م", targetDiacritic: "fatha", activityConfig: { id: "meem-fatha", baseLetter: "م", targetDiacritic: "fatha", targetClass: "ma", references: {}, calibration: { approved: false } } });
    assert.equal(result.status, "not-calibrated");
    assert.equal(result.passed, false);
    assert.equal(result.canContinue, true);
  });

  it("does not turn missing references into success", async () => {
    const result = await evaluateChildReading({
      page: { id: "letter", expectedText: "مَ", expectedSpokenForm: "مَ", activityType: "letter-sound", letterActivity: baActivity },
      attempt: { childAudioUrl: "blob:child" },
      acousticAssessor: async () => ({ passed: false, status: "not-calibrated", speechDetected: true })
    });
    assert.equal(result.passed, false);
    assert.equal(result.status, "not-calibrated");
    assert.equal(result.canRetry, true);
    assert.equal(result.canContinue, false);
  });

  it("keeps uncalibrated attempt one and two retryable without continuation", async () => {
    const page = { id: "letter", expectedText: "بَ", expectedSpokenForm: "بَ", activityType: "letter-sound", letterActivity: baActivity };
    for (const retryCount of [0, 1]) {
      const result = await evaluateChildReading({
        page, attempt: { childAudioUrl: "blob:child" }, retryCount,
        acousticAssessor: async () => ({ passed: false, status: "not-calibrated", speechDetected: true })
      });
      assert.equal(result.status, "not-calibrated");
      assert.equal(result.passed, false);
      assert.equal(result.canRetry, true);
      assert.equal(result.canContinue, false);
      assert.notEqual(result.outcome, "SUCCESS");
    }
  });

  it("does not pass silence, noise, or an uncertain acoustic result", async () => {
    for (const status of ["uncertain", "incorrect"]) {
      const result = await evaluateChildReading({
        page: { id: "letter", expectedText: "بَ", expectedSpokenForm: "بَ", activityType: "letter-sound", letterActivity: baActivity },
        attempt: { childAudioUrl: "blob:child" },
        acousticAssessor: async () => ({ passed: false, status, speechDetected: false })
      });
      assert.equal(result.passed, false);
      assert.notEqual(result.outcome, "SUCCESS");
    }
  });

  it("does not convert a third unsuccessful attempt into correct", async () => {
    const result = await evaluateChildReading({
      page: { id: "letter", expectedText: "بَ", expectedSpokenForm: "بَ", activityType: "letter-sound", letterActivity: baActivity },
      attempt: { childAudioUrl: "blob:child" }, retryCount: 2,
      acousticAssessor: async () => ({ passed: false, status: "uncertain", speechDetected: true })
    });
    assert.equal(result.passed, false);
    assert.equal(result.status, "needs-practice");
    assert.equal(result.canContinue, true);
    assert.equal(result.canRetry, false);
  });

  it("allows a calibrated, confirmed target to pass immediately", async () => {
    const result = await evaluateChildReading({
      page: { id: "letter", expectedText: "بَ", expectedSpokenForm: "بَ", activityType: "letter-sound", letterActivity: baActivity },
      attempt: { childAudioUrl: "blob:child" },
      acousticAssessor: async () => ({ passed: true, status: "correct", detectedClass: "ba", speechDetected: true })
    });
    assert.equal(result.outcome, "SUCCESS");
    assert.equal(result.passed, true);
    assert.equal(result.canRetry, false);
    assert.equal(result.canContinue, false);
  });
});
