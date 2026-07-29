import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { messages } from "../src/core/messages.js";
import {
  createFeedbackPresentation,
  validationCheckpoints
} from "../src/features/reading/feedback.js";

describe("Reading feedback validation", () => {
  it("uses encouraging Success messages and never requires narrator", () => {
    const presentation = createFeedbackPresentation({ outcome: "SUCCESS" });

    assert.equal(presentation.state, "success");
    assert.equal(presentation.requiresNarrator, false);
    assert.ok(presentation.bubbleKeys.every((key) => key.startsWith("success.")));
    assert.equal(presentation.stripKey, "success.04");
    assert.equal(presentation.actionKey, "cta.next_page");
    assert.equal(presentation.popup.tone, "success");
  });

  it("uses encouraging Retry messages before and after automatic narrator playback", () => {
    const presentation = createFeedbackPresentation({
      outcome: "RETRY",
      offerContinue: false
    });

    assert.equal(presentation.state, "retry");
    assert.equal(presentation.requiresNarrator, true);
    assert.equal(presentation.preNarratorKey, "retry.01");
    assert.equal(presentation.narratorKey, "narrator.01");
    assert.equal(presentation.postNarratorKey, "narrator.02");
    assert.equal(presentation.stripKey, "retry.04");
    assert.equal(presentation.actionKey, "cta.retry");
    assert.equal(presentation.popup.tone, "retry");
  });

  it("keeps third Retry supportive and offers Continue", () => {
    const presentation = createFeedbackPresentation({
      outcome: "RETRY",
      offerContinue: true
    });

    assert.equal(presentation.state, "continue");
    assert.equal(presentation.requiresNarrator, true);
    assert.equal(presentation.preNarratorKey, "retry.01");
    assert.equal(presentation.postNarratorKey, "continue.01");
    assert.equal(presentation.stripKey, "continue.02");
    assert.equal(presentation.actionKey, "cta.continue_reading");
    assert.equal(presentation.popup.tone, "continue");
  });

  it("has Arabic copy for every feedback key used by validation", () => {
    const allKeys = [
      ...createFeedbackPresentation({ outcome: "SUCCESS" }).bubbleKeys,
      createFeedbackPresentation({ outcome: "SUCCESS" }).stripKey,
      createFeedbackPresentation({ outcome: "RETRY", offerContinue: false }).preNarratorKey,
      createFeedbackPresentation({ outcome: "RETRY", offerContinue: false }).narratorKey,
      createFeedbackPresentation({ outcome: "RETRY", offerContinue: false }).postNarratorKey,
      createFeedbackPresentation({ outcome: "RETRY", offerContinue: false }).stripKey,
      createFeedbackPresentation({ outcome: "RETRY", offerContinue: true }).postNarratorKey,
      createFeedbackPresentation({ outcome: "RETRY", offerContinue: true }).stripKey
    ];

    allKeys.forEach((key) => {
      assert.equal(typeof messages[key], "string", key);
      assert.match(messages[key], /[\u0600-\u06ff]/u, key);
    });
  });

  it("tracks the main validation checkpoints for the POC flow", () => {
    assert.deepEqual(validationCheckpoints, [
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
    ]);
  });
});
