# Recording UX Specification

**Version:** 1.0  
**Status:** Production-ready (MVP)  
**Audience:** Product, Design, Flutter engineering, QA  
**Locale:** Child UI Arabic RTL · Documentation English  

---

# Document Purpose

Define production UX for every **Reading Session** recording-related state in **Read with Noor**, for children **3–8** reading **Arabic** stories aloud. This spec is the implementation-facing companion to `12_AI_Evaluation_Flow.md` (state enum source of truth), `11_Message_Library.md` (all child copy), `09_UI_UX_Guidelines.md`, `07_Acceptance_Criteria.md`, and `08_Edge_Cases.md`.

---

# Non-Negotiable Product Rules (MVP)

1. **Child tries first:** On each page, **Noor NEVER reads or plays narrator audio before the child’s first completed attempt** (first **recording stop** → **upload** → **evaluation** on that page). Narrator is allowed only on the **Retry** path after a **Retry** outcome (see `Audio Playback Flow.md`).
2. **No exam UX:** No scores, accuracy, transcripts, countdown timers, or forbidden terms (`README.md` terminology).
3. **AI invisible:** Child sees only Noor; failures use `network.*`, `mic.*`, `retry.*` — never API codes or English errors.
4. **RTL-first:** Layout, reading order, and mirrored directional icons per `09_UI_UX_Guidelines.md`.
5. **State-gated controls:** Only show CTAs valid for the current state; debounce duplicate taps (`EC-07`).

---

# State Map (UX ↔ Engineering)

| UX state (this doc) | `ReadingBuddyState` enum (`12`) | MVP |
|---------------------|----------------------------------|-----|
| Idle | `idle` | Yes |
| Permission Request | `preparing` | Yes |
| Recording | `recording` | Yes |
| Paused | — | **Disabled (not MVP)** |
| Stopped | `recording_finalize` (client-only) | Yes |
| Uploading | `uploading` | Yes |
| Processing | `evaluating` | Yes |
| Success | `success` | Yes |
| Retry | `retry` (+ `narrator` sub-phase) | Yes |
| Failure | `idle` + failure overlay | Yes |
| Playback | `narrator` | Yes (Retry path only) |
| Re-record | transition → `idle` | Yes |

---

# Global Screen Composition (Reading Page)

Applies whenever the child is inside an active **Reading Session** (post **Read with Noor** entry).

| Component | Role | Always visible |
|-----------|------|----------------|
| Story page canvas | Arabic page text, illustrations | Yes (except full-screen blockers) |
| Progress indicator | «الصفحة {X} من {Y}» (RTL) | Yes |
| Noor companion | Avatar / presence; speech bubble for messages | Yes; subdued during Recording |
| Primary CTA strip | State-specific single primary action | Per state |
| Secondary actions | Back/exit (host), optional settings | Host policy |
| Listening indicator | Pulse/wave during Recording | Recording only |
| Loading shell | Non-blocking overlay during Uploading/Processing | Upload/Process |
| Failure banner | Inline after recoverable failure | Failure only |

**Touch targets:** Minimum 48×48 dp; primary CTA full-width or ≥60% width bottom-aligned for thumb reach (RTL: bottom-start anchor acceptable).

---

# State: Idle

## Purpose

Present the current story page and invite the child to begin their **first attempt** on this page (or a subsequent attempt after Retry/Failure). No narrator autoplay. No pre-reading of page text by Noor.

## Components

- Story text (Arabic, RTL, high contrast).
- Noor with optional `before.*` (rotated; not on every page).
- Primary: `cta.start_reading` (**Start Reading** / recording start).
- Progress: Page X of Y.
- Host back control (exits session per host rules; persist Session Store — `EC-06`).

## States

- **Idle — ready:** Mic permission already granted; CTA enabled.
- **Idle — awaiting permission:** Shown after **Permission Request** denial; CTA re-enters **Permission Request**.
- **Idle — post-failure:** Same layout + failure message region (maps to **Failure** UX until dismissed or next tap).
- **Idle — post-narrator:** After **Playback** completes on Retry path; `cta.retry` prominent (see **Re-record**).

## Loading

Not applicable in core Idle. If host prefetches narrator assets in background, no child-visible loader on Idle.

## Empty

