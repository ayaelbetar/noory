import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { books } from "../src/data/books.js";
import { NarratorService } from "../src/features/playback/narrator.js";

describe("NarratorService", () => {
  it("reports missing professional narrator audio instead of using browser TTS", async () => {
    let error = "";
    const narrator = new NarratorService({ onError: (value) => { error = value.message; } });
    await narrator.playPage({ expectedText: "هذا قمر جميل" });
    assert.equal(error, "NARRATOR_AUDIO_UNAVAILABLE");
  });

  it("prefers the provided professional narrator audio file when present", async () => {
    let audioSource = "";
    let speechCalls = 0;

    global.window = {
      speechSynthesis: {
        cancel: () => {},
        getVoices: () => [],
        speak: () => {
          speechCalls += 1;
        }
      }
    };

    global.Audio = class MockAudio {
      constructor(src) {
        audioSource = src;
        this.listeners = {};
      }

      addEventListener(name, callback) {
        this.listeners[name] = callback;
      }

      play() {
        setTimeout(() => this.listeners.ended(), 0);
        return Promise.resolve();
      }

      pause() {}

      set currentTime(_value) {}
    };

    const narrator = new NarratorService();

    await narrator.playPage({
      expectedText: "هذا قمر جميل",
      narratorAudioUrl: "./assets/audio/moon-1.mp3"
    });

    assert.equal(audioSource, "./assets/audio/moon-1.mp3");
    assert.equal(speechCalls, 0);
  });

  it("plays the Girl-book narrator sequence that resumes at recording 16 on page 11", async () => {
    const playedSources = [];
    global.Audio = class MockAudio {
      constructor(src) {
        playedSources.push(src);
        this.listeners = {};
      }

      addEventListener(name, callback) {
        this.listeners[name] = callback;
      }

      play() {
        setTimeout(() => this.listeners.ended(), 0);
        return Promise.resolve();
      }

      pause() {}

      set currentTime(_value) {}
    };

    const girl = books.find((book) => book.id === "girl");
    const narrator = new NarratorService();
    await narrator.playPage(girl.pages[10]);
    await narrator.playPage(girl.pages[28]);

    assert.deepEqual(playedSources, [
      "./assets/books/girl/narration/16.mp3",
      "./assets/books/girl/narration/35.mp3"
    ]);
  });
});
