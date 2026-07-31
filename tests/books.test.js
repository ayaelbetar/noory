import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { describe, it } from "node:test";
import { books } from "../src/data/books.js";
import { evaluateChildReading } from "../src/features/reading/reading-evaluation-service.js";
import { applyConfirmedEvaluationReward } from "../src/features/reading/session-rewards.js";

const toLocalPath = (url) => decodeURIComponent(url.replace(/^\.\//, ""));
const baa = books.find((book) => book.id === "baa");

describe("Baa book page configuration", () => {
  it("keeps all three books visible and the Baa book selectable from its first to last page", () => {
    assert.deepEqual(books.map((book) => book.id), ["baa", "mosque", "girl"]);
    assert.ok(baa);
    assert.equal(baa.practiceOnly, undefined);
    assert.equal(baa.pages.length, 9);
    assert.equal(baa.pages[0].id, "baa-1");
    assert.equal(baa.pages.at(-1).id, "baa-9");
  });

  it("maps every active Baa page to a local image and exact narrator audio file", () => {
    for (const page of baa.pages) {
      for (const asset of [page.imageUrl, page.narratorAudioUrl]) {
        const path = toLocalPath(asset);
        assert.equal(existsSync(path), true, `${page.id} asset exists: ${path}`);
        assert.ok(statSync(path).size > 0, `${page.id} asset is non-empty: ${path}`);
      }
    }
  });

  it("uses the isolated evaluator only for explicitly configured isolated-letter pages", () => {
    const isolated = baa.pages.filter((page) => page.activityType === "letter-sound");
    const words = baa.pages.filter((page) => page.activityType === "word");
    assert.deepEqual(isolated.map((page) => page.expectedText), ["بَ", "بِ", "بُ"]);
    assert.equal(words.length, 6);
    assert.ok(words.every((page) => !page.letterActivity));
  });

  it("scores a Baa word and a sentence page with normal reading evaluation", async () => {
    const wordPage = baa.pages.find((page) => page.activityType === "word");
    const word = await evaluateChildReading({ page: wordPage, attempt: { transcript: wordPage.expectedText } });
    assert.equal(word.passed, true);
    assert.equal(word.outcome, "SUCCESS");

    const sentencePage = books.find((book) => book.id === "mosque").pages[0];
    assert.equal(sentencePage.activityType, "story");
    const sentence = await evaluateChildReading({ page: sentencePage, attempt: { transcript: sentencePage.expectedText } });
    assert.equal(sentence.passed, true);
    assert.equal(sentence.outcome, "SUCCESS");
  });

  it("keeps an uncertain isolated letter unscored but allows continuation on attempt three", async () => {
    const letterPage = baa.pages.find((page) => page.activityType === "letter-sound");
    const result = await evaluateChildReading({
      page: letterPage,
      attempt: { childAudioUrl: "blob:child" },
      retryCount: 2,
      acousticAssessor: async () => ({ passed: false, status: "uncertain", speechDetected: true })
    });
    assert.equal(result.passed, false);
    assert.equal(result.status, "needs-practice");
    assert.equal(result.canContinue, true);
    assert.deepEqual(applyConfirmedEvaluationReward([], letterPage.id, result).successfulPageIds, []);
  });

  it("awards a successful Baa word once and leaves the other two books unchanged", () => {
    const wordPage = baa.pages.find((page) => page.activityType === "word");
    const success = { outcome: "SUCCESS", passed: true, status: "passed" };
    const once = applyConfirmedEvaluationReward([], wordPage.id, success);
    const twice = applyConfirmedEvaluationReward(once.successfulPageIds, wordPage.id, success);
    assert.deepEqual(once, { successfulPageIds: [wordPage.id], sessionStars: 1, sessionCoins: 5 });
    assert.deepEqual(twice, once);
    assert.equal(books.find((book) => book.id === "mosque").pages.length, 10);
    assert.equal(books.find((book) => book.id === "girl").pages.length, 28);
  });
});
