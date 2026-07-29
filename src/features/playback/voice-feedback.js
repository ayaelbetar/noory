/**
 * Queues optional Noor TTS prompts so Noor never speaks over herself.
 * The owning UI controls whether this service is invoked; narrator playback is separate.
 */
export class VoiceFeedbackService {
  constructor({ onStart = () => {}, onEnd = () => {} } = {}) {
    this.onStart = onStart;
    this.onEnd = onEnd;
    this.activeDone = null;
  }

  /** @param {string} text @returns {Promise<void>} Resolves when speech completes or is unavailable. */
  async speak(text) {
    if (!text || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;

    // A new prompt waits for the current one, so Noor never talks over herself.
    if (this.activeDone) await this.activeDone.promise;

    let resolveDone;
    const done = new Promise((resolve) => { resolveDone = resolve; });
    this.activeDone = { promise: done, resolve: resolveDone };
    this.onStart();

    const utterance = new window.SpeechSynthesisUtterance(text);
    const arabicVoice = window.speechSynthesis.getVoices()
      .find((voice) => voice.lang?.toLowerCase().startsWith("ar"));
    if (arabicVoice) utterance.voice = arabicVoice;
    utterance.lang = arabicVoice?.lang || "ar-SA";
    utterance.rate = 1.03;
    utterance.pitch = 1.05;

    const finish = () => {
      if (!this.activeDone) return;
      this.activeDone = null;
      this.onEnd();
      resolveDone();
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    window.speechSynthesis.speak(utterance);
    await done;
  }

  /** Cancels the active optional Noor prompt without affecting narrator playback. */
  stop() {
    if (!this.activeDone) return;
    window.speechSynthesis?.cancel();
    const { resolve } = this.activeDone;
    this.activeDone = null;
    this.onEnd();
    resolve();
  }
}