Not applicable (page always has content from host). If host delivers blank page (defect), block **Start Reading** and show host error — out of Reading Buddy scope; log `content_invalid`.

## Error

Failures return to **Idle** with message keys from `11` per `12` taxonomy. No second primary CTA besides **Start Reading** / **Done** path documented under **Failure**.

## Accessibility

- VoiceOver/TalkBack: Page title = story name + page index; CTA label = Arabic string for `cta.start_reading`.
- Focus order: progress → story text (readable) → primary CTA → Noor bubble (if visible).
- Do not auto-focus Noor speech on every page entry (reduce noise).

## Animations

- Noor idle breathe (subtle loop, ≤3s period).
- CTA: gentle scale on press; no flashing.
- Respect system **Reduce Motion**: static Noor, no parallax.

## Voice

- Optional one-line `before.*` on first page of session or after long idle (>2 min) — max once per page visit.
- No TTS of full page text in Idle.

## Business Rules

- First attempt on page **must** start with **recording start**; no skip-to-narrator.
- `attemptSequence` increments on each **recording stop** that reaches **Uploading** (`15` analytics).
- **Retry** outcome count (`pageRetryCounts`) increments only on HTTP 200 **Retry**, not on failures.

## Acceptance Criteria

- **AC-R-IDLE-01:** Given **Idle** on a new page, when the session loads, then narrator does not autoplay and Noor does not read the page aloud.
- **AC-R-IDLE-02:** Given **Idle**, when the child taps `cta.start_reading`, then transition to **Permission Request** or **Recording** within 2s (`AC-02-01`).
- **AC-R-IDLE-03:** Given Decision 7 **Continue** accepted, when the next page opens, then state is **Idle** with fresh first-attempt rules.

## Edge Cases

- **EC-06:** Exit during Idle — Session Store persists `currentPageIndex`, retry counts.
- **EC-07:** Double tap **Start Reading** — single transition to Recording.
- **EC-12:** Consent revoked — **Read with Noor** blocked at host; if mid-session, treat as session exit.

---

# State: Permission Request

## Purpose

Obtain microphone access (and satisfy SP-01 consent if not already) before capture. Maps to engineering **Preparing**.

## Components

- Noor + `mic.01` / `mic.02`.
- System permission sheet (OS).
- Optional illustration: child + mic (Noory design system).
- Primary on sheet: OS-controlled; in-app fallback button «السماح بالمايكروفون» only if platform allows deep link to Settings (`host.mic_settings` — host string if added).

## States

- **Preparing — checking:** Brief (<300ms); no spinner unless platform slow.
- **Preparing — prompt visible:** OS dialog foreground.
- **Preparing — denied:** Return **Idle** with `mic.*`; CTA remains **Start Reading**.
- **Preparing — granted:** Auto-enter **Recording** without second tap (single intent).

## Loading

Optional indeterminate dot pulse on Noor only if permission check >500ms.

## Empty

N/A.

## Error

- Denied / restricted: `mic.01`, `mic.02`; stay **Idle**-equivalent until retry.
- Hardware missing: `mic.01`; host may route to support FAQ (parent gate).

## Accessibility

- Announce permission rationale in Arabic when in-app explainer shows (before OS sheet).
- Do not trap focus behind system sheet.

## Animations

- Noor attentive pose (slight lean); stop animation when OS sheet covers app.

## Voice

- Spoken/displayed: `mic.02` once per permission attempt cycle; avoid repeating on every **Start Reading** tap within 10s (debounce copy).

## Business Rules

- Permission Request runs on every **recording start** if OS status ≠ granted.
- Never call `POST /evaluate` without granted mic (except replay of prior upload — not MVP).
- Parent consent SP-01 must be satisfied before first **Preparing** in a session (`AC-01-02`).

## Acceptance Criteria

- **AC-R-PERM-01:** Given mic not granted, when **Start Reading**, then OS permission flow appears and `reading_session_preparing` analytics fires.
- **AC-R-PERM-02:** Given denial, when sheet closes, then **Idle** + `mic.*` and no Recording.
- **AC-R-PERM-03:** Given grant, when sheet closes, then **Recording** within 2s without second tap.

## Edge Cases

- **EC-03:** Permanent deny → Settings path (parent-assisted).
- Permission revoked mid-session → see `Recovery Flows.md` RF-PERM.

---

# State: Recording

## Purpose

