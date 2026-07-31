import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { alignLiveReading, getConfirmedReadingCompletion } from "../src/features/reading/live-highlighting.js";

describe("live reading highlighting", () => {
  it("shows a progressive letter prefix for an interim child transcript", () => {
    const alignment = alignLiveReading("لَعِبَ الوَلَدُ", "لع", { confidence: 0.9 });
    assert.deepEqual(alignment[0], { state: "partial", partialLength: 2 });
    assert.equal(alignment[1].state, "unread");
  });

  it("marks sequential final words correct and does not auto-advance", () => {
    const exact = alignLiveReading("لعب الولد", "لعب الولد", { isFinal: true, confidence: 0.9 });
    const empty = alignLiveReading("لعب الولد", "", { isFinal: true, confidence: 0.9 });
    assert.deepEqual(exact.map((item) => item.state), ["correct", "correct"]);
    assert.deepEqual(empty.map((item) => item.state), ["unread", "unread"]);
  });

  it("does not let Nouri or narrator playback highlight page words", () => {
    const nouriUiPrompt = "أحسنت";
    const narratorAudioUrl = "./professional/page-01.mp3";
    const alignment = alignLiveReading("لعب الولد", "", { isFinal: false });
    assert.ok(nouriUiPrompt);
    assert.ok(narratorAudioUrl);
    assert.deepEqual(alignment.map((item) => item.state), ["unread", "unread"]);
  });

  it("allows automatic completion only for every final word in exact order", () => {
    const complete = getConfirmedReadingCompletion("لعب الولد", "لعب الولد", { confidence: 0.9 });
    const partial = getConfirmedReadingCompletion("لعب الولد", "لعب", { confidence: 0.9 });
    const repeated = getConfirmedReadingCompletion("لعب الولد", "لعب لعب الولد", { confidence: 0.9 });

    assert.equal(complete.allWordsConfirmed, true);
    assert.equal(complete.completion, 1);
    assert.equal(partial.allWordsConfirmed, false);
    assert.equal(repeated.allWordsConfirmed, false);
    assert.equal(repeated.orderCorrect, false);
  });
});
