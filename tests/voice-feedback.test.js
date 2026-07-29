import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { VoiceFeedbackService } from "../src/features/playback/voice-feedback.js";

describe("VoiceFeedbackService", () => {
  it("plays a short Arabic prompt and completes before the next one", async () => {
    const spoken = [];
    global.window = {
      SpeechSynthesisUtterance: class {
        constructor(text) { this.text = text; }
      },
      speechSynthesis: {
        getVoices: () => [{ lang: "ar-SA" }],
        speak: (utterance) => {
          spoken.push(utterance.text);
          utterance.onend();
        },
        cancel: () => {}
      }
    };

    const service = new VoiceFeedbackService();
    await service.speak("أحسنت يا أحمد!");
    await service.speak("رائع!");

    assert.deepEqual(spoken, ["أحسنت يا أحمد!", "رائع!"]);
  });
});