Capture the child’s oral reading for the current page for the current attempt. Noor listens quietly; no narration.

## Components

- Story text (remain visible; no dimming that harms readability).
- Listening indicator (wave/pulse; not a volume meter — avoids “performance” anxiety).
- Primary: `cta.done_reading` (**Done** / recording stop) — always visible, sticky bottom.
- Optional low-frequency `listen.*` in Noor bubble (max one line per 30s; suppress if child is speaking — host VAD optional).
- Elapsed capture indicator: **optional subtle** progress ring without numeric countdown (MVP: no seconds shown).

## States

- **Recording — active:** Mic open; min duration 1s before **Done** enabled (`AC-02-02`).
- **Recording — max approaching:** At 115s optional gentle Noor `listen.03`; no alarm.
- **Recording — auto-stop:** At 120s auto **Done** → **Stopped** → **Uploading** (`EC-13`).

## Loading

N/A.

## Empty

N/A.

## Error

- Capture fault (codec init fail): immediate toast `retry.01`, return **Idle**; log `recording_fault`.
- Interruption (call, background): see `Recovery Flows.md`.

## Accessibility

- Announce «بدء التسجيل» once on enter (platform guideline: not on every resume if <5s).
- **Done** is largest actionable control; label `cta.done_reading`.
- No color-only recording state; icon + text «أنا أستمع» (`listen.01`).

## Animations

- Listening indicator: smooth sine wave, 1.5–2Hz, amplitude low.
- No red/recording dot cliché if it implies “test”; prefer warm amber/teal Noory palette.

## Voice

- `listen.*` only; never read page text aloud during Recording.

## Business Rules

- One active recording per page attempt.
- Cancel/recording abort without **Done**: not MVP UI — back swipe exits session (host); discard partial buffer.
- Max 120s; min 1s before upload.
- No pause control in MVP (**Paused** disabled).

## Acceptance Criteria

- **AC-R-REC-01:** Given **Recording**, when child reads, then no narrator audio plays.
- **AC-R-REC-02:** Given <1s elapsed, when **Done** tapped, then ignore or show gentle haptic «خذ وقتك» (`before.01`) — no upload.
- **AC-R-REC-03:** Given 120s elapsed, then auto **Uploading** (`EC-13`).
- **AC-R-REC-04:** Analytics `page_recording_started` / `page_recording_stopped` per `15`.

## Edge Cases

- **EC-07:** Double **Done** — single upload.
- **EC-05:** Noisy environment — handled at evaluation, not during Recording UI.
- Bluetooth mic switch: continue recording if OS supports; else fault → **Idle**.

---

# State: Paused

## Purpose

*Post-MVP concept:* Allow pausing capture without ending the attempt.

## MVP Status: **Disabled**

- No pause button in UI.
- State machine ignores `tap_pause` / `tap_resume`.
- If OS interrupts recording (call), behavior is **Recovery Flows.md** (not Paused UX).

## Components

N/A (hidden).

## States

N/A.

## Loading / Empty / Error

N/A.

## Accessibility

N/A.

## Animations

N/A.

## Voice

N/A.

## Business Rules

Engineering MUST NOT emit `paused` enum in MVP builds.

## Acceptance Criteria

- **AC-R-PAUSE-01:** Given MVP build, when inspecting UI, then no pause control exists.

## Edge Cases

Future: pause max duration, auto-resume prompts — document in `18_Future_Ideas.md` when scoped.

---

# State: Stopped

## Purpose

Brief client-only phase after **recording stop** while the app finalizes the audio buffer, validates min duration, and prepares multipart upload. Bridges **Recording** → **Uploading**.

## Components

- Same as Recording but listening indicator **off**.
- **Done** disabled; optional micro-copy `loading.01` if finalize >200ms.

## States

- **Stopped — finalize:** ≤500ms target.
- **Stopped — reject too short:** If <1s effective audio, return **Idle** with `before.01`; no upload.

## Loading

Short inline spinner on CTA strip only if >200ms.

## Empty

N/A.

## Error

- File write fail / low storage: see **Failure** + `Recovery Flows.md` RF-STORAGE.

## Accessibility

- Announce «جاري الحفظ» if phase >1s (rare).

## Animations

- Crossfade listening indicator off.

## Voice

- None or single `loading.01` if delayed.

## Business Rules

