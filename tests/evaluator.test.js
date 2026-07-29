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
});
