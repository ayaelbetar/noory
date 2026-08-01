import { t, toArabicNumber } from "./core/messages.js";
import { books } from "./data/books.js";
import { track } from "./features/analytics/analytics.js";
import { normalizeArabic } from "./features/reading/evaluator.js";
import { evaluateChildReading } from "./features/reading/reading-evaluation-service.js";
import { alignLiveReading, getConfirmedReadingCompletion } from "./features/reading/live-highlighting.js";
import { createFeedbackPresentation } from "./features/reading/feedback.js";
import {
  applyConfirmedEvaluationReward,
  getFinalReadingSummary,
  getSessionRewards
} from "./features/reading/session-rewards.js";
import {
  MAX_RECORDING_SECONDS,
  canSubmit,
  failureMessageKey,
  validateExpectedText,
  validateRecording
} from "./features/reading/session-guards.js";
import { RecordingController } from "./features/recording/recorder.js";
import { NarratorService } from "./features/playback/narrator.js";

const app = document.querySelector("#app");
const CHILD_NAME_STORAGE_KEY = "noory.childName";
const NAME_PROMPT_SEEN_STORAGE_KEY = "noory.namePromptSeen";
// Deliberately off for the submitted POC. Nouri stays visible with on-screen
// guidance, but no Nouri audio is requested, loaded, or played.
const NOURI_ENABLED = false;
const PARENT_CONSENT_STORAGE_KEY = "noory.readWithNoorConsent";
const SESSION_STORAGE_KEY = "noory.readWithNoorSession";
const EVALUATION_TIMEOUT_MS = 30_000;
// The letter book is fully available. Only its isolated short-vowel activities
// use the conservative experimental flow and never claim unverified success.
const visibleBooks = books;
const discoveryItems = [
  { label: "هو الحبيب", className: "category-cover prophet", action: "", imageUrl: "./assets/images/noory-categories/ho-el-habib.jfif" },
  { label: "اقرأ مع نور", className: "category-cover noor-feature", action: "noor" },
  { label: "محتوى آمن", className: "category-cover safe", action: "", imageUrl: "./assets/images/noory-categories/safe-content.jfif" },
  { label: "محتوى مراجع", className: "category-cover reviewed", action: "", imageUrl: "./assets/images/noory-categories/reviewed-content.jfif" }
];
const radioItems = [
  {
    title: "كوكب العجائب - الحركة",
    meta: "١٢ كتاب",
    quality: "عالية",
    imageUrl: "./assets/images/noory-radio/kokab-alajaaeb-alharaka.jpg"
  },
  {
    title: "حكاية حمزة الفلسطيني",
    meta: "٤ كتب",
    isNooryOriginal: true,
    imageUrl: "./assets/images/noory-radio/hikayat-hamza-palestini.jfif"
  },
  {
    title: "مغامرات مشبك في رمضان",
    meta: "٩ كتب",
    imageUrl: "./assets/images/noory-radio/moghamarat-mashbak-ramadan.jfif"
  },
  {
    title: "ماري كوري: أسطورة امرأة",
    meta: "٣ كتب",
    isNooryOriginal: true,
    imageUrl: "./assets/images/noory-radio/marie-curie-legendary-woman.jpg"
  }
];
const state = {
  screen: "home",
  phase: "idle",
  book: null,
  pageIndex: 0,
  pageResults: [],
  pageRetryCounts: {},
  successfulPageIds: [],
  earnedStars: 0,
  earnedCoins: 0,
  questionAnswers: {},
  questionResult: null,
  sessionStartedAt: 0,
  recorder: null,
  recorderLevel: 10,
  recordingSeconds: 0,
  recordingTimerId: 0,
  liveTranscript: "",
  liveTranscriptIsFinal: false,
  liveTranscriptConfidence: 0,
  confirmedTranscript: "",
  confirmedTranscriptConfidence: 0,
  autoCompletionTimerId: 0,
  autoCompletionPending: false,
  autoCompleting: false,
  autoCompletionToken: 0,
  manualTranscript: "",
  recording: null,
  recordingPlaybackStatus: "idle",
  feedback: null,
  noorMessage: "welcome.01",
  narratorPlaying: false,
  toast: "",
  feedbackPopup: null,
  childName: loadChildName(),
  namePromptSeen: hasSeenNamePrompt(),
  featureSettingsOpen: false,
  encouragementMessageCount: 0,
  lastPersonalizedMessageKey: "",
  currentMessageUsesName: false,
  parentConsent: loadParentConsent(),
  sessionEvaluations: 0,
  submissionInFlight: false,
  processingToken: 0,
  sessionCompleted: false,
  stopInFlight: false,
  offline: !navigator.onLine,
  resumedSession: loadSessionSnapshot()
};

const narrator = new NarratorService({
  onStart: () => {
    state.narratorPlaying = true;
    render();
  },
  onEnd: () => {
    state.narratorPlaying = false;
    render();
  },
  onError: () => {
    state.noorMessage = "network.02";
    state.toast = "";
  }
});

function currentPage() {
  return state.book?.pages[state.pageIndex] || null;
}

function loadChildName() {
  try {
    return String(window.localStorage.getItem(CHILD_NAME_STORAGE_KEY) || "").trim();
  } catch {
    return "";
  }
}

function saveChildName(name) {
  state.childName = String(name || "").trim().slice(0, 30);
  try {
    if (state.childName) window.localStorage.setItem(CHILD_NAME_STORAGE_KEY, state.childName);
    else window.localStorage.removeItem(CHILD_NAME_STORAGE_KEY);
  } catch {
    // Local storage may be unavailable in private or embedded browser contexts.
  }
}

