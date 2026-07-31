/**
 * Plays narration for the exact current page. It prefers supplied narrator audio
 * and never falls back to browser TTS. This service is intentionally independent
 * from Noor's optional feedback-voice setting.
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

  /** @param {{ narratorAudioUrl?: string, expectedText?: string }} page @returns {Promise<void>} */
  async playPage(page) {
    this.stop();
    const playbackId = this.playbackId;
    this.onStart();

    try {
      if (!page.narratorAudioUrl) throw new Error("NARRATOR_AUDIO_UNAVAILABLE");
      await this.playAudio(page.narratorAudioUrl, playbackId);
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

  /** Stops the active narrator source and resolves any pending playback callback. */
  stop() {
    this.playbackId += 1;
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
    if (this.stopActivePlayback) {
      const finish = this.stopActivePlayback;
      this.stopActivePlayback = null;
      finish();
    }
  }
}
