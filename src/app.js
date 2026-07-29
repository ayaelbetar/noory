import { t, toArabicNumber } from "./core/messages.js";
import { books } from "./data/books.js";
import { track } from "./features/analytics/analytics.js";
import { evaluateReading } from "./features/reading/evaluator.js";
import { RecordingController } from "./features/recording/recorder.js";
import { NarratorService } from "./features/playback/narrator.js";

const app = document.querySelector("#app");
const state = {
  screen: "home",
  phase: "idle",
  book: null,
  pageIndex: 0,
  pageResults: [],
  pageRetryCounts: {},
  recorder: null,
  recorderLevel: 10,
  liveTranscript: "",
  manualTranscript: "",
  recording: null,
  feedback: null,
  noorMessage: "welcome.01",
  narratorPlaying: false,
  toast: ""
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
    state.toast = t("network.02");
  }
});

function currentPage() {
  return state.book?.pages[state.pageIndex] || null;
}

function resetAttempt() {
  state.recorderLevel = 10;
  state.liveTranscript = "";
  state.manualTranscript = "";
  state.recording = null;
  state.feedback = null;
  state.toast = "";
}

function goHome() {
  narrator.stop();
  state.screen = "home";
  state.phase = "idle";
  state.book = null;
  state.pageIndex = 0;
  state.pageResults = [];
  state.pageRetryCounts = {};
  resetAttempt();
  render();
}

function goCatalog() {
  narrator.stop();
  state.screen = "catalog";
  render();
}

function openDetails(bookId) {
  state.book = books.find((book) => book.id === bookId);
  state.screen = "details";
  render();
}

function startSession() {
  track("reading_session_preparing", { storyId: state.book.id });
  state.screen = "session";
  state.phase = "idle";
  state.pageIndex = 0;
  state.pageResults = [];
  state.pageRetryCounts = {};
  state.noorMessage = "welcome.01";
  resetAttempt();
  render();
}

async function startRecording() {
  narrator.stop();
  resetAttempt();
  state.phase = "recording";
  state.noorMessage = "listen.01";
  render();

  state.recorder = new RecordingController({
    onLevel: (level) => {
      state.recorderLevel = level;
      const meter = document.querySelector("[data-meter-fill]");
      if (meter) meter.style.setProperty("--level", `${level}%`);
    },
    onTranscript: (text) => {
      state.liveTranscript = text;
    },
    onStatus: (status) => {
      if (status === "speech-unavailable") {
        state.toast = "يمكنك التسجيل، ثم استخدام المربع الصغير إذا لم يسمعك نور بوضوح.";
      }
    }
  });

  try {
    await state.recorder.start();
    track("page_recording_started", {
      storyId: state.book.id,
      pageId: currentPage().id,
      pageIndex: state.pageIndex
    });
  } catch {
    state.phase = "idle";
    state.noorMessage = "mic.02";
    state.toast = t("mic.01");
    render();
  }
}

async function stopRecording() {
  if (!state.recorder) return;

  try {
    const recording = await state.recorder.stop();
    state.recording = recording;
    state.liveTranscript = recording.transcript || state.liveTranscript;
    state.phase = "recorded";
    state.noorMessage = "before.01";
    track("page_recording_stopped", {
      storyId: state.book.id,
      pageId: currentPage().id,
      pageIndex: state.pageIndex,
      durationSeconds: Math.round(recording.durationMs / 1000)
    });
    render();
  } catch {
    state.phase = "idle";
    state.noorMessage = "retry.01";
    render();
  }
}

function deleteRecording() {
  if (state.recording?.audioUrl) URL.revokeObjectURL(state.recording.audioUrl);
  resetAttempt();
  state.phase = "idle";
  state.noorMessage = "before.02";
  render();
}

async function submitRecording() {
  const page = currentPage();
  const retryCount = state.pageRetryCounts[page.id] || 0;
  const transcript = state.liveTranscript || state.recording?.transcript || state.manualTranscript;

  state.phase = "processing";
  state.noorMessage = "loading.01";
  render();

  track("page_upload_started", { storyId: state.book.id, pageId: page.id, pageIndex: state.pageIndex });
  await wait(700);
  track("page_upload_completed", { storyId: state.book.id, pageId: page.id, pageIndex: state.pageIndex });

  const result = evaluateReading({
    expectedText: page.text,
    transcript,
    retryCount
  });
  state.feedback = result;

  if (result.outcome === "SUCCESS") {
    state.pageResults[state.pageIndex] = {
      status: "success",
      score: result.score,
      attempts: retryCount + 1
    };
    state.phase = "success";
    state.noorMessage = pick(["success.01", "success.02", "success.05"]);
    track("page_outcome_success", {
      storyId: state.book.id,
      pageId: page.id,
      pageIndex: state.pageIndex,
      retryCount
    });
    render();
    return;
  }

  state.pageRetryCounts[page.id] = retryCount + 1;
  state.noorMessage = result.offerContinue ? "continue.01" : "retry.02";
  track("page_outcome_retry", {
    storyId: state.book.id,
    pageId: page.id,
    pageIndex: state.pageIndex,
    retryCount: retryCount + 1
  });

  if (result.offerContinue) {
    track("page_continue_offered", { pageId: page.id, retryCount: retryCount + 1 });
  }

  await playNarratorAfterRetry(result.offerContinue);
}

