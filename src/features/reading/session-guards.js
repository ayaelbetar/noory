export const MAX_RECORDING_SECONDS = 120;
export const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
export const MAX_EVALUATIONS_PER_SESSION = 40;
export const MIN_RECORDING_MS = 1000;

/**
 * Ensures content configuration supplies visible text before a child records.
 * Missing content is a technical/content failure, never a Retry outcome.
 *
 * @param {unknown} expectedText
 * @returns {string} An empty string when text is available, otherwise a failure code.
 */
export function validateExpectedText(expectedText) {
  return String(expectedText || "").trim() ? "" : "EVALUATION_FAILED";
}

/**
 * Validates a completed browser recording before it reaches evaluation.
 * Technical failures remain separate from the child's Retry outcome.
 *
 * @param {{ durationMs?: number, blob?: { size?: number, type?: string } } | null} recording
 * @returns {string} An empty string when valid, otherwise a failure code.
 */
export function validateRecording(recording) {
  if (!recording || recording.durationMs < MIN_RECORDING_MS) return "INVALID_AUDIO";
  if (!recording.blob || !recording.blob.size) return "EMPTY_AUDIO";
  if (recording.blob.size > MAX_AUDIO_BYTES) return "PAYLOAD_TOO_LARGE";

  // A browser POC may record WebM/OGG while the production encoder contract is
  // configured by the host. Accept common browser recorder types, reject unknown
  // or corrupt blobs before they can enter the evaluation path.
  const mime = String(recording.blob.type || "").toLowerCase();
  if (mime && !/^audio\/(webm|ogg|wav|mp4|mpeg)/.test(mime)) return "UNSUPPORTED_FORMAT";
  return "";
}

/**
 * Prevents duplicate local evaluations and applies the POC session cost cap.
 *
 * @param {{ submissionInFlight: boolean, evaluations: number }} state
 * @returns {boolean} Whether a new evaluation may begin.
 */
export function canSubmit({ submissionInFlight, evaluations }) {
  return !submissionInFlight && evaluations < MAX_EVALUATIONS_PER_SESSION;
}

/**
 * Maps an internal technical failure code to child-safe Arabic copy.
 *
 * @param {string} code
 * @returns {string} A key from the approved message library.
 */
export function failureMessageKey(code) {
  if (["NETWORK_ERROR", "AI_TIMEOUT", "STT_FAILED", "EVALUATION_FAILED", "UPSTREAM_ERROR", "SERVICE_UNAVAILABLE"].includes(code)) {
    return code === "NETWORK_ERROR" ? "network.01" : "network.02";
  }
  return code === "LOW_CONFIDENCE" ? "retry.02" : "retry.01";
}

/** @param {string} code @returns {boolean} Whether the value is a technical failure. */
export function isTechnicalFailure(code) {
  return Boolean(code);
}
