import test from "node:test";
import assert from "node:assert/strict";
import {
  applyConfirmedEvaluationReward,
  applyPageOutcomeReward,
  calculateFinalReadingScore,
  getSessionRewards,
  recordSuccessfulPage
} from "../src/features/reading/session-rewards.js";

test("one successful page gives one star and five coins", () => {
  assert.deepEqual(recordSuccessfulPage([], "page-1"), {
    successfulPageIds: ["page-1"], sessionStars: 1, sessionCoins: 5
  });
});

test("five unique successful pages give five stars and twenty-five coins", () => {
  assert.deepEqual(getSessionRewards(["p1", "p2", "p3", "p4", "p5"]), {
    successfulPageIds: ["p1", "p2", "p3", "p4", "p5"], sessionStars: 5, sessionCoins: 25
  });
});

test("retrying or revisiting a successful page does not duplicate its reward", () => {
  const initial = recordSuccessfulPage([], "page-1");
  assert.deepEqual(recordSuccessfulPage(initial.successfulPageIds, "page-1"), initial);
});

test("success after Try Again rewards a page exactly once", () => {
  const retry = applyPageOutcomeReward([], "page-1", "RETRY");
  const success = applyPageOutcomeReward(retry.successfulPageIds, "page-1", "SUCCESS");
  assert.equal(success.sessionStars, 1);
  assert.equal(success.sessionCoins, 5);
});

test("Needs Practice, uncertain, narrator playback, and recording attempts never add a success reward", () => {
  for (const outcome of ["RETRY", "NEEDS_PRACTICE", "UNCERTAIN", "NOT_CALIBRATED", "NARRATOR_PLAYBACK", "RECORDING_ATTEMPT", "SKIPPED"]) {
    const reward = applyPageOutcomeReward([], "page-1", outcome);
    assert.equal(reward.sessionStars, 0);
    assert.equal(reward.sessionCoins, 0);
  }
});

test("only a confirmed evaluator success can add a page reward", () => {
  const skipped = applyConfirmedEvaluationReward([], "page-1", null);
  const staleSuccess = applyConfirmedEvaluationReward([], "page-1", { outcome: "SUCCESS", passed: false, status: "needs-practice" });
  const confirmed = applyConfirmedEvaluationReward([], "page-1", { outcome: "SUCCESS", passed: true, status: "passed" });

  assert.equal(skipped.sessionStars, 0);
  assert.equal(staleSuccess.sessionStars, 0);
  assert.deepEqual(confirmed, { successfulPageIds: ["page-1"], sessionStars: 1, sessionCoins: 5 });
});

test("a new session starts with zero totals", () => {
  assert.deepEqual(getSessionRewards(), { successfulPageIds: [], sessionStars: 0, sessionCoins: 0 });
});

test("final reading score is separate from coins", () => {
  assert.equal(calculateFinalReadingScore(["p1", "p2"], 5), 0.4);
});
