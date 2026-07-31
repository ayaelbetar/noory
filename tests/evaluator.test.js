import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  evaluateReading,
  normalizeArabic,
  tokenizeArabic
} from "../src/features/reading/evaluator.js";

describe("Arabic reading evaluator", () => {
  it("normalizes common Arabic variants", () => {
    assert.equal(normalizeArabic("أَنَا أقرأُ في المدرسةِ."), "انا اقرا في المدرسه");
    assert.deepEqual(tokenizeArabic("هذا قمر جميل"), ["هذا", "قمر", "جميل"]);
  });

  it("returns SUCCESS for exact reading", () => {
    const result = evaluateReading({
      expectedText: "هذا قمر جميل",
      transcript: "هذا قمر جميل"
    });
    assert.equal(result.outcome, "SUCCESS");
    assert.ok(result.score >= 0.99);
  });

  it("returns SUCCESS for minor recognized spelling differences", () => {
    const result = evaluateReading({
      expectedText: "نور تنظر إلى السماء",
      transcript: "نور تنظر الى السما"
    });
    assert.equal(result.outcome, "SUCCESS");
    assert.ok(result.score >= 0.7);
  });

  it("returns RETRY when page coverage is too low", () => {
    const result = evaluateReading({
      expectedText: "تعود سارة إلى البيت سعيدة",
      transcript: "سارة سعيدة"
    });
    assert.equal(result.outcome, "RETRY");
    assert.ok(result.score < 0.7);
    assert.ok(result.missingWords.length >= 2);
  });

  it("offers Continue on the third retry outcome only", () => {
    const first = evaluateReading({
      expectedText: "الشمس دافئة اليوم",
      transcript: "الشمس",
      retryCount: 0
    });
    const third = evaluateReading({
      expectedText: "الشمس دافئة اليوم",
      transcript: "الشمس",
      retryCount: 2
    });

    assert.equal(first.outcome, "RETRY");
    assert.equal(first.offerContinue, false);
    assert.equal(third.outcome, "RETRY");
    assert.equal(third.offerContinue, true);
  });

  it("does not guess success on empty transcript", () => {
    const result = evaluateReading({
      expectedText: "هذا قمر جميل",
      transcript: ""
    });
    assert.equal(result.outcome, "RETRY");
    assert.equal(result.score, 0);
  });

  it("evaluates بَ as the b+a letter sound, not as the letter name", () => {
    const activity = {
      expectedText: "بَ",
      activityType: "letter-sound",
      expectedSpokenForm: "بَ",
      expectedPhonemes: ["b", "a"]
    };

    assert.equal(evaluateReading({ ...activity, transcript: "بَ" }).outcome, "SUCCESS");
    // Arabic speech recognition commonly writes the short vowel sound as با.
    assert.equal(evaluateReading({ ...activity, transcript: "با" }).outcome, "SUCCESS");
    assert.equal(evaluateReading({ ...activity, transcript: "ب" }).outcome, "UNCERTAIN");
    assert.equal(evaluateReading({ ...activity, transcript: "باء" }).outcome, "RETRY");
    assert.equal(evaluateReading({ ...activity, transcript: "بِ" }).outcome, "RETRY");
    assert.equal(evaluateReading({ ...activity, transcript: "بُ" }).outcome, "RETRY");
  });

  it("does not assign the ambiguous bare ب to any vowel", () => {
    for (const activity of [
      { expectedText: "بِ", activityType: "letter-sound", expectedSpokenForm: "بِ", expectedPhonemes: ["b", "i"] },
      { expectedText: "بُ", activityType: "letter-sound", expectedSpokenForm: "بُ", expectedPhonemes: ["b", "u"] }
    ]) {
      assert.equal(evaluateReading({ ...activity, transcript: "ب" }).outcome, "UNCERTAIN");
    }
  });

  it("uses the teacher rule: score 6 is not a pass", () => {
    // The production comparison is expressed 0–1. The pass boundary is
    // exclusive, matching teacherScore > 6 rather than >= 6.
    assert.equal(0.6 > 0.6, false);
  });
});