function hasSeenNamePrompt() {
  try {
    return window.localStorage.getItem(NAME_PROMPT_SEEN_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function completeNamePrompt() {
  state.namePromptSeen = true;
  try {
    window.localStorage.setItem(NAME_PROMPT_SEEN_STORAGE_KEY, "true");
  } catch {
    // The experience still continues if browser storage is unavailable.
  }
}

function loadParentConsent() {
  try {
    return window.localStorage.getItem(PARENT_CONSENT_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function saveParentConsent(granted) {
  state.parentConsent = Boolean(granted);
  try {
    window.localStorage.setItem(PARENT_CONSENT_STORAGE_KEY, String(state.parentConsent));
  } catch {
    // The current visit still observes the selection if storage is unavailable.
  }
}

function loadSessionSnapshot() {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    const snapshot = raw ? JSON.parse(raw) : null;
    return snapshot && snapshot.bookId && Number.isInteger(snapshot.pageIndex) ? snapshot : null;
  } catch {
    return null;
  }
}

function syncSessionRewards() {
  const rewards = getSessionRewards(state.successfulPageIds);
  state.successfulPageIds = rewards.successfulPageIds;
  state.earnedStars = rewards.sessionStars;
  state.earnedCoins = rewards.sessionCoins;
  return rewards;
}

function successfulPageIdsFromLegacySnapshot(snapshot, book) {
  if (Array.isArray(snapshot?.successfulPageIds)) return snapshot.successfulPageIds;
  return (snapshot?.pageResults || []).flatMap((result, index) => (
    result?.status === "success" && book.pages[index] ? [book.pages[index].id] : []
  ));
}

/**
 * Saves only safe, resumable session progress—not audio or transcripts.
 * A resumed session always returns to Idle so narration/evaluation never resumes
 * without a new child action.
 */
function persistSession() {
  if (!state.book || state.sessionCompleted) return;
  syncSessionRewards();
  const snapshot = {
    bookId: state.book.id,
    pageIndex: state.pageIndex,
    pageResults: state.pageResults,
    pageRetryCounts: state.pageRetryCounts,
    successfulPageIds: state.successfulPageIds,
    earnedStars: state.earnedStars,
    earnedCoins: state.earnedCoins,
    questionAnswers: state.questionAnswers,
    sessionEvaluations: state.sessionEvaluations,
    savedAt: Date.now()
  };
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(snapshot));
    state.resumedSession = snapshot;
  } catch {
    // Recovery remains best-effort in constrained browser contexts.
  }
}

function clearSessionSnapshot() {
  try { window.localStorage.removeItem(SESSION_STORAGE_KEY); } catch { /* no-op */ }
  state.resumedSession = null;
}

function noorMessage(key) {
  const message = t(key);
  const supportsName = /^(welcome|before|listen|success|retry|continue|complete)\./.test(key);
  if (state.lastPersonalizedMessageKey !== key) {
    state.lastPersonalizedMessageKey = key;
    if (supportsName) {
      state.encouragementMessageCount += 1;
      // Personalization is a warm accent, not a repeated prefix on every line.
      state.currentMessageUsesName = state.encouragementMessageCount % 4 === 0;
    } else {
      state.currentMessageUsesName = false;
    }
  }

  if (!state.childName || !supportsName || !state.currentMessageUsesName) return message;
  if (key.startsWith("success.")) return `أحسنت يا ${state.childName}! ${message}`;
  if (key.startsWith("retry.")) return `هيا نحاول مرة أخرى يا ${state.childName}. ${message}`;
  if (key.startsWith("welcome.")) return `أهلًا يا ${state.childName}! ${message}`;
  return `${message} يا ${state.childName}`;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[character]));
}

function resetAttempt() {
  cancelAutomaticCompletion();
  releaseRecordingUrl();
  state.recordingPlaybackStatus = "idle";
  state.recorderLevel = 10;
  stopRecordingTimer();
  state.recordingSeconds = 0;
  state.liveTranscript = "";
  state.liveTranscriptIsFinal = false;
  state.liveTranscriptConfidence = 0;
  state.confirmedTranscript = "";
  state.confirmedTranscriptConfidence = 0;
  state.manualTranscript = "";
  state.recording = null;
  state.feedback = null;
  state.questionResult = null;
  state.toast = "";
}

function cancelAutomaticCompletion() {
  state.autoCompletionToken += 1;
  if (state.autoCompletionTimerId) window.clearTimeout(state.autoCompletionTimerId);
  state.autoCompletionTimerId = 0;
  state.autoCompletionPending = false;
  state.autoCompleting = false;
}

function latestConfirmedReadingCompletion() {
  const page = currentPage();
  if (!page || !state.confirmedTranscript) {
    return { completion: 0, missingWords: [], orderCorrect: false, allWordsConfirmed: false };
  }
  return getConfirmedReadingCompletion(page.expectedText, state.confirmedTranscript, {
    confidence: state.confirmedTranscriptConfidence
  });
}

/** Stops only after stable, final child-microphone word matches cover the page. */
function checkAutomaticCompletion() {
  if (state.phase !== "recording" || state.stopInFlight || state.autoCompleting) return;
  const current = latestConfirmedReadingCompletion();

  if (!current.allWordsConfirmed) {
    if (state.autoCompletionPending) {
      cancelAutomaticCompletion();
      render();
    }
    return;
  }

  if (state.autoCompletionPending) return;
  const token = ++state.autoCompletionToken;
  state.autoCompletionPending = true;
  render();
  state.autoCompletionTimerId = window.setTimeout(async () => {
    state.autoCompletionTimerId = 0;
    if (token !== state.autoCompletionToken || state.phase !== "recording") return;
    const latest = latestConfirmedReadingCompletion();
    if (!latest.allWordsConfirmed) {
      state.autoCompletionPending = false;
      render();
      return;
    }

    state.autoCompleting = true;
    render();
    await stopRecording();
  }, 800);
}

/**
 * Releases the temporary browser object URL associated with the last attempt.
 * This prevents completed or abandoned recordings from accumulating in memory.
 */
function releaseRecordingUrl() {
  if (state.recording?.audioUrl) URL.revokeObjectURL(state.recording.audioUrl);
}

/**
 * Stops capture and its timer before navigation away from a reading attempt.
 * The child never continues recording in the background after leaving the page.
 */
function cleanupActiveRecording() {
  stopRecordingTimer();
  state.recorder?.cleanup();
  state.recorder = null;
}

function goHome() {
  cancelActiveProcessing("SESSION_EXIT");
  cleanupActiveRecording();
  narrator.stop();
  state.screen = "home";
  state.phase = "idle";
  state.book = null;
  state.pageIndex = 0;
  state.pageResults = [];
  state.pageRetryCounts = {};
  state.successfulPageIds = [];
  syncSessionRewards();
  resetAttempt();
  render();
}

function goCatalog() {
  narrator.stop();
  state.screen = "catalog";
  render();
}

function goNoorIntro() {
  narrator.stop();
  state.featureSettingsOpen = false;
  state.screen = "noor-intro";
  render();
}

function openNameSetup() {
  narrator.stop();
  state.featureSettingsOpen = true;
  state.screen = "noor-intro";
  render();
}

function openDetails(bookId) {
  state.book = visibleBooks.find((book) => book.id === bookId);
  if (!state.book) return;
  state.screen = "details";
  render();
}

function goDetails() {
  cancelActiveProcessing("SESSION_EXIT");
  narrator.stop();
  cleanupActiveRecording();
  state.phase = "idle";
  resetAttempt();
  state.screen = "details";
  render();
}
function startSession() {
  if (!state.parentConsent) {
    state.toast = "نحتاج موافقة ولي الأمر قبل استخدام الميكروفون.";
    state.screen = "noor-intro";
    state.featureSettingsOpen = true;
    render();
    return;
  }
  track("reading_session_preparing", { storyId: state.book.id });
  state.screen = "session";
  state.phase = "idle";
  state.pageIndex = 0;
  state.pageResults = [];
  state.pageRetryCounts = {};
  state.successfulPageIds = [];
  syncSessionRewards();
  state.questionAnswers = {};
  state.questionResult = null;
  state.sessionStartedAt = Date.now();
  state.sessionEvaluations = 0;
  state.sessionCompleted = false;
  state.encouragementMessageCount = 0;
  state.lastPersonalizedMessageKey = "";
  state.currentMessageUsesName = false;
  state.noorMessage = "welcome.01";
  resetAttempt();
  persistSession();
  render();
}

function resumeSession() {
  const snapshot = state.resumedSession;
  const book = visibleBooks.find((item) => item.id === snapshot?.bookId);
  if (!snapshot || !book || !state.parentConsent) return;
  state.book = book;
  state.screen = "session";
  state.phase = "idle";
  state.pageIndex = Math.min(snapshot.pageIndex, book.pages.length - 1);
  state.pageResults = snapshot.pageResults || [];
  state.pageRetryCounts = snapshot.pageRetryCounts || {};
  state.successfulPageIds = successfulPageIdsFromLegacySnapshot(snapshot, book);
  syncSessionRewards();
  state.questionAnswers = snapshot.questionAnswers || {};
  state.sessionEvaluations = snapshot.sessionEvaluations || 0;
  state.sessionStartedAt = Date.now();
  resetAttempt();
  render();
}

/**
 * Starts one guarded browser recording after consent, connectivity, and content
 * checks. Any technical failure returns to Idle without changing Retry count.
 */
async function startRecording() {
  if (!state.parentConsent) {
    state.toast = "نحتاج موافقة ولي الأمر قبل استخدام الميكروفون.";
    render();
    return;
  }
  if (state.offline || !navigator.onLine) {
    handleFailure("NETWORK_ERROR");
    return;
  }
  if (state.submissionInFlight || state.phase === "recording") return;
  const pageTextFailure = validateExpectedText(currentPage()?.expectedText);
  if (pageTextFailure) {
    handleFailure(pageTextFailure);
    return;
  }
  narrator.stop();
  resetAttempt();
  state.phase = "recording";
  state.recordingSeconds = 0;
  state.noorMessage = "listen.01";
  render();

  state.recorder = new RecordingController({
    onLevel: (level) => {
      state.recorderLevel = level;
      const meter = document.querySelector("[data-meter-fill]");
      if (meter) meter.style.setProperty("--level", `${level}%`);
    },
    onTranscript: ({ text, isFinal, confidence, confirmedText = "", confirmedConfidence = 0 }) => {
      // These values come solely from the active child microphone session.
      state.liveTranscript = text;
      state.liveTranscriptIsFinal = isFinal;
      state.liveTranscriptConfidence = confidence;
      state.confirmedTranscript = confirmedText;
      state.confirmedTranscriptConfidence = confirmedConfidence;
      if (state.screen === "session" && state.phase === "recording") {
        checkAutomaticCompletion();
        render();
      }
    },
    onStatus: (status) => {
      if (status === "speech-unavailable") {
        state.noorMessage = "listen.01";
        state.toast = "";
      }
    }
  });

  try {
    await state.recorder.start();
    startRecordingTimer();
    track("page_recording_started", {
      storyId: state.book.id,
      pageId: currentPage().id,
      pageIndex: state.pageIndex
    });
  } catch {
    stopRecordingTimer();
    state.phase = "idle";
    state.noorMessage = "mic.02";
    state.toast = "";
    render();
  }
}

/**
 * Stops a single active recording, performs client validation, and submits only
 * valid audio. The stop lock prevents duplicate Done taps from creating races.
 */
async function stopRecording() {
  if (!state.recorder || state.phase !== "recording" || state.stopInFlight) return;
  state.stopInFlight = true;

  try {
    stopRecordingTimer();
    const recording = await state.recorder.stop();
    state.recording = recording;
    state.recordingPlaybackStatus = "loading";
    state.liveTranscript = recording.transcript || state.liveTranscript;
    track("page_recording_stopped", {
      storyId: state.book.id,
      pageId: currentPage().id,
      pageIndex: state.pageIndex,
      durationSeconds: Math.round(recording.durationMs / 1000)
    });
    const failure = validateRecording(recording);
    if (failure) {
      handleFailure(failure);
      return;
    }
    if (recording.maxLevel <= 10) {
      handleFailure("EMPTY_AUDIO");
      return;
    }
    if (recording.maxLevel >= 95) {
      handleFailure("LOW_CONFIDENCE");
      return;
    }
    await submitRecording();
  } catch {
    stopRecordingTimer();
    state.phase = "idle";
    state.noorMessage = "retry.01";
    render();
  } finally {
    state.stopInFlight = false;
  }
}

function deleteRecording() {
  resetAttempt();
  startRecording();
}

/**
 * Runs the local POC evaluation transition after a completed recording.
 * Processing tokens cancel stale async work when navigation, offline state, or
 * background recovery interrupts the attempt.
 */
async function submitRecording() {
  if (!state.recording || !currentPage()) return;
  if (state.offline || !navigator.onLine) {
    handleFailure("NETWORK_ERROR");
    return;
  }
  if (!canSubmit({ submissionInFlight: state.submissionInFlight, evaluations: state.sessionEvaluations })) {
    if (state.sessionEvaluations >= 40) handleFailure("EVALUATION_FAILED", "لنُكمل القراءة لاحقًا.");
    return;
  }
  const page = currentPage();
  const pageIndex = state.pageIndex;
  const childAudioUrl = state.recording.audioUrl;
  const retryCount = state.pageRetryCounts[page.id] || 0;
  const transcript = state.manualTranscript || state.liveTranscript || state.recording?.transcript || "";

  state.submissionInFlight = true;
  const processingToken = ++state.processingToken;
  state.phase = "processing";
  state.noorMessage = "loading.01";
  render();

  track("page_upload_started", { storyId: state.book.id, pageId: page.id, pageIndex });
  // Keep the transition purposeful: Noor evaluates immediately after the child
  // stops, rather than asking them to review and submit a recording first.
  const startedAt = Date.now();
  try {
    await wait(2400);
    if (processingToken !== state.processingToken || currentPage()?.id !== page.id || state.pageIndex !== pageIndex) return;
    if (Date.now() - startedAt > EVALUATION_TIMEOUT_MS) {
      handleFailure("AI_TIMEOUT");
      return;
    }
    if (state.offline || !navigator.onLine) {
      handleFailure("NETWORK_ERROR");
      return;
    }
    track("page_upload_completed", { storyId: state.book.id, pageId: page.id, pageIndex });
    state.sessionEvaluations += 1;

    const result = await evaluateChildReading({
      page,
      attempt: { pageId: page.id, childAudioUrl, transcript },
      retryCount
    });
    // The page can change only through a guarded action, but retain this
    // check after every await so an abandoned evaluation can never write its
    // feedback, result, or reward to a different page.
    if (processingToken !== state.processingToken || currentPage()?.id !== page.id || state.pageIndex !== pageIndex) return;
  if (page.activityType === "letter-sound" && result.diagnostic &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    console.info("[noory isolated-letter diagnostic]", result.diagnostic);
  }
  state.feedback = result;

  const isConfirmedSuccess = result.outcome === "SUCCESS" &&
    result.passed === true && ["passed", "correct"].includes(result.status);

  if (isConfirmedSuccess) {
    const presentation = createFeedbackPresentation(result);
    const countsForFinalScore = page.scoreInFinal !== false;
    const pageWasAlreadyRewarded = !countsForFinalScore || state.successfulPageIds.includes(page.id);
    const rewards = countsForFinalScore
      ? applyConfirmedEvaluationReward(state.successfulPageIds, page.id, result)
      : getSessionRewards(state.successfulPageIds);
    state.successfulPageIds = rewards.successfulPageIds;
    syncSessionRewards();
    state.pageResults[pageIndex] = {
      pageId: page.id,
      status: "success",
      score: result.score,
      attempts: retryCount + 1,
      reward: pageWasAlreadyRewarded ? { stars: 0, coins: 0 } : { stars: 1, coins: 5 }
    };
    state.phase = presentation.state;
    state.noorMessage = pick([...presentation.bubbleKeys, "success.06", "success.10", "success.11", "success.14"]);
    state.feedbackPopup = presentation.popup;
    track("page_outcome_success", {
      storyId: state.book.id,
      pageId: page.id,
      pageIndex,
      retryCount
    });
    render();
    persistSession();
      return;
    }

    state.pageRetryCounts[page.id] = retryCount + 1;
    track("page_outcome_retry", {
      storyId: state.book.id,
      pageId: page.id,
      pageIndex,
      retryCount: retryCount + 1
    });

    if (result.offerContinue) {
      track("page_continue_offered", { pageId: page.id, retryCount: retryCount + 1 });
    }

    persistSession();
    await playNarratorAfterRetry(result);
  } catch {
    if (processingToken === state.processingToken && currentPage()?.id === page.id && state.pageIndex === pageIndex) {
      handleFailure("EVALUATION_FAILED");
    }
  } finally {
    if (processingToken === state.processingToken && currentPage()?.id === page.id && state.pageIndex === pageIndex) {
      state.submissionInFlight = false;
    }
  }
}

/**
 * Recovers from a technical failure without entering the learning Retry flow.
 * It clears temporary audio, preserves safe progress, emits a failure event, and
 * presents one child-safe message in Noor's bubble.
 */
function handleFailure(code, customMessage = "") {
  cancelAutomaticCompletion();
  state.submissionInFlight = false;
  state.processingToken += 1;
  stopRecordingTimer();
  if (state.recorder) {
    state.recorder.cleanup();
    state.recorder = null;
  }
  if (state.recording?.audioUrl) URL.revokeObjectURL(state.recording.audioUrl);
  state.recording = null;
  state.liveTranscript = "";
  state.liveTranscriptIsFinal = false;
  state.liveTranscriptConfidence = 0;
  state.manualTranscript = "";
  state.feedback = null;
  state.phase = "idle";
  state.noorMessage = failureMessageKey(code);
  // Technical recovery copy belongs in Noor's single speech bubble. Keeping a
  // toast here duplicates the same sentence and can look like conflicting UX.
  state.toast = "";
  if (customMessage) state.noorMessage = "network.02";
  if (state.book && currentPage()) {
    track("page_failure", {
      failureCode: code,
      recoverable: true,
      storyId: state.book.id,
      pageId: currentPage().id,
      pageIndex: state.pageIndex
    });
    persistSession();
  }
  render();
}

function cancelActiveProcessing(reason = "SESSION_EXIT") {
  if (state.phase === "processing" || state.submissionInFlight) {
    state.processingToken += 1;
    state.submissionInFlight = false;
    persistSession();
    if (state.book && currentPage()) track("reading_session_interrupted", { reason, storyId: state.book.id, pageId: currentPage().id });
  }
}

/**
 * Plays current-page narrator support only after a genuine Retry outcome.
 * Noor feedback remains optional, while narrator playback remains mandatory and
 * independent from the Noor voice setting.
 */
async function playNarratorAfterRetry(result) {
  const presentation = createFeedbackPresentation(result);
  const uncalibratedLetter = currentPage()?.activityType === "letter-sound" && result.status === "not-calibrated";
  const needsPracticeLetter = currentPage()?.activityType === "letter-sound" && result.status === "needs-practice";
  state.feedbackPopup = presentation.popup;
  state.phase = "narrator";
  state.noorMessage = uncalibratedLetter ? "letter.practice_retry" : pick([presentation.preNarratorKey, "retry.05", "retry.07", "retry.14"]);
  render();
  state.noorMessage = presentation.narratorKey;
  render();
  track("narrator_started", {
    storyId: state.book.id,
    pageId: currentPage().id,
    pageIndex: state.pageIndex
  });
  await narrator.playPage(currentPage());
  // Navigation/background recovery may have cancelled playback while awaiting it.
  if (state.phase !== "narrator" || !state.book || !currentPage()) return;
  state.phase = presentation.state;
  state.noorMessage = needsPracticeLetter
    ? "letter.needs_practice"
    : uncalibratedLetter ? "letter.practice_retry" : presentation.postNarratorKey;
  render();
}

function retryPage() {
  resetAttempt();
  startRecording();
}

/** Preloads the following page's static image and narration without playing it. */
function preloadNextPage() {
  const next = state.book?.pages[state.pageIndex + 1];
  if (!next) return;
  if (next.imageUrl) {
    const image = new Image();
    image.src = next.imageUrl;
  }
  if (next.narratorAudioUrl) {
    const audio = new Audio();
    audio.preload = "auto";
    audio.src = next.narratorAudioUrl;
  }
}

function movePage(offset) {
  const nextIndex = state.pageIndex + offset;
  if (!state.book || nextIndex < 0 || nextIndex >= state.book.pages.length) return;
  if (["recording", "processing", "narrator"].includes(state.phase)) return;
  // Keep this cleanup even though the UI disables navigation in these phases:
  // it also protects against stale clicks, keyboard activation, and future UI
  // changes that call this function directly.
  cancelActiveProcessing("PAGE_NAVIGATION");
  cleanupActiveRecording();
  narrator.stop();
  state.pageIndex = nextIndex;
  state.phase = "idle";
  state.feedback = null;
  state.feedbackPopup = null;
  state.liveTranscript = "";
  state.manualTranscript = "";
  // "أنا أستمع…" is reserved for an active microphone only.
  state.noorMessage = "before.03";
  resetAttempt();
  persistSession();
  render();
}

function pageNavigation() {
  const navigationLocked = ["recording", "processing", "narrator"].includes(state.phase);
  return `<nav class="page-navigation" aria-label="التنقل بين صفحات القصة">
    <button class="secondary-button page-navigation__button page-navigation__button--previous" data-action="previous-page" ${navigationLocked || state.pageIndex === 0 ? "disabled" : ""}>
      <span class="page-navigation__chevron page-navigation__chevron--right" aria-hidden="true">&gt;</span>
      <span dir="rtl">الصفحة السابقة</span>
    </button>
    <button class="secondary-button page-navigation__button page-navigation__button--next" data-action="next-page-manual" ${navigationLocked || state.pageIndex + 1 >= state.book.pages.length ? "disabled" : ""}>
      <span dir="rtl">الصفحة التالية</span>
      <span class="page-navigation__chevron page-navigation__chevron--left" aria-hidden="true">&lt;</span>
    </button>
  </nav>`;
}

function nextPage(status = "success") {
  const page = currentPage();
  if (status === "continued" && !state.successfulPageIds.includes(page.id)) {
    state.pageResults[state.pageIndex] = {
      pageId: page.id,
      status: "continued",
      score: state.feedback?.score || 0,
      attempts: state.pageRetryCounts[page.id] || 3
    };
    track("page_continue_accepted", { pageId: page.id });
  }

  if (state.pageIndex >= state.book.pages.length - 1) {
    completeSession();
    return;
  }

  state.pageIndex += 1;
  state.phase = "idle";
  state.noorMessage = "before.03";
  resetAttempt();
  persistSession();
  render();
}

/**
 * Completes a story once and clears its resumable checkpoint before rendering the
 * final summary. The guard prevents duplicate completion events from rapid taps.
 */
function completeSession() {
  if (state.sessionCompleted) return;
  state.sessionCompleted = true;
  state.submissionInFlight = false;
  clearSessionSnapshot();
  state.screen = "summary";
  state.phase = "completed";
  state.noorMessage = "complete.01";
  const completedPages = new Set(state.pageResults
    .filter((result) => result?.status === "success" || result?.status === "continued")
    .map((result) => result.pageId)
    .filter(Boolean)).size;
  track("reading_session_completed", {
    storyId: state.book.id,
    completedPages,
    totalPages: state.book.pages.length
  });
  render();
}

function render() {
  if (state.screen === "home") renderHome();
  if (state.screen === "catalog") renderCatalog();
  if (state.screen === "noor-intro") renderNoorIntro();
  if (state.screen === "details") renderDetails();
  if (state.screen === "session") renderSession();
  if (state.screen === "summary") renderSummary();
  bindActions();
}

function renderHome() {
  app.innerHTML = `
    <main class="screen discover-screen">
      <header class="discover-topbar">
        <div class="top-actions">
          <button class="round-action crown" aria-label="المكافآت"><span aria-hidden="true">♕</span></button>
          <button class="round-action" aria-label="التحميل"><span aria-hidden="true">⇩</span></button>
        </div>
        <h1 class="discover-title">اكتشف</h1>
        <button class="round-action search" aria-label="بحث"><span aria-hidden="true">⌕</span></button>
      </header>

      <section class="category-rail" aria-label="الأقسام">
        ${discoveryItems.map(discoveryItem).join("")}
      </section>

      <button class="read-noor-feature read-noor-feature--art" data-action="noor" aria-label="ميزة جديدة: اقرأ مع نور">
        <span class="read-noor-feature-art" aria-hidden="true"></span>
        <span class="read-noor-copy">
          <span class="feature-kicker">ميزة جديدة</span>
          <strong>${t("cta.read_with_noor")}</strong>
          <span>${t("welcome.01")}</span>
        </span>
      </button>

      <section class="content-section">
        <h2>راديو نوري</h2>
        <div class="media-grid radio-rail" aria-label="برامج راديو نوري">
          ${radioItems.map(radioCard).join("")}
        </div>
      </section>

      <section class="content-section">
        <div class="section-head">
          <h2 class="section-title--compact">قصص اقرأ مع نور</h2>
        </div>
        <div class="book-shelf book-shelf--home" aria-label="قصص اقرأ مع نور">
          ${visibleBooks.map(homeBookCard).join("")}
        </div>
      </section>
    </main>
  `;
}

function renderNoorIntro() {
  const showNameSettings = !state.namePromptSeen || state.featureSettingsOpen;
  const title = state.featureSettingsOpen ? "إعدادات اقرأ مع نور" : "تعرّف على نور";
  const primaryLabel = state.featureSettingsOpen ? "حفظ التغييرات" : "ابدأ القراءة";
  app.innerHTML = `
    <main class="screen storybook-screen noor-intro-screen">
      ${topbar(title, "home")}
      <section class="noor-intro-hero">
        <span class="noor-light" aria-hidden="true"></span>
        <span class="noor-doodle moon" aria-hidden="true">☾</span>
        <span class="noor-doodle book" aria-hidden="true">📚</span>
        <span class="noor-doodle sparkle" aria-hidden="true">✦</span>
        <img src="./assets/images/noor-recording-reader-cropped.png" alt="نور">
      </section>
      <section class="noor-intro-copy" aria-live="polite">
        <p class="noor-greeting">مرحبًا! أنا نور <span aria-hidden="true">🌟</span></p>
        <p>أنا رفيقك في رحلة القراءة، وسأشجعك وأساعدك كلما احتجت.</p>
        ${showNameSettings ? `
          <label class="child-name-label" for="child-name">ما اسمك؟</label>
          <input id="child-name" class="child-name-input" type="text" maxlength="30" autocomplete="given-name" placeholder="اكتب اسمك" value="${escapeHtml(state.childName)}">
          <p class="child-name-hint">الاسم اختياري، ويمكنك تعديله لاحقًا.</p>
          <label class="consent-setting"><input id="parent-consent" type="checkbox" ${state.parentConsent ? "checked" : ""}> <span>أوافق بصفتي ولي الأمر على استخدام الميكروفون لتدريب القراءة.</span></label>
        ` : `<p class="noor-ready">هيا نبدأ رحلة قراءة جديدة! <span aria-hidden="true">📚</span></p>`}
      </section>
      <div class="controls noor-intro-actions">
        <button class="primary-button noor-read-button" data-action="save-child-name"><span aria-hidden="true">📚</span> ${primaryLabel}</button>
        <button class="secondary-button noor-contact-button" data-action="contact"><span aria-hidden="true">◔</span> تواصل معنا</button>
      </div>
      ${state.toast ? `<p class="noor-contact-note" role="status">${state.toast}</p>` : ""}
    </main>
  `;
}

function discoveryItem(item) {
  const tag = item.action ? "button" : "div";
  const action = item.action ? ` data-action="${item.action}"` : "";
  const imageUrl = item.imageUrl || (item.action ? "./assets/images/noor-recording-reader-cropped.png" : "");
  const image = imageUrl ? `<img src="${imageUrl}" alt="">` : `<span aria-hidden="true"></span>`;
  return `
    <${tag} class="category-item"${action}>
      <span class="${item.className}">${image}</span>
      <span>${item.label}</span>
    </${tag}>
  `;
}

function radioCard(item) {
  return `
    <article class="media-card" aria-label="${item.title}">
      <div class="radio-art radio-art--cover">
        <img src="${item.imageUrl}" alt="غلاف ${item.title}">
      </div>
      <div class="chip-row">
        <span class="soft-chip">جميع الأعمار</span>
        <span class="soft-chip">${item.meta}</span>
        ${item.quality ? `<span class="soft-chip">${item.quality}</span>` : ""}
        ${item.isNooryOriginal ? `<span class="noory-original" aria-label="أعمال نوري الأصلية"><span aria-hidden="true">♛</span> نوري</span>` : ""}
      </div>
    </article>
  `;
}

function homeBookCard(book) {
  return `
    <button class="home-book-card" data-action="details" data-book-id="${book.id}">
      ${bookCover(book, "home-cover")}
      <span class="chip-row home-book-meta">
        <span class="soft-chip">جميع الأعمار</span>
        <span class="noory-original" aria-label="أعمال نوري الأصلية"><span aria-hidden="true">♛</span> نوري</span>
      </span>
    </button>
  `;
}

function renderCatalog() {
  app.innerHTML = `
    <main class="screen storybook-screen catalog-screen">
      ${topbar(t("cta.read_with_noor"), "home", "edit-name")}
      <section class="feature-intro">
        <img src="./assets/images/noor-recording-reader-cropped.png" alt="نور">
        <div>
          <p class="eyebrow catalog-intro-kicker">اختَر قصتك</p>
          <h2 class="catalog-intro-title">هَيَّا نَقْرَأْ مَعَ <strong class="noor-word">نور</strong> خُطْوَةً بِخُطْوَة!</h2>
        </div>
      </section>
      <section class="library-grid reading-list" aria-label="القصص">
        ${visibleBooks.map(storyCard).join("")}
      </section>
    </main>
  `;
}

function storyCard(book) {
  return `
    <button class="story-card story-list-card" data-action="details" data-book-id="${book.id}">
      ${bookCover(book)}
      <span class="story-meta">
        <h3>${book.title}</h3>
        <span class="badge-row">
          <span class="badge">${book.level}</span>
          <span class="badge">${toArabicNumber(book.pages.length)} صفحات</span>
          <span class="badge">${toArabicNumber(book.minutes)} دقائق</span>
        </span>
      </span>
    </button>
  `;
}

function renderDetails() {
  const resumable = state.resumedSession?.bookId === state.book?.id;
  app.innerHTML = `
    <main class="screen storybook-screen details-screen">
      ${topbar("القصة", "catalog")}
      <section class="details-hero">
        ${bookCover(state.book, "details-cover")}
        <div>
          <p class="eyebrow">${state.book.level}</p>
          <h1>${state.book.title}</h1>
          <p class="lead">${state.book.id === "baa" ? "نتدرّب على الكلمات والحروف معًا." : t("welcome.02")}</p>
        </div>
      </section>
      <div class="controls">
        <button class="primary-button" data-action="start-session">${t("cta.read_with_noor")}</button>
        ${resumable ? `<button class="secondary-button" data-action="resume-session">متابعة من الصفحة ${toArabicNumber(state.resumedSession.pageIndex + 1)}</button>` : ""}
      </div>
    </main>
  `;
}

function renderSession() {
  const page = currentPage();
  const pageNumber = state.pageIndex + 1;
  const totalPages = state.book.pages.length;
  const progress = Math.round(((state.pageIndex + 1) / totalPages) * 100);
  const isNewScreen = !app.querySelector(".session-screen");

  if (isNewScreen) {
    app.innerHTML = `
      <main class="screen storybook-screen session-screen reading-app reading-page">
        <div id="session-topbar"></div>
        <div class="session-page-meta"></div>
        <div class="progress-track" aria-hidden="true">
          <div class="progress-fill"></div>
        </div>
        <section class="page-shell">
          <div class="page-scene book-media-stage" aria-label="صفحة الكتاب الأصلية"></div>
          <div class="expected-reading-text">
            <div class="target-letter-slot"></div>
            <div class="page-reading-text"></div>
          </div>
          <div id="toast-container"></div>
        </section>
        <div class="noor-row">
          ${renderNouriRecordingButton()}
          <div class="noor-bubble" role="status" aria-live="polite" aria-atomic="true"></div>
        </div>
        <div id="phase-controls-container"></div>
      </main>
    `;
  }

  app.querySelector("main").className = `screen storybook-screen session-screen reading-app reading-page phase-${state.phase}`;
  app.querySelector("#session-topbar").innerHTML = topbar(state.book.title, "details");
  app.querySelector(".session-page-meta").textContent = `الصفحة ${toArabicNumber(pageNumber)} من ${toArabicNumber(totalPages)}`;
  app.querySelector(".progress-fill").style.setProperty("--progress", `${progress}%`);
  const pageScene = app.querySelector(".page-scene");
  pageScene.innerHTML = page.imageUrl
    ? `<img class="book-page-image" src="${page.imageUrl}" alt="صفحة ${toArabicNumber(page.pageNumber)} من ${escapeHtml(state.book.title)}">`
    : "";
  const pageImage = pageScene.querySelector(".book-page-image");
  if (pageImage) pageImage.style.objectPosition = page.imagePosition || "center";
  // A one-letter exercise already displays its reading target above. Rendering
  // it again below duplicates the same letter without adding reading value.
  const isSingleLetterExercise = [...normalizeArabic(page.expectedText)].length === 1;
  app.querySelector(".page-reading-text").innerHTML = isSingleLetterExercise
    ? ""
    : renderReadingText(page.displayText || page.expectedText);
  app.querySelector(".target-letter-slot").innerHTML = renderTargetLetter(page);
  preloadNextPage();
  // The visual message keeps the saved child's name as a warm accent on every
  // fourth encouragement. Audio remains the approved fixed prompt file.
  const noorRow = app.querySelector(".noor-row");
  noorRow.innerHTML = `${renderNouriRecordingButton()}
    <div class="noor-bubble" role="status" aria-live="polite" aria-atomic="true"></div>`;
  const bubbleMessageKey = state.phase === "recording" || state.noorMessage !== "listen.01"
    ? state.noorMessage
    : "before.03";
  noorRow.querySelector(".noor-bubble").textContent = noorMessage(bubbleMessageKey);
  app.querySelector("#toast-container").innerHTML = state.toast ? `<div class="toast">${state.toast}</div>` : "";
  app.querySelector("#phase-controls-container").innerHTML = renderPhaseControls();
  const recordingPlayback = app.querySelector("[data-recording-playback]");
  if (recordingPlayback && !recordingPlayback.dataset.metadataRequested) {
    recordingPlayback.dataset.metadataRequested = "true";
    requestAnimationFrame(() => recordingPlayback.load());
  }
}

function startRecordingTimer() {
  stopRecordingTimer();
  state.recordingTimerId = window.setInterval(() => {
    state.recordingSeconds += 1;
    const timer = document.querySelector("[data-recording-timer]");
    if (timer) timer.textContent = formatRecordingTime(state.recordingSeconds);
    if (state.recordingSeconds >= MAX_RECORDING_SECONDS) {
      stopRecordingTimer();
      state.toast = "";
      stopRecording();
    }
  }, 1000);
}

function stopRecordingTimer() {
  if (state.recordingTimerId) {
    window.clearInterval(state.recordingTimerId);
    state.recordingTimerId = 0;
  }
}

function formatRecordingTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function feedbackPopupTemplate() {
  if (!state.feedbackPopup) return "";
  return `
    <div class="feedback-popup ${state.feedbackPopup.tone}" role="status">
      <span class="confetti" aria-hidden="true"></span>
      <span class="confetti c2" aria-hidden="true"></span>
      <span class="confetti c3" aria-hidden="true"></span>
      <span class="feedback-copy">
        <small>${state.feedbackPopup.tone === "success" ? "رائع!" : "محاولة جميلة!"}</small>
        <strong>${t(state.feedbackPopup.titleKey)}</strong>
        <span>${t(state.feedbackPopup.bodyKey)}</span>
      </span>
    </div>
  `;
}

function renderReadingText(text) {
  const markAllRead = state.phase === "success";
  const liveAlignment = alignLiveReading(text, state.liveTranscript, {
    isFinal: state.liveTranscriptIsFinal,
    confidence: state.liveTranscriptConfidence
  });
  const confirmedAlignment = alignLiveReading(text, state.confirmedTranscript, {
    isFinal: true,
    confidence: state.confirmedTranscriptConfidence
  });
  let wordIndex = 0;
  return String(text).split(/(\s+)/).map((part) => {
    if (!part.trim()) return part;
    const currentIndex = wordIndex++;
    const confirmed = confirmedAlignment[currentIndex] || { state: "unread" };
    const wordAlignment = markAllRead || confirmed.state === "correct"
      ? { state: "correct" }
      : liveAlignment[currentIndex] || { state: "unread" };
    const stateClass = ` reading-word--${wordAlignment.state}`;
    if (wordAlignment.state === "partial") {
      const letters = Array.from(part);
      let letterCount = 0;
      let splitAt = 0;
      for (; splitAt < letters.length; splitAt += 1) {
        if (normalizeArabic(letters[splitAt])) letterCount += 1;
        if (letterCount >= wordAlignment.partialLength) {
          splitAt += 1;
          while (splitAt < letters.length && !normalizeArabic(letters[splitAt])) splitAt += 1;
          break;
        }
      }
      const matched = escapeHtml(letters.slice(0, splitAt).join(""));
      const remaining = escapeHtml(letters.slice(splitAt).join(""));
      return `<span class="reading-word${stateClass}"><span class="reading-letter--matched">${matched}</span>${remaining}</span>`;
    }
    return `<span class="reading-word${stateClass}">${escapeHtml(part)}</span>`;
  }).join("");
}

function renderTargetLetter(page) {
  const expectedText = page.displayText || page.expectedText;
  const normalized = normalizeArabic(expectedText);
  if ([...normalized].length !== 1) return "";
  // بَ receives its neutral confirmed glow only after the final
  // narrator-reference result, never from a provisional browser transcript.
  const isHeard = Boolean(page.activityType === "letter-sound" && state.feedback?.outcome === "SUCCESS");
  return `<div class="target-letter${isHeard ? " is-heard" : ""}"><span>قُلْ:</span><strong>${escapeHtml(expectedText)}</strong></div>`;
}

/** Noor's character is a second, stable recording control for young readers. */
function renderNouriRecordingButton() {
  const completing = state.autoCompletionPending || state.autoCompleting;
  const action = !completing && state.phase === "recording"
    ? "stop-recording"
    : !completing && state.phase === "retry"
      ? "retry-page"
      : !completing && state.phase === "idle"
        ? "start-recording"
        : "";
  const label = state.phase === "recording" ? "إنهاء القراءة" : "ابدأ القراءة مع نور";
  return `<button class="session-noori-button${state.phase === "recording" ? " is-recording" : ""}"${action ? ` data-action="${action}"` : " disabled"} aria-label="${label}">
    <img class="session-noori" src="./assets/images/noor-recording-reader-cropped.png" alt="نور">
  </button>`;
}
/** Renders the recording control in the permanent session-avatar position. */
function renderSessionRecordControl() {
  const isRecording = state.phase === "recording";
  const action = isRecording
    ? "stop-recording"
    : state.phase === "idle"
      ? "start-recording"
      : state.phase === "retry"
        ? "retry-page"
        : "";
  const label = isRecording ? "إيقاف التسجيل" : state.phase === "retry" ? "حاول مرة أخرى" : "ابدأ التسجيل";
  const artwork = `<img class="session-record-icon" src="./assets/images/noor-recording-reader-cropped.png" alt="">`;

  if (!action) return `<span class="session-record-control is-passive" aria-hidden="true">${artwork}</span>`;
  return `<button class="session-record-control${isRecording ? " is-recording" : ""}" data-action="${action}" aria-label="${label}">${artwork}</button>`;
}

function renderPhaseControls() {
  if (state.phase === "recording") {
    const completing = state.autoCompletionPending || state.autoCompleting;
    return `<div class="controls recording-controls">
      <button class="primary-button recording-action"${completing ? " disabled" : ' data-action="stop-recording"'}>
        <span aria-hidden="true">${completing ? "✦" : "⏹"}</span>
        <span>${completing ? "أَحْسَنْتَ! نُرَاجِعُ قِرَاءَتَكَ…" : "إنهاء القراءة"}</span>
        ${completing ? "" : `<small data-recording-timer>${formatRecordingTime(state.recordingSeconds)}</small>`}
      </button>
      ${pageNavigation()}
    </div>`;
  }

  if (state.phase === "processing") {
    return `
      <div class="controls compact-processing">
        <button class="primary-button" disabled>نراجع قراءتك...</button>
        ${pageNavigation()}
      </div>
    `;
  }

  if (state.phase === "success") {
    const stripKey = createFeedbackPresentation({ outcome: "SUCCESS" }).stripKey;
    const pageReward = state.pageResults[state.pageIndex]?.reward || { stars: 0, coins: 0 };
    const receivedNewReward = pageReward.stars > 0;
    return `
      <div class="controls">
        ${receivedNewReward ? `<div class="page-reward" aria-live="polite" aria-label="مكافأة هذه الصفحة">
          <span>+${toArabicNumber(pageReward.stars)} ⭐</span>
          <span>+${toArabicNumber(pageReward.coins)} 🪙</span>
        </div>` : ""}
        <div class="reward-total" aria-label="إجمالي مكافآت الجلسة">
          <span>إجمالي الجلسة</span>
          <strong>${toArabicNumber(state.earnedStars)} ⭐ &nbsp; ${toArabicNumber(state.earnedCoins)} 🪙</strong>
        </div>
        <div class="result-strip">${t(stripKey)}</div>
        ${renderPageQuestion()}
        ${renderOptionalPlayback()}
        <button class="primary-button" data-action="next-page">${t("cta.next_page")}</button>
      </div>
    `;
  }

  if (state.phase === "narrator") {
    return `
      <div class="controls">
        <button class="primary-button" disabled>⏸ نور يقرأ الآن</button>
        ${pageNavigation()}
      </div>
    `;
  }

  if (state.phase === "retry") {
    return `
      <div class="controls">
        ${renderRetryHint()}
        <button class="primary-button" data-action="retry-page">${t("cta.retry")}</button>
        ${pageNavigation()}
      </div>
    `;
  }

  if (state.phase === "continue") {
    return `
      <div class="controls">
        ${renderRetryHint()}
        ${renderOptionalPlayback()}
        <div class="button-row">
          <button class="secondary-button" data-action="retry-page">${t("cta.retry")}</button>
          <button class="primary-button" data-action="continue-page">${t("cta.continue_reading")}</button>
        </div>
      </div>
    `;
  }

  return `
    <div class="controls idle-controls">
      <button class="primary-button" data-action="start-recording">🎙 ابدأ القراءة</button>
      ${pageNavigation()}
    </div>
  `;
}

function renderOptionalPlayback() {
  if (!state.recording?.audioUrl) return "";
  const page = currentPage();
  const mime = String(state.recording.blob?.type || "").toLowerCase();
  const extension = mime.includes("ogg") ? "ogg" : mime.includes("wav") ? "wav" : "webm";
  return `
    <details class="listen-to-reading">
      <summary>${t("cta.listen_to_reading")}</summary>
      ${state.recordingPlaybackStatus === "loading" ? `<p class="recording-playback-loading" role="status"><span aria-hidden="true"></span>جَارٍ تَجْهِيزُ تَسْجِيلِكَ…</p>` : ""}
      ${state.recordingPlaybackStatus === "error" ? `<p class="recording-playback-error" role="status">لَمْ نَتَمَكَّنْ مِنْ تَشْغِيلِ تَسْجِيلِكَ. حَاوِلْ مَرَّةً أُخْرَى.</p>` : ""}
      <audio src="${state.recording.audioUrl}" controls preload="metadata" data-recording-playback></audio>
      <a class="secondary-button download-recording-link" href="${state.recording.audioUrl}" download="noory-${page?.id || "reading"}-attempt.${extension}">⇩ تَحْمِيلُ تَسْجِيلِي</a>
    </details>
  `;
}

function renderRetryHint() {
  const missingWords = state.feedback?.missingWords?.filter(Boolean).slice(0, 4) || [];
  if (!missingWords.length) return "";
  return `<div class="retry-hint"><span>${t("retry.help")}</span><strong>${missingWords.join(" • ")}</strong></div>`;
}

function renderPageQuestion() {
  const page = currentPage();
  const question = page?.question;
  if (!question) return "";
  const answered = state.questionAnswers[page.id];
  const feedback = state.questionResult
    ? `<span class="question-feedback ${state.questionResult.correct ? "correct" : "retry"}">${state.questionResult.primaryKey ? `${t(state.questionResult.primaryKey)} ${t(state.questionResult.messageKey)}` : t(state.questionResult.messageKey)}</span>`
    : "";
  return `
    <section class="page-question" aria-label="سؤال عن القصة">
      <div class="question-noor-heading">
        <img class="question-noor" src="./assets/images/noor-recording-reader-cropped.png" alt="نور">
        <strong>${question.prompt}</strong>
      </div>
      <div class="question-options">
        ${question.options.map((option) => `<button class="question-option${answered === option ? " selected" : ""}" data-action="answer-question" data-answer="${option}">${option}</button>`).join("")}
      </div>
      ${feedback}
    </section>
  `;
}

function answerQuestion(answer) {
  const page = currentPage();
  if (!page?.question) return;
  const correct = answer === page.question.answer;
  const messageKey = correct
    ? pick(["success.02", "success.03", "success.05", "success.06", "success.07", "success.10", "success.11", "success.12", "success.14", "success.15"])
    : pick(["retry.06", "retry.07", "retry.10", "retry.15"]);
  state.questionResult = { correct, primaryKey: correct ? "success.08" : null, messageKey };
  if (correct) {
    state.questionAnswers[page.id] = answer;
    state.noorMessage = messageKey;
  } else {
    state.noorMessage = messageKey;
  }
  render();
}

function bookCover(book, extraClass = "") {
  const image = book.coverImage ? `<img class="cover-image" src="${book.coverImage}" alt="">` : "";
  return `
    <span class="cover ${extraClass}" style="--cover:${book.coverColor}">
      ${image}
    </span>
  `;
}

function renderSummary() {
  const summary = getFinalReadingSummary(state.book.pages, state.successfulPageIds);
  const { totalScoredPages, successfulPages, needsPracticePages, scorePercent, successfulPageIds } = summary;
  const stars = successfulPages;
  const pageCountLabel = (count) => count === 1 ? "صفحة واحدة" : count === 2 ? "صفحتان" : `${toArabicNumber(count)} صفحات`;

  app.innerHTML = `
    <main class="screen storybook-screen summary-screen">
      <header class="complete-topbar">
        <strong>أكملت قراءة الكتاب</strong>
      </header>

      <section class="complete-hero" aria-live="polite">
        <span class="confetti" aria-hidden="true"></span>
        <span class="confetti c2" aria-hidden="true"></span>
        <span class="confetti c3" aria-hidden="true"></span>
        <div class="complete-copy">
          <h1>نتيجة قراءتك</h1>
          <p class="lead">نجحت في قراءة ${pageCountLabel(successfulPages)} من ${pageCountLabel(totalScoredPages)}. مجهود رائع!</p>
        </div>
        <figure class="summary-noor-card">
          <img class="summary-noor" src="./assets/images/noor-recording-reader-cropped.png" alt="نور">
        </figure>
        <p class="small-note">ما شاء الله! نور سعيد بقراءتك.</p>
      </section>

      <div class="stars" aria-label="نجوم القراءة">${"★".repeat(stars)}${"☆".repeat(needsPracticePages)}</div>
      <section class="final-reading-score" aria-label="نتيجة القراءة النهائية">
        <span>${t("summary.final_score")}</span>
        <strong>${toArabicNumber(scorePercent)}%</strong>
      </section>
      <section class="summary-grid">
        <div class="summary-stat"><span><strong>${toArabicNumber(totalScoredPages)}</strong>إجمالي الصفحات</span></div>
        <div class="summary-stat"><span><strong>${toArabicNumber(successfulPages)}</strong>نجحت فيها</span></div>
        <div class="summary-stat"><span><strong>${toArabicNumber(needsPracticePages)}</strong>تحتاج تدريب</span></div>
      </section>
      <p class="small-note summary-note">نجحت في قراءة ${pageCountLabel(successfulPages)} من ${pageCountLabel(totalScoredPages)}. مجهود رائع!</p>
      <p class="parent-insight">⭐ ${toArabicNumber(successfulPageIds.length)} نجوم &nbsp; • &nbsp; 🪙 ${toArabicNumber(successfulPageIds.length * 5)} عملة</p>
      <div class="controls summary-actions">
        <button class="primary-button" data-action="catalog">${t("cta.read_another_story")}</button>
        <button class="secondary-button" data-action="home">العودة إلى نوري</button>
      </div>
    </main>
  `;
}

function topbar(title, backAction = "home", extraAction = "") {
  const extra = extraAction === "edit-name"
    ? `<button class="icon-button topbar-name-settings" data-action="edit-name" aria-label="تعديل الاسم">⚙</button>`
    : `<span aria-hidden="true" class="topbar-spacer"></span>`;
  return `
    <header class="topbar topbar-static">
      <button class="icon-button topbar-back" data-action="${backAction}" aria-label="رجوع">
        <span aria-hidden="true">›</span>
      </button>
      <h2>${title}</h2>
      ${extra}
    </header>
  `;
}

function bindActions() {
  app.querySelectorAll("[data-action]").forEach((element) => {
    const action = element.dataset.action;
element.addEventListener("click", () => {
      if (action === "home") goHome();
      if (action === "catalog") goCatalog();
      if (action === "noor") goNoorIntro();
      if (action === "edit-name") openNameSetup();
      if (action === "save-child-name") {
        const nameInput = app.querySelector("#child-name");
        const consentToggle = app.querySelector("#parent-consent");
        if (nameInput) saveChildName(nameInput.value);
        if (consentToggle) saveParentConsent(consentToggle.checked);
        completeNamePrompt();
        state.featureSettingsOpen = false;
        goCatalog();
      }
      if (action === "details") {
        if (element.dataset.bookId) openDetails(element.dataset.bookId);
        else goDetails();
      }
      if (action === "start-session") startSession();
      if (action === "resume-session") resumeSession();
      if (action === "contact") {
        state.toast = "يسعدنا تواصلك معنا!";
        render();
      }
      if (action === "start-recording") startRecording();
      if (action === "stop-recording") stopRecording();
      if (action === "delete-recording") deleteRecording();
      if (action === "submit-recording") submitRecording();
      if (action === "retry-page") retryPage();
      if (action === "next-page") nextPage("success");
      if (action === "previous-page") movePage(-1);
      if (action === "next-page-manual") movePage(1);
      if (action === "continue-page") nextPage("continued");
      if (action === "answer-question") answerQuestion(element.dataset.answer);
    });
  });

  const consentToggle = app.querySelector("#parent-consent");
  consentToggle?.addEventListener("change", () => saveParentConsent(consentToggle.checked));
  const recordingPlayback = app.querySelector("[data-recording-playback]");
  recordingPlayback?.addEventListener("loadedmetadata", () => {
    if (state.recordingPlaybackStatus === "loading") {
      state.recordingPlaybackStatus = "ready";
      render();
    }
  }, { once: true });
  recordingPlayback?.addEventListener("error", () => {
    state.recordingPlaybackStatus = "error";
    render();
  }, { once: true });
}

function pick(keys) {
  return keys[Math.floor(Math.random() * keys.length)];
}

function formatSessionTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${toArabicNumber(minutes)}:${String(seconds).padStart(2, "0")}`;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

window.addEventListener("online", () => {
  state.offline = false;
  if (state.screen === "session") {
    // Keep one clear recovery message with Noor instead of a conflicting toast.
    state.noorMessage = "network.online";
    state.toast = "";
    render();
  }
});

window.addEventListener("offline", () => {
  state.offline = true;
  if (state.phase === "processing") handleFailure("NETWORK_ERROR");
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden || state.screen !== "session") return;
  persistSession();
  if (state.phase === "recording") {
    state.recorder?.cleanup();
    state.recorder = null;
    state.phase = "idle";
    state.noorMessage = "recording.interrupted";
    state.toast = "";
    stopRecordingTimer();
    render();
  } else if (state.phase === "processing") {
    handleFailure("NETWORK_ERROR");
  } else if (state.phase === "narrator") {
    narrator.stop();
    state.phase = "idle";
    state.noorMessage = "narrator.02";
    state.toast = "";
    render();
  }
});

render();
