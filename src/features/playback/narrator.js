/**
 * Plays narration for the exact current page. It prefers supplied narrator audio
 * and never falls back to browser TTS. This service is intentionally independent
 * from Noor's optional feedback-voice setting.
 */
export class NarratorService {
  constructor({ onStart = () => {}, onEnd = () => {}, onError = () => {}, onDiagnostic = () => {} } = {}) {
    this.onStart = onStart;
    this.onEnd = onEnd;
    this.onError = onError;
    this.onDiagnostic = onDiagnostic;
    this.audio = null;
    this.unlocked = false;
    this.playbackId = 0;
    this.stopActivePlayback = null;
  }

  /** Prime HTML audio during a genuine user gesture for later retry playback. */
  async unlock(page) {
    const src = page?.narratorAudio || page?.narratorAudioUrl;
    if (!src || this.unlocked) return;
    const probe = new Audio(src);
    probe.muted = true;
    try {
      await probe.play();
      probe.pause();
      probe.currentTime = 0;
      this.unlocked = true;
    } catch (error) {
      // The subsequent play records the real failure and exposes the manual control.
      throw error;
    }
  }

  /** @param {{ narratorAudio?: string, narratorAudioUrl?: string, expectedText?: string }} page @returns {Promise<void>} */
  async playPage(page) {
    this.stop();
    const playbackId = this.playbackId;
    this.onStart();

    try {
      const narratorAudio = page.narratorAudio || page.narratorAudioUrl;
      if (!narratorAudio) throw new Error("NARRATOR_AUDIO_UNAVAILABLE");
      this.onDiagnostic("narrator-source", { pageNumber: page.pageNumber, narratorFile: narratorAudio.split("/").at(-1) });
      await this.playAudio(narratorAudio, playbackId);
      if (playbackId === this.playbackId) this.onEnd();
      return true;
    } catch (error) {
      this.onDiagnostic("narrator-play-error", { name: error?.name || "Error", message: error?.message || "" });
      if (playbackId === this.playbackId) {
        this.onError(error);
        this.onEnd();
      }
      return false;
    }
  }

  /** @param {string} src @param {number} playbackId @returns {Promise<void>} */
  playAudio(src, playbackId) {
    return new Promise((resolve, reject) => {
      this.audio = new Audio(src);
      this.audio.addEventListener("canplay", () => this.onDiagnostic("narrator-canplay"), { once: true });
      const finish = () => {
        if (playbackId === this.playbackId) this.stopActivePlayback = null;
        this.onDiagnostic("narrator-ended");
        resolve();
      };
      this.audio.addEventListener("ended", finish, { once: true });
      this.audio.addEventListener("error", () => reject(new Error("NARRATOR_AUDIO_ERROR")), { once: true });
      this.stopActivePlayback = finish;
      this.audio.play().then(() => this.onDiagnostic("narrator-play-started")).catch(reject);
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
