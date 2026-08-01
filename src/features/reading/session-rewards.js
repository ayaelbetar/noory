export const COINS_PER_SUCCESSFUL_PAGE = 5;

function uniquePageIds(pageIds = []) {
  return [...new Set(pageIds.filter((pageId) => typeof pageId === "string" && pageId.trim()))];
}

/**
 * The list of successful page IDs is the only reward source of truth.  Stars
 * and coins are derived so retries, navigation, and UI events cannot add
 * duplicate rewards.
 */
export function getSessionRewards(successfulPageIds = []) {
  const uniqueSuccessfulPageIds = uniquePageIds(successfulPageIds);
  const sessionStars = uniqueSuccessfulPageIds.length;

  return {
    successfulPageIds: uniqueSuccessfulPageIds,
    sessionStars,
    sessionCoins: sessionStars * COINS_PER_SUCCESSFUL_PAGE
  };
}

export function recordSuccessfulPage(successfulPageIds, pageId) {
  return getSessionRewards([...uniquePageIds(successfulPageIds), pageId]);
}

/** Non-success outcomes—including narrator playback—never change rewards. */
export function applyPageOutcomeReward(successfulPageIds, pageId, outcome) {
  return outcome === "SUCCESS"
    ? recordSuccessfulPage(successfulPageIds, pageId)
    : getSessionRewards(successfulPageIds);
}

/**
 * UI navigation is never evidence of a completed page. A reward requires the
 * evaluator's complete, confirmed result—not just a screen transition.
 */
export function applyConfirmedEvaluationReward(successfulPageIds, pageId, evaluation) {
  const isConfirmedSuccess = evaluation?.outcome === "SUCCESS" &&
    evaluation?.passed === true &&
    ["passed", "correct"].includes(evaluation?.status);

  return isConfirmedSuccess
    ? recordSuccessfulPage(successfulPageIds, pageId)
    : getSessionRewards(successfulPageIds);
}

export function calculateFinalReadingScore(successfulPageIds, totalBookPages) {
  const total = Number(totalBookPages) || 0;
  if (total <= 0) return 0;
  return uniquePageIds(successfulPageIds).length / total;
}

/** One source of truth for final score, stars, and child-facing page totals. */
export function getFinalReadingSummary(pages = [], successfulPageIds = []) {
  const scoredPageIds = new Set((pages || [])
    .filter((page) => page?.scoreInFinal !== false)
    .map((page) => page?.id)
    .filter(Boolean));
  const successfulIds = uniquePageIds(successfulPageIds)
    .filter((pageId) => scoredPageIds.has(pageId));
  const totalScoredPages = scoredPageIds.size;
  const successfulPages = successfulIds.length;
  const needsPracticePages = Math.max(0, totalScoredPages - successfulPages);

  return {
    totalScoredPages,
    successfulPages,
    needsPracticePages,
    scorePercent: totalScoredPages > 0 ? Math.round((successfulPages / totalScoredPages) * 100) : 0,
    successfulPageIds: successfulIds
  };
}
