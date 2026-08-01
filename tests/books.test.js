import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { describe, it } from "node:test";
import { books } from "../src/data/books.js";
import { evaluateChildReading } from "../src/features/reading/reading-evaluation-service.js";
import { applyConfirmedEvaluationReward } from "../src/features/reading/session-rewards.js";

const toLocalPath = (url) => decodeURIComponent(url.replace(/^\.\//, ""));
const baa = books.find((book) => book.id === "baa");
const mosque = books.find((book) => book.id === "mosque");
const girl = books.find((book) => book.id === "girl");

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
    assert.equal(girl.pages.length, 29);
  });
});

describe("Girl book page and narrator mapping", () => {
  it("keeps source page 1 excluded, omits source page 30, and exposes 29 reading pages", () => {
    assert.equal(girl.pages.length, 29);
    assert.equal(girl.pages[0].pageNumber, 1);
    assert.equal(girl.pages[0].sourcePdfPage, 2);
    assert.equal(girl.pages.at(-1).pageNumber, 29);
    assert.equal(girl.pages.at(-1).sourcePdfPage, 31);
  });

  it("uses the explicit verified narrator mapping and skips intentionally unused files", () => {
    assert.equal(girl.pages[0].narratorAudioUrl, "./assets/books/girl/narration/2.mp3");
    assert.equal(girl.pages[9].narratorAudioUrl, "./assets/books/girl/narration/11.mp3");
    assert.equal(girl.pages[10].narratorAudio, "./assets/books/girl/narration/16.mp3");
    assert.equal(girl.pages[26].narratorAudio, "./assets/books/girl/narration/32.mp3");
    assert.equal(girl.pages[27].narratorAudio, "./assets/books/girl/narration/34.mp3");
    assert.equal(girl.pages[28].narratorAudio, "./assets/books/girl/narration/35.mp3");
    const referenced = new Set(girl.pages.map((page) => page.narratorAudio));
    for (const unused of ["12.mp3", "13.mp3", "14.mp3", "15.mp3", "33.mp3"]) {
      assert.equal(referenced.has(`./assets/books/girl/narration/${unused}`), false, `${unused} is unreferenced`);
    }
    const manifestSource = readFileSync(new URL("../src/data/books.js", import.meta.url), "utf8");
    assert.doesNotMatch(manifestSource, /girlNarratorFile\s*=|displayPageNumber\s*[+\-]/);
  });

  it("keeps every active image, expected text, and narrator asset", () => {
    for (const page of girl.pages) {
      assert.ok(page.expectedText, `${page.id} has exact expected text`);
      assert.equal(existsSync(toLocalPath(page.imageUrl)), true, `${page.id} image exists`);
    }

    for (const page of girl.pages) {
      const path = toLocalPath(page.narratorAudioUrl);
      assert.equal(existsSync(path), true, `${page.id} narrator exists: ${path}`);
      assert.ok(statSync(path).size > 0, `${page.id} narrator is non-empty: ${path}`);
    }

  });

  it("treats page 29 as the only final active reading page", () => {
    assert.notEqual(girl.pages[27].pageNumber, girl.pages.length);
    assert.equal(girl.pages[28].pageNumber, girl.pages.length);
  });
});

describe("Visible-book navigation and asset manifests", () => {
  it("keeps every visible book sequential, uniquely identified, and backed by local assets", () => {
    for (const book of books) {
      assert.ok(book.pages.length > 0, `${book.id} has active pages`);
      assert.deepEqual(book.pages.map((page) => page.pageNumber), Array.from(
        { length: book.pages.length },
        (_value, index) => index + 1
      ), `${book.id} displays pages sequentially`);
      assert.equal(new Set(book.pages.map((page) => page.id)).size, book.pages.length, `${book.id} page IDs are unique`);

      for (const page of book.pages) {
        assert.ok(page.expectedText, `${page.id} has expected text`);
        assert.match(page.imageUrl, /^\.\/assets\/books\//, `${page.id} uses a repository-relative image`);
        if (page.narratorAudioUrl) {
          assert.match(page.narratorAudioUrl, /^\.\/assets\/books\//, `${page.id} uses a repository-relative narrator path`);
        }
        assert.equal(existsSync(toLocalPath(page.imageUrl)), true, `${page.id} image exists`);
      }
    }
  });

  it("keeps Baa's selected reading activities independent from Mosque's source-page mapping", () => {
    assert.deepEqual(baa.pages.map((page) => page.sourcePdfPage), [2, 3, 5, 6, 7, 9, 10, 11, 13]);
    assert.deepEqual(mosque.pages.map((page) => page.sourcePdfPage), [2, 5, 6, 8, 9, 11, 13, 15, 17, 19]);
    assert.deepEqual(mosque.pages.map((page) => page.imageSourcePdfPage), [3, 4, 7, 8, 9, 10, 12, 14, 16, 18]);
    assert.deepEqual(mosque.pages.map((page) => page.narratorAudioUrl.split("/").at(-1)), [
      "1.mp3", "4.mp3", "5.mp3", "7.mp3", "8.mp3", "10.mp3", "12.mp3", "14.mp3", "16.mp3", "18.mp3"
    ]);
  });

  it("uses the active array length for the final page of every visible book", () => {
    for (const book of books) {
      assert.equal(book.pages.at(-1).pageNumber, book.pages.length, `${book.id} final page matches active total`);
    }
  });
});
