/**
 * Converts a reading outcome into a child-facing state and approved copy keys.
 * Narration is required only after a genuine Retry outcome, never for a technical failure.
 *
 * @param {{ outcome: "SUCCESS" | "RETRY", offerContinue?: boolean }} result
 * @returns {{ state: string, requiresNarrator: boolean, actionKey: string, [key: string]: unknown }}
 */
export function createFeedbackPresentation(result) {
  if (result.outcome === "SUCCESS") {
    return {
      state: "success",
      requiresNarrator: false,
      bubbleKeys: ["success.01", "success.02", "success.05"],
      stripKey: "success.04",
      actionKey: "cta.next_page",
      popup: {
        tone: "success",
        mark: "✦",
        titleKey: "success.02",
        bodyKey: "success.05"
      }
    };
  }

  if (result.offerContinue) {
    return {
      state: "continue",
      requiresNarrator: true,
      preNarratorKey: "retry.01",
      narratorKey: "narrator.01",
      postNarratorKey: "continue.01",
      stripKey: "continue.02",
      actionKey: "cta.continue_reading",
      popup: {
        tone: "continue",
        mark: "✦",
        titleKey: "continue.01",
        bodyKey: "continue.02"
      }
    };
  }

  return {
    state: "retry",
    requiresNarrator: true,
    preNarratorKey: "retry.01",
    narratorKey: "narrator.01",
    postNarratorKey: "narrator.02",
    stripKey: "retry.04",
    actionKey: "cta.retry",
    popup: {
      tone: "retry",
      mark: "✦",
      titleKey: "retry.01",
      bodyKey: "narrator.01"
    }
  };
}

/** Main validation checkpoints used by the POC flow and tests. */
export const validationCheckpoints = [
  "mic_permission",
  "recording_started",
  "recording_stopped",
  "audio_playback_ready",
  "evaluation_success_message",
  "evaluation_retry_message",
  "encouragement_popup_success",
  "encouragement_popup_retry",
  "narrator_correct_page",
  "continue_after_three_retries"
];
