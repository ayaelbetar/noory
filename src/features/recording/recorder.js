/**
 * Owns one browser microphone attempt: permission, MediaRecorder chunks, audio
 * level metering, optional Arabic Web Speech recognition, and deterministic
 * cleanup. It never evaluates audio or changes the reading Retry count.
 */
export class RecordingController {
  constructor({ onLevel = () => {}, onTranscript = () => {}, onStatus = () => {} } = {}) {
    this.onLevel = onLevel;
    this.onTranscript = onTranscript;
    this.onStatus = onStatus;
    this.mediaRecorder = null;
    this.stream = null;
    this.chunks = [];
    this.startedAt = 0;
    this.audioContext = null;
    this.animationFrame = 0;
    this.recognition = null;
    this.transcript = "";
    this.maxLevel = 0;
  }

  /** @returns {boolean} Whether the current browser can capture microphone audio. */
  static isMediaRecorderSupported() {
    return Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
  }

  /** @returns {boolean} Whether browser-provided speech recognition is available. */
  static isSpeechRecognitionSupported() {
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * Requests microphone access and starts the recorder, level meter, and optional
   * Arabic transcript. Rejects with `MEDIA_RECORDER_UNAVAILABLE` when unsupported.
   *
   * @returns {Promise<void>}
   */
  async start() {
    if (!RecordingController.isMediaRecorderSupported()) {
      throw new Error("MEDIA_RECORDER_UNAVAILABLE");
    }

    this.cleanup();
    this.chunks = [];
    this.transcript = "";
    this.maxLevel = 0;
    this.startedAt = performance.now();
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    });

    this.mediaRecorder = new MediaRecorder(this.stream);
    this.mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data?.size) this.chunks.push(event.data);
    });

    this.startMeter();
    this.startSpeechRecognition();
    this.mediaRecorder.start(250);
    this.onStatus("recording");
  }

  /**
   * Stops capture and returns an in-memory recording result for client validation.
   * The returned object URL is temporary and must be released by the session owner.
   *
   * @returns {Promise<{ blob: Blob, audioUrl: string, durationMs: number, maxLevel: number, transcript: string }>}
   */
  async stop() {
    if (!this.mediaRecorder || this.mediaRecorder.state === "inactive") {
      throw new Error("NOT_RECORDING");
    }

    const stopped = new Promise((resolve) => {
      this.mediaRecorder.addEventListener("stop", () => {
        const blob = new Blob(this.chunks, { type: this.mediaRecorder.mimeType || "audio/webm" });
        const result = {
          blob,
          audioUrl: URL.createObjectURL(blob),
          durationMs: performance.now() - this.startedAt,
          maxLevel: this.maxLevel,
          transcript: this.transcript.trim()
        };
        this.cleanup();
        resolve(result);
      }, { once: true });
    });

    this.stopSpeechRecognition();
    this.mediaRecorder.stop();
    return stopped;
  }

  /** Starts optional browser STT; recording remains usable when it is unavailable. */
  startSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.onStatus("speech-unavailable");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = "ar-SA";
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.addEventListener("result", (event) => {
      let text = "";
      for (let index = 0; index < event.results.length; index += 1) {
        text += event.results[index][0]?.transcript || "";
      }
      this.transcript = text;
      this.onTranscript(this.transcript);
    });
    this.recognition.addEventListener("error", () => this.onStatus("speech-error"));

    try { this.recognition.start(); } catch { this.onStatus("speech-error"); }
  }

  /** Stops optional speech recognition without affecting the recorded media stream. */
  stopSpeechRecognition() {
    if (!this.recognition) return;
    try { this.recognition.stop(); } catch { this.recognition.abort(); }
    this.recognition = null;
  }

  /** Samples microphone energy for UI feedback and local silence/noise safeguards. */
  startMeter() {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) return;
    this.audioContext = new AudioContextConstructor();
    const source = this.audioContext.createMediaStreamSource(this.stream);
    const analyser = this.audioContext.createAnalyser();
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.fftSize = 512;
    source.connect(analyser);

    const tick = () => {
      analyser.getByteFrequencyData(data);
      const average = data.reduce((sum, value) => sum + value, 0) / data.length;
      const level = Math.min(100, Math.max(8, average * 2.4));
      this.maxLevel = Math.max(this.maxLevel, level);
      this.onLevel(level);
      this.animationFrame = requestAnimationFrame(tick);
    };
    tick();
  }

  /** Stops browser resources; safe to call repeatedly during navigation or failure recovery. */
  cleanup() {
    this.stopSpeechRecognition();
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = 0;
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }
}