- No user action required in happy path.
- Do not play narrator in Stopped.

## Acceptance Criteria

- **AC-R-STOP-01:** Given valid **Done**, when finalize completes, then **Uploading** begins automatically.
- **AC-R-STOP-02:** Given sub-1s recording, then return **Idle** without API call.

## Edge Cases

- App killed during Stopped: discard partial; resume **Idle** on relaunch (`Recovery Flows.md` RF-KILL).

---

# State: Uploading

## Purpose

Transmit audio and metadata to `POST /v1/reading-buddy/evaluate` (`15`). Child sees supportive waiting UX, not “upload” jargon.

## Components

- Story page dimmed ≤20% (optional).
- Noor + rotating `loading.*`.
- Disabled primary CTAs (no **Done** spam).
- Non-interactive progress: indeterminate bar or gentle dots.

## States

- **Uploading — in flight:** Request active; timeout 60s client → `NETWORK_ERROR`.
- **Uploading — retryable fail:** Transition **Failure** / **Idle** with `network.*`.

## Loading

Primary UX of this state; use `loading.01`–`loading.03` rotation every 4s max.

## Empty

N/A.

## Error

Mapped via `12` taxonomy; typical: `NETWORK_ERROR`, `PAYLOAD_TOO_LARGE`, `INVALID_AUDIO`.

## Accessibility

- Announce «نحن نعمل معًا» (`loading.02`) once on enter.
- Loading region `aria-busy=true`.

## Animations

- Indeterminate progress; no percentage.

## Voice

- `loading.*` only; Noor does not read page.

## Business Rules

- One in-flight upload per page (`EC-07`).
- Increment `attemptSequence` when upload starts.
- Do not increment **Retry** outcome count on HTTP errors.

## Acceptance Criteria

- **AC-R-UPL-01:** Given **Uploading**, when request succeeds HTTP 200, then enter **Processing** / outcome UI.
- **AC-R-UPL-02:** Given offline, when upload fails, then `network.01` and **Idle** (`EC-01`).
- **AC-R-UPL-03:** UI thread remains responsive (`07` NFR).

## Edge Cases

- **EC-06:** Leave screen — cancel request; persist store.
- **EC-02:** Connection drop mid-upload — `NETWORK_ERROR`.

---

# State: Processing

## Purpose

Client wait for parseable evaluation response (overlaps server STT + evaluation). Child-facing label «Processing»; enum `evaluating`.

## Components

- Same shell as **Uploading** (may be seamless — child sees one continuous «waiting with Noor»).
- Optional subtle state change: Noor shifts from «listening» to «thinking» pose (still no brain/AI icons).

## States

- **Processing — awaiting outcome:** Until JSON parsed.
- **Processing — timeout:** Server 30s / HTTP 408 → **Failure** `AI_TIMEOUT`.

## Loading

Continue `loading.*`; after 15s optionally swap to `loading.03` only once.

## Empty

N/A.

## Error

Same as Uploading failures; **AI_TIMEOUT** uses `network.02`; manual re-record via **Idle** + **Start Reading** (no auto re-upload — `EC-08`).

## Accessibility

- Maintain `aria-busy` until outcome or failure.

## Animations

- Same as Uploading; avoid «clock» iconography.

## Voice

- `loading.*` only.

## Business Rules

- Child never sees outcome labels «Success»/«Retry» as text — only Noor messages + CTAs.
- Parsing errors → `EVALUATION_FAILED` treatment.

## Acceptance Criteria

- **AC-R-PROC-01:** Given HTTP 200, when `outcome=success`, then **Success** state.
- **AC-R-PROC-02:** Given HTTP 200, when `outcome=retry`, then **Retry** state (narrator may follow).
- **AC-R-PROC-03:** Given 30s server timeout, then `network.02` and **Idle** (`AC-03-02`).

## Edge Cases

- Duplicate response / late response after cancel: ignore stale; stay **Idle**.

---

# State: Success

## Purpose

Celebrate effort and enable forward motion after **Success** outcome on current page.

## Components

- Noor celebration bubble: `success.*` (contextual rotation).
- Primary: `cta.next_page` (**Next Page** / Continue after success).
- Optional delight `delight.*` on milestones (Decision 11).
- Progress updates on transition.

## States

