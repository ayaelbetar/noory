import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NarratorService } from "../src/features/playback/narrator.js";

describe("NarratorService", () => {
  it("speaks the exact page text when no narrator audio file is available", async () => {
    let spokenText = "";
    let started = 0;
    let ended = 0;

    class MockSpeechSynthesisUtterance {
      constructor(text) {
        this.text = text;
        this.lang = "";
        this.rate = 1;
        this.pitch = 1;
      }
    }

    global.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
    global.window = {
      SpeechSynthesisUtterance: MockSpeechSynthesisUtterance,
      speechSynthesis: {
        getVoices: () => [{ lang: "ar-SA", name: "Arabic voice" }],
        cancel: () => {},
        speak: (utterance) => {
          spokenText = utterance.text;
          setTimeout(() => utterance.onend(), 0);
        }
      }
    };

    const narrator = new NarratorService({
      onStart: () => {
        started += 1;
      },
      onEnd: () => {
        ended += 1;
      }
    });

    await narrator.playPage({
      text: "هذا قمر جميل",
      narratorText: "هذا قمر جميل"
    });

    assert.equal(spokenText, "هذا قمر جميل");
    assert.equal(started, 1);
    assert.equal(ended, 1);
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
      text: "هذا قمر جميل",
      audioSrc: "./assets/audio/moon-1.mp3"
    });

    assert.equal(audioSource, "./assets/audio/moon-1.mp3");
    assert.equal(speechCalls, 0);
  });
});
