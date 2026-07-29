import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAX_AUDIO_BYTES,
  MAX_EVALUATIONS_PER_SESSION,
  canSubmit,
  failureMessageKey,
  validateExpectedText,
  validateRecording
} from "../src/features/reading/session-guards.js";

describe("reading session edge-case guards", () => {
  it("rejects short, empty, oversized, and unsupported recordings before evaluation", () => {
    assert.equal(validateRecording({ durationMs: 500, blob: { size: 10, type: "audio/webm" } }), "INVALID_AUDIO");
    assert.equal(validateRecording({ durationMs: 1500, blob: { size: 0, type: "audio/webm" } }), "EMPTY_AUDIO");
    assert.equal(validateRecording({ durationMs: 1500, blob: { size: MAX_AUDIO_BYTES + 1, type: "audio/webm" } }), "PAYLOAD_TOO_LARGE");
    assert.equal(validateRecording({ durationMs: 1500, blob: { size: 10, type: "video/mp4" } }), "UNSUPPORTED_FORMAT");
  });

  it("accepts a browser audio blob and blocks duplicate or over-limit evaluations", () => {
    assert.equal(validateRecording({ durationMs: 1500, blob: { size: 10, type: "audio/webm" } }), "");
    assert.equal(canSubmit({ submissionInFlight: false, evaluations: MAX_EVALUATIONS_PER_SESSION - 1 }), true);
    assert.equal(canSubmit({ submissionInFlight: true, evaluations: 0 }), false);
    assert.equal(canSubmit({ submissionInFlight: false, evaluations: MAX_EVALUATIONS_PER_SESSION }), false);
  });

  it("maps technical failures to child-safe message families", () => {
    assert.equal(failureMessageKey("NETWORK_ERROR"), "network.01");
    assert.equal(failureMessageKey("AI_TIMEOUT"), "network.02");
    assert.equal(failureMessageKey("LOW_CONFIDENCE"), "retry.02");
    assert.equal(failureMessageKey("EMPTY_AUDIO"), "retry.01");
  });

  it("rejects missing page text before a recording can be evaluated", () => {
    assert.equal(validateExpectedText(""), "EVALUATION_FAILED");
    assert.equal(validateExpectedText("   "), "EVALUATION_FAILED");
    assert.equal(validateExpectedText("هذا قمر جميل"), "");
  });
});