- **Success — non-final page:** **Next Page** enabled.
- **Success — final page:** Auto-transition to **Completed** / **Reading Summary** (`EC-09`).

## Loading

N/A.

## Empty

N/A.

## Error

N/A (outcome already succeeded).

## Accessibility

- Announce `success.01` equivalent on enter.
- Focus moves to **Next Page** after 500ms delay (configurable).

## Animations

- Short confetti or star burst ≤1.2s; respect Reduce Motion (static badge).

## Voice

- `success.*`; optional `personal.*` if profile name exists.

## Business Rules

- Do not play narrator on Success path.
- Next page opens in **Idle** (new first attempt on that page).

## Acceptance Criteria

- **AC-R-SUC-01:** Matches **AC-04-01** and **AC-06-01**.
- **AC-R-SUC-02:** No narrator autoplay on enter.

## Edge Cases

- **EC-07:** Double **Next Page** — single navigation.

---

# State: Retry

## Purpose

Encourage the child after **Retry** outcome and introduce **Playback** (narrator) before another attempt. This is the **only** MVP path where narrator plays.

## Components

- Noor: `retry.*`.
- **Playback** phase: narrator audio (see `Audio Playback Flow.md`).
- Primary after playback: `cta.retry` (**Retry** → **Re-record**).
- If `offerContinue` (Decision 7): alternate primary `cta.continue_reading` + `continue.*`.

## States

- **Retry — message:** Show encouragement first (0–2s) before narrator starts (no autoplay before first attempt on page — this is post-first-attempt).
- **Retry — playback:** Sub-state `narrator`.
- **Retry — ready to re-record:** **Playback** complete; highlight `cta.retry`.

## Loading

While narrator URL resolves: `loading.01` max 3s then `network.01` if missing URL.

## Empty

If `narratorAudioUrl` missing: skip playback after `retry.02`; go **Re-record** with log `narrator_missing`.

## Error

Narrator decode fail: `network.02`; still allow **Re-record**.

## Accessibility

- Pre-play cue: `narrator.01` displayed and announced.
- During playback, show «استمع» static label; duck other audio (`Audio Playback Flow.md`).

## Animations

- Noor «listening together» pose during playback.

## Voice

- `retry.*`, then `narrator.01` / `narrator.02` before audio.

## Business Rules

- Narrator only after **Retry** outcome, never before first attempt on page.
- `pageRetryCounts[pageId]++` on each **Retry** outcome.
- Third **Retry** on same page → offer **Continue** (`EC-11`).

## Acceptance Criteria

- **AC-R-RET-01:** Matches **AC-05-01**.
- **AC-R-RET-02:** Given first attempt on page still in progress, narrator MUST NOT play (guard in **Recording** / **Idle**).

## Edge Cases

- Child taps **Retry** during playback: stop narrator; enter **Re-record** (**Idle**).
- Headphones unplugged mid-playback: pause playback; prompt resume (`Audio Playback Flow.md`).

---

# State: Failure

## Purpose

Communicate recoverable problems without blame and restore a clear next step (usually **Idle** + new attempt).

## Components

- Inline banner or Noor bubble with taxonomy-mapped keys (`12`).
- Primary: context-dependent — usually return to **Idle** with **Start Reading** enabled; for `AI_TIMEOUT` / network, same page **Start Reading** after message.
- No technical codes.

## States

- **Failure — recoverable re-record:** `EMPTY_AUDIO`, `LOW_CONFIDENCE`, `INVALID_AUDIO`, etc.
- **Failure — retry upload later:** `NETWORK_ERROR`, `STT_FAILED`, `UPSTREAM_ERROR`.
- **Failure — consent/mic blockers:** route to host flows.

## Loading

N/A unless user immediately taps **Start Reading** → chain to Uploading.

## Empty

N/A.

## Error

This state *is* error UX; single message at a time; queue not MVP.

## Accessibility

- Announce failure message in Arabic once; role=alert.

## Animations

- Gentle fade-in banner; no shake/X icons.

## Voice

- `network.*`, `retry.*`, `mic.*` per taxonomy — never English.

## Business Rules

- Fire `page_failure` with `failureCode` (`15`).
- Do not increment **Retry** outcome count on failures.
- Never auto-reupload on timeout (`EC-08`).

## Acceptance Criteria

