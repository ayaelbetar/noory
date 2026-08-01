/**
 * Owns one browser microphone attempt: permission, MediaRecorder chunks, audio
 * level metering, optional Arabic Web Speech recognition, and deterministic
 * cleanup. It never evaluates audio or changes the reading Retry count.
 */
export class RecordingController {
  constructor({ onLevel = () => {}, onTranscript = () => {}, onStatus = () => {}, onDiagnostic = () => {} } = {}) {
    this.onLevel = onLevel;
    this.onTranscript = onTranscript;
    this.onStatus = onStatus;
    this.onDiagnostic = onDiagnostic;
    this.mediaRecorder = null;
    this.stream = null;
    this.chunks = [];
    this.startedAt = 0;
    this.audioContext = null;
    this.animationFrame = 0;
    this.recognition = null;
    this.transcript = "";
    this.confirmedTranscript = "";
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
    this.confirmedTranscript = "";
    this.maxLevel = 0;
    this.startedAt = performance.now();
    this.onDiagnostic("microphone-requested");
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
    } catch (error) {
      this.onDiagnostic("microphone-error", { name: error?.name, message: error?.message });
      throw error;
    }
    const track = this.stream.getAudioTracks()[0];
    this.onDiagnostic("microphone-ready", { trackCount: this.stream.getAudioTracks().length, readyState: track?.readyState || "missing" });

    this.mediaRecorder = new MediaRecorder(this.stream);
    this.onDiagnostic("media-recorder-created", { mimeType: this.mediaRecorder.mimeType || "browser-default" });
    this.mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data?.size) this.chunks.push(event.data);
      this.onDiagnostic("media-recorder-data", { mimeType: event.data?.type || "", byteSize: event.data?.size || 0 });
    });

    this.startMeter();
    this.startSpeechRecognition();
    this.mediaRecorder.start(250);
    this.onDiagnostic("media-recorder-started", { mimeType: this.mediaRecorder.mimeType || "browser-default" });
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
        this.onDiagnostic("media-recorder-stopped", { mimeType: blob.type, byteSize: blob.size, durationMs: Math.round(result.durationMs) });
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
      this.onDiagnostic("speech-unavailable");
      this.onStatus("speech-unavailable");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.onDiagnostic("speech-recognition-created", { language: "ar-SA" });
    this.recognition.lang = "ar-SA";
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    for (const eventName of ["start", "audiostart", "soundstart", "speechstart", "speechend", "soundend", "audioend", "end"]) {
      this.recognition.addEventListener(eventName, () => this.onDiagnostic(`speech-${eventName}`));
    }
    this.recognition.addEventListener("result", (event) => {
      let text = "";
      let isFinal = true;
      let confidence = 0;
      let confirmedText = "";
      let confirmedConfidence = 0;
      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const resultText = result[0]?.transcript || "";
        text = `${text} ${resultText}`.trim();
        isFinal = isFinal && Boolean(result.isFinal);
        confidence = Math.max(confidence, Number(result[0]?.confidence) || 0);
        if (result.isFinal) {
          confirmedText = `${confirmedText} ${resultText}`.trim();
          confirmedConfidence = Math.max(confirmedConfidence, Number(result[0]?.confidence) || 0);
        }
      }
      this.transcript = text;
      this.confirmedTranscript = confirmedText;
      this.onTranscript({
        text: this.transcript,
        isFinal,
        confidence,
        confirmedText: this.confirmedTranscript,
        confirmedConfidence
      });
      this.onDiagnostic("speech-result", { isFinal, resultCount: event.results.length });
    });
    this.recognition.addEventListener("error", (event) => {
      this.onDiagnostic("speech-error", { error: event.error || "unknown", message: event.message || "" });
      this.onStatus("speech-error");
    });

    try { this.recognition.start(); this.onDiagnostic("speech-recognition-started"); } catch (error) { this.onDiagnostic("speech-start-error", { name: error?.name, message: error?.message }); this.onStatus("speech-error"); }
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