async function playNarratorAfterRetry(offerContinue) {
  state.phase = "narrator";
  state.noorMessage = "narrator.01";
  render();
  await wait(450);
  await narrator.playPage(currentPage());
  state.phase = offerContinue ? "continue" : "retry";
  state.noorMessage = offerContinue ? "continue.01" : "narrator.02";
  render();
}

function retryPage() {
  resetAttempt();
  state.phase = "idle";
  state.noorMessage = "before.02";
  render();
}

function nextPage(status = "success") {
  const page = currentPage();
  if (status === "continued") {
    state.pageResults[state.pageIndex] = {
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
  render();
}

function completeSession() {
  state.screen = "summary";
  state.phase = "completed";
  state.noorMessage = "complete.01";
  track("reading_session_completed", {
    storyId: state.book.id,
    completedPages: state.pageResults.length,
    totalPages: state.book.pages.length
  });
  render();
}

function render() {
  if (state.screen === "home") renderHome();
  if (state.screen === "catalog") renderCatalog();
  if (state.screen === "details") renderDetails();
  if (state.screen === "session") renderSession();
  if (state.screen === "summary") renderSummary();
  bindActions();
}

function renderHome() {
  app.innerHTML = `
    <main class="screen home-screen">
      <section class="home-copy">
        <p class="eyebrow">نوري</p>
        <h1>اقرأ بثقة</h1>
        <p class="lead">${t("welcome.01")}</p>
      </section>
      <button class="primary-button" data-action="catalog">
        <span aria-hidden="true">▶</span>
        <span>${t("cta.read_with_noor")}</span>
      </button>
    </main>
  `;
}

function renderCatalog() {
  app.innerHTML = `
    <main class="screen">
      ${topbar("اختر قصة", "home")}
      <section class="library-grid" aria-label="القصص">
        ${books.map(storyCard).join("")}
      </section>
    </main>
  `;
}

function storyCard(book) {
  return `
    <button class="story-card" data-action="details" data-book-id="${book.id}">
      <span class="cover" style="--cover:${book.coverColor}">
        <span class="cover-mark" aria-hidden="true"></span>
      </span>
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
  app.innerHTML = `
    <main class="screen">
      ${topbar("القصة", "catalog")}
      <section class="details-hero">
        <div class="cover details-cover" style="--cover:${state.book.coverColor}">
          <span class="cover-mark" aria-hidden="true"></span>
        </div>
        <div>
          <p class="eyebrow">${state.book.level}</p>
          <h1>${state.book.title}</h1>
          <p class="lead">${t("welcome.02")}</p>
        </div>
      </section>
      <div class="controls">
        <button class="primary-button" data-action="start-session">${t("cta.read_with_noor")}</button>
      </div>
    </main>
  `;
}

function renderSession() {
  const page = currentPage();
  const pageNumber = state.pageIndex + 1;
  const totalPages = state.book.pages.length;
  const progress = Math.round((state.pageIndex / totalPages) * 100);
  app.innerHTML = `
    <main class="screen">
      ${topbar(`الصفحة ${toArabicNumber(pageNumber)} من ${toArabicNumber(totalPages)}`, "details")}
      <div class="progress-track" aria-hidden="true">
        <div class="progress-fill" style="--progress:${progress}%"></div>
      </div>
      <section class="page-shell">
        <div class="page-text">${page.text}</div>
        <div class="noor-row">
          <img class="noor-avatar" src="./assets/images/noor-reading-companion.png" alt="نور">
          <div class="noor-bubble">${t(state.noorMessage)}</div>
        </div>
        ${state.toast ? `<div class="toast">${state.toast}</div>` : ""}
        ${renderPhaseControls()}
      </section>
    </main>
  `;
}

function renderPhaseControls() {
  if (state.phase === "recording") {
    return `
      <div class="controls">
        <div class="meter" aria-hidden="true"><div class="meter-fill" data-meter-fill style="--level:${state.recorderLevel}%"></div></div>
        <button class="primary-button recording" data-action="stop-recording">
          <span aria-hidden="true">■</span>
          <span>${t("cta.done_reading")}</span>
        </button>
      </div>
    `;
  }

  if (state.phase === "recorded") {
    const needsManualInput = !RecordingController.isSpeechRecognitionSupported() || !(state.liveTranscript || state.recording?.transcript);
    return `
      <div class="controls">
        <audio class="audio-preview" src="${state.recording.audioUrl}" controls></audio>
        ${needsManualInput ? manualTranscriptPanel() : ""}
        <div class="button-row">
          <button class="secondary-button" data-action="delete-recording">إعادة التسجيل</button>
          <button class="primary-button" data-action="submit-recording">${t("cta.done_reading")}</button>
        </div>
      </div>
    `;
  }

  if (state.phase === "processing") {
    return `
      <div class="controls">
        <div class="meter" aria-hidden="true"><div class="meter-fill" style="--level:78%"></div></div>
        <button class="primary-button" disabled>${t("loading.01")}</button>
      </div>
    `;
  }

  if (state.phase === "success") {
    return `
      <div class="controls">
        <div class="result-strip">${t("success.04")}</div>
        <button class="primary-button" data-action="next-page">${t("cta.next_page")}</button>
      </div>
    `;
  }

  if (state.phase === "narrator") {
    return `
      <div class="controls">
        <div class="result-strip retry">${state.narratorPlaying ? t("retry.02") : t("narrator.01")}</div>
        <button class="primary-button" disabled>${t("loading.02")}</button>
      </div>
    `;
  }

  if (state.phase === "retry") {
    return `
      <div class="controls">
        <div class="result-strip retry">${t("retry.04")}</div>
        <button class="primary-button" data-action="retry-page">${t("cta.retry")}</button>
      </div>
    `;
  }

  if (state.phase === "continue") {
    return `
      <div class="controls">
        <div class="result-strip retry">${t("continue.02")}</div>
        <div class="button-row">
          <button class="secondary-button" data-action="retry-page">${t("cta.retry")}</button>
          <button class="primary-button" data-action="continue-page">${t("cta.continue_reading")}</button>
        </div>
      </div>
    `;
  }

  return `
    <div class="controls">
      <button class="primary-button" data-action="start-recording">
        <span aria-hidden="true">●</span>
        <span>${t("cta.start_reading")}</span>
      </button>
    </div>
  `;
}

function manualTranscriptPanel() {
  return `
    <div class="fallback-panel">
      <label for="manual-transcript">لم أسمع بوضوح. اكتب الجملة بمساعدة كبير.</label>
      <textarea id="manual-transcript" data-action="manual-transcript" placeholder="اكتب هنا">${state.manualTranscript}</textarea>
    </div>
  `;
}

function renderSummary() {
  const total = state.book.pages.length;
  const successes = state.pageResults.filter((result) => result?.status === "success").length;
  const continued = state.pageResults.filter((result) => result?.status === "continued").length;
  const finished = successes + continued;
  const stars = Math.max(1, successes);

  app.innerHTML = `
    <main class="screen">
      <section>
        <p class="eyebrow">ملخص القراءة</p>
        <h1>${t("complete.01")}</h1>
        <p class="lead">${t("summary.line_pages", {
          completedPages: toArabicNumber(finished),
          totalPages: toArabicNumber(total)
        })}</p>
      </section>
      <div class="stars" aria-label="نجوم القراءة">${"★".repeat(stars)}${"☆".repeat(total - stars)}</div>
      <section class="summary-grid">
        <div class="summary-stat"><span><strong>${toArabicNumber(successes)}</strong>صفحات قوية</span></div>
        <div class="summary-stat"><span><strong>${toArabicNumber(continued)}</strong>أكملناها</span></div>
        <div class="summary-stat"><span><strong>${toArabicNumber(total)}</strong>كل الصفحات</span></div>
      </section>
      <p class="small-note">${t("summary.line_effort")} ${t("complete.03")}</p>
      <div class="controls">
        <button class="primary-button" data-action="catalog">${t("cta.read_another_story")}</button>
        <button class="secondary-button" data-action="home">العودة إلى نوري</button>
      </div>
    </main>
  `;
}

function topbar(title, backAction) {
  return `
    <header class="topbar">
      <button class="icon-button" data-action="${backAction}" aria-label="رجوع">
        <span aria-hidden="true">›</span>
      </button>
      <h2>${title}</h2>
      <span aria-hidden="true" style="inline-size:48px"></span>
    </header>
  `;
}

function bindActions() {
  app.querySelectorAll("[data-action]").forEach((element) => {
    const action = element.dataset.action;

    if (action === "manual-transcript") {
      element.addEventListener("input", (event) => {
        state.manualTranscript = event.target.value;
      });
      return;
    }

    element.addEventListener("click", () => {
      if (action === "home") goHome();
      if (action === "catalog") goCatalog();
      if (action === "details") openDetails(element.dataset.bookId);
      if (action === "start-session") startSession();
      if (action === "start-recording") startRecording();
      if (action === "stop-recording") stopRecording();
      if (action === "delete-recording") deleteRecording();
      if (action === "submit-recording") submitRecording();
      if (action === "retry-page") retryPage();
      if (action === "next-page") nextPage("success");
      if (action === "continue-page") nextPage("continued");
    });
  });
}

function pick(keys) {
  return keys[Math.floor(Math.random() * keys.length)];
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

render();
