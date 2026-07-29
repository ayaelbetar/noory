/**
 * Plays narration for the exact current page. It prefers supplied narrator audio
 * and falls back to Arabic browser TTS for the POC. This service is intentionally
 * independent from Noor's optional feedback-voice setting.
 */
export class NarratorService {
  constructor({ onStart = () => {}, onEnd = () => {}, onError = () => {} } = {}) {
    this.onStart = onStart;
    this.onEnd = onEnd;
    this.onError = onError;
    this.audio = null;
    this.playbackId = 0;
    this.stopActivePlayback = null;
  }

  /** @param {{ audioSrc?: string, narratorText?: string, text?: string }} page @returns {Promise<void>} */
  async playPage(page) {
    this.stop();
    const playbackId = this.playbackId;
    this.onStart();

    try {
      if (page.audioSrc) await this.playAudio(page.audioSrc, playbackId);
      else await this.speak(page.narratorText || page.text, playbackId);
      if (playbackId === this.playbackId) this.onEnd();
    } catch (error) {
      if (playbackId === this.playbackId) {
        this.onError(error);
        this.onEnd();
      }
    }
  }

  /** @param {string} src @param {number} playbackId @returns {Promise<void>} */
  playAudio(src, playbackId) {
    return new Promise((resolve, reject) => {
      this.audio = new Audio(src);
      const finish = () => {
        if (playbackId === this.playbackId) this.stopActivePlayback = null;
        resolve();
      };
      this.audio.addEventListener("ended", finish, { once: true });
      this.audio.addEventListener("error", reject, { once: true });
      this.stopActivePlayback = finish;
      this.audio.play().catch(reject);
    });
  }

  /** @param {string} text @param {number} playbackId @returns {Promise<void>} */
  speak(text, playbackId) {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
        reject(new Error("SPEECH_SYNTHESIS_UNAVAILABLE"));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find((voice) => voice.lang?.toLowerCase().startsWith("ar"));
      if (arabicVoice) utterance.voice = arabicVoice;
      utterance.lang = arabicVoice?.lang || "ar-SA";
      utterance.rate = 0.82;
      utterance.pitch = 1.04;
      utterance.onend = () => {
        if (playbackId === this.playbackId) this.stopActivePlayback = null;
        resolve();
      };
      utterance.onerror = reject;
      this.stopActivePlayback = utterance.onend;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    });
  }

  /** Stops the active narrator source and resolves any pending playback callback. */
  stop() {
    this.playbackId += 1;
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (this.stopActivePlayback) {
      const finish = this.stopActivePlayback;
      this.stopActivePlayback = null;
      finish();
    }
  }
}