- **AC-R-FAIL-01:** Matches **AC-03-03** for all taxonomy codes.
- **AC-R-FAIL-02:** Child always has exactly one obvious next action.

## Edge Cases

- Rapid repeated failures: rotate `network.02` / `loading.02`; cap at 40 evaluates per session (`EA-08`).

---

# State: Playback

## Purpose

Play host-provided **narrator** audio for the current page during **Retry** path so the child can hear model pronunciation before trying again.

## Components

- See `Audio Playback Flow.md` (authoritative for controls, ducking, interruptions).
- Visual: sound wave or speaker icon + optional page highlight (sentence-level highlight post-MVP — MVP: static page).

## States

- **Playback — idle before start:** Short Noor cue `narrator.01`.
- **Playback — playing:** Narrator only; no mic capture.
- **Playback — completed:** Hand off to **Re-record** readiness.
- **Playback — interrupted:** Phone call, background, route change — see recovery doc.

## Loading / Empty / Error

As **Retry** narrator substates.

## Accessibility

- Visible «تشغيل الصوت» / pause if control exposed; if child-only passive playback, single **Skip** is **not** MVP (complete listen encouraged, max length = asset length).

## Animations

- Soft page vignette during play; release on complete.

## Voice

- Narrator audio only (prerecorded); Noor silent during play except pre/post cues.

## Business Rules

- **Never** trigger Playback from **Idle** before first attempt.
- **Never** autoplay narrator on page turn.
- Volume follows media channel; duck background music (`Audio Playback Flow.md`).

## Acceptance Criteria

- **AC-R-PLAY-01:** Playback starts only from **Retry** after first attempt completed.
- **AC-R-PLAY-02:** After playback, `cta.retry` enabled.

## Edge Cases

- Bluetooth disconnect → pause + inline message; resume when route stable.

---

# State: Re-record

## Purpose

UX transition for starting a new attempt after **Retry** (post-narrator) or after recoverable **Failure**. Engineering target state: **Idle** with UX emphasis on `cta.retry` or `cta.start_reading`.

## Components

- **Idle** layout.
- Primary label: `cta.retry` after Retry path; `cta.start_reading` after pure Failure return.
- Optional `before.02` once.

## States

- **Re-record — primed:** Post-playback; focus on **Retry**.
- **Re-record — immediate:** Post-failure without narrator.

## Loading

N/A.

## Empty

N/A.

## Error

N/A.

## Accessibility

- Announce «يمكنك المحاولة مرة أخرى» using `cta.retry` label text.

## Animations

- CTA gentle pulse once on entry (1 cycle).

## Voice

- `before.02` optional; never narrate full page.

## Business Rules

- Each re-record begins new capture; new upload increments `attemptSequence`.
- Narrator plays again only if another **Retry** outcome occurs (not after every failure).

## Acceptance Criteria

- **AC-R-REREC-01:** Given **Retry** path completed playback, when child taps `cta.retry`, then **Permission Request** or **Recording** within 2s.
- **AC-R-REREC-02:** Re-record does not skip straight to Success.

## Edge Cases

- **EC-11:** On third **Retry**, **Continue** may supersede re-record emphasis.

---

# Cross-State Analytics (Reference)

Implement only events in `15_Technical_Architecture.md` § Analytics. Key events: `reading_session_preparing`, `page_recording_started`, `page_recording_stopped`, `page_upload_started`, `page_upload_completed`, `page_outcome_success`, `page_outcome_retry`, `page_failure`, `page_continue_offered`, `reading_session_completed`.

---

# QA Oracle Checklist

| Check | Expected |
|-------|----------|
| First page entry | No narrator |
| After Success | No narrator on next page until child attempts |
| Retry path | Narrator once per Retry outcome |
| Paused | Control absent |
| Failure | Arabic message + clear next step |
| RTL | Mirrored back, bottom CTA reachable |

---

# Related Documents

| Topic | Document |
|-------|----------|
| State enum & transitions | `12_AI_Evaluation_Flow.md` |
| Arabic copy | `11_Message_Library.md` |
| Narrator behavior | `Audio Playback Flow.md` |
| Interruptions | `Recovery Flows.md` |
| Library entry | `Book Library Flow.md` |
| Visual system | `09_UI_UX_Guidelines.md` |

---

# Revision History

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-07-27 | Initial production UX spec for MVP recording states |
