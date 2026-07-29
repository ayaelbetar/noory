# QA Test Strategy

**Version:** 1.0  
**Status:** Final  
**Audience:** QA, Engineering, PM  
**Oracles:** `07_Acceptance_Criteria.md`, `08_Edge_Cases.md`  
**Copy oracle:** `11_Message_Library.md`

**Product hierarchy:** **Noory — نوري** is the main application; **Read with Noor — اقرأ مع نور** is its interactive reading feature; **Noor — نور** is the reading companion character.

---

# Purpose

Define how **Read with Noor** is verified before release: test layers, environments, device coverage, critical flows, AI mocking, and accessibility expectations for children **3–8** on the Noory platform.

---

# Quality Goals

1. Child never sees forbidden terminology or English UI copy; a simple final score appears only in Reading Summary (AC-03-01, AC-07-02).
2. State machine behavior matches `12_AI_Evaluation_Flow.md` under success, **Retry**, narrator playback, Decision 7, and all mapped failures.
3. **Reading Summary** shows pages, effort, and the simple final score; analytics match `15` without PII leakage.
4. Recoverable errors return the child to a clear next action without data loss (TA-05, EC-06).

---

# Test Layers

| Layer | Scope | Owner | Tools / notes |
|-------|--------|-------|----------------|
| **L1 — Unit** | Arabic evaluator, feedback, narrator, voice-feedback, and session-guard modules | Eng | Node.js built-in test runner (`node --test`) |
| **L2 — Browser UI / integration** | RTL layouts, CTA behavior, loading states, local mock outcomes | Eng / QA | Manual browser UI checks; automate JavaScript modules with Node.js tests where applicable |
| **L3 — API contract** | POST `/evaluate` request/response, HTTP codes, `error.code` set, timeouts | Eng / QA | Contract tests vs `15`; optional mock server |
| **L4 — End-to-end (manual + automated)** | Full **Reading Session** on device: consent → record → outcomes → summary | QA | Real devices; staged backend |
| **L5 — Exploratory** | UX tone, delight rotation, child comprehension (3–8) | UX / QA | Session notes; Arabic-native facilitators preferred |
| **L6 — Non-functional** | Recording start ≤2s, p95 evaluate ≤8s (staging), 120s/8MB guards | Eng / QA | Performance scripts; load on `/evaluate` |
| **L7 — Accessibility** | Touch target size, contrast, Arabic TalkBack labels | QA / UX | Per `09_UI_UX_Guidelines.md` + age band table below |
| **L8 — Regression** | Traceability matrix in `07` after each release candidate | QA | Checklist tied to US-01–US-07 |

**Exit criterion for MVP RC:** All P0 cases from `07` pass; all EC-01–EC-13 in `08` verified or explicitly waived with PM sign-off.

---

# Environments

| Environment | Use |
|-------------|-----|
| **Local / mock** | L1–L2 with stub evaluate; no real STT |
| **Staging** | L3–L6 with test stories; controlled API failures |
| **Production-like** | Pre-release smoke; real consent + analytics validation |

Consent (SP-01): include cases with consent denied (EC-12) and granted.

---

# Device Matrix

Minimum coverage before release:

| Category | Devices |
|----------|---------|
| **Android phone** | One mid-range (API 26+), one small screen |
| **Android tablet** | Primary form factor (persona Omar, age 7) |
| **iOS** | One iPhone, one iPad (if Noory ships iOS for MVP) |
| **Network** | Wi‑Fi, 4G, offline, flaky (airplane mode during **Uploading**) |
| **Audio** | Built-in mic; wired headset if platform supports |

Re-test on at least **one** device per OS for each release candidate after state machine or API changes.

---

# Flows to Cover (Critical Paths)

Map each flow to user stories and AC in `07`.

## F1 — Happy path completion

**Read with Noor** → welcome → **Preparing** → **Recording** → **Done** → **Success** → repeat → last page → **Completed** → **Reading Summary** → `cta.read_another_story`.

**Oracle:** AC-01-01, AC-02-*, AC-03-01, AC-06-01, AC-07-01, AC-07-02, EC-09.

## F2 — Retry + narrator + Success

First attempt → **Retry** → **Narrator** → **Idle** → re-record → **Success**.

**Oracle:** US-04/US-05 ACs; `narrator_started` analytics; narrator not before first attempt.

## F3 — Decision 7 Continue

Three **Retry** outcomes on same page → **Continue** UI → advance without **Success** on that page → summary counts page via `continued_without_success`.

**Oracle:** AC-06-02, EC-11, `page_continue_offered` / `page_continue_accepted`.

## F4 — Mic denied

**Oracle:** AC-02-03, EC-03, `mic.*` strings exact from `11`.

## F5 — Network and timeout failures

EC-01, EC-02, EC-08: **Idle** recovery, Session Store preserved, manual **Done** to retry (no auto re-upload on timeout).

## F6 — Empty / low confidence audio

EC-04, EC-05: appropriate `retry.*` or failure path; no child-facing technical error.

## F7 — Session interrupt

Background/kill during **Uploading**/**Evaluating** (EC-06): progress restored on return.

## F8 — Duplicate taps

EC-07: single upload; no duplicate `page_upload_completed`.

## F9 — Consent gate

EC-12: no evaluate API until consent satisfied.

## F10 — Gamification negatives

Per `Gamification Rules.md`: no badge, streak, leaderboard, or per-page score UI. The approved final score appears only in Reading Summary.

## F11 — Recording max duration

**Oracle:** EC-13, AC-02-02, `15` NFR — at **120s** auto **Done** → **Uploading**; if **413** `PAYLOAD_TOO_LARGE`, taxonomy recovery per `Error Handling.md`.

---

# Oracle Sources

| Source | Use in QA |
|--------|-----------|
| **`07_Acceptance_Criteria.md`** | Primary Given/When/Then; traceability matrix (decisions → AC → EC) |
| **`08_Edge_Cases.md`** | Failure scenarios, expected `failureCode`, messages, analytics |
| **`11_Message_Library.md`** | Exact Arabic strings and `message_key` for every visible label |
| **`12_AI_Evaluation_Flow.md`** | State names, transitions, taxonomy |
| **`15_Technical_Architecture.md`** | API payloads, analytics event names/properties, NFR numbers |
| **`01_Product_Brief.md`** | **Reading Summary** field definitions |
| **`Gamification Rules.md`** | Negative tests for out-of-scope mechanics |

When `07` and `08` disagree, escalate via `00_Project_Principles.md` tie-breakers; file doc fix if spec bug.

---

# AI and Backend Mocking

## Client UI tests (required)

Stub `ReadingBuddyApiClient` responses:

| Mock response | Expected UI state |
|---------------|-------------------|
| `outcome: SUCCESS` | **Success** + `success.*` |
| `outcome: RETRY`, `retryCount: 1..2` | **Retry** → **Narrator** |
| `outcome: RETRY`, `retryCount: 3`, `offerContinue: true` | **Continue** after narrator flow |
| Each `error.code` in `15` table | Mapped message + **Idle** (or mic path) |
| Client `NETWORK_ERROR` | `network.*` |

## Backend integration tests

- Valid audio → 200 with outcome.
- Empty audio → 422 `EMPTY_AUDIO`.
- Oversized → 413 `PAYLOAD_TOO_LARGE`.
- Processing delay → 408 `AI_TIMEOUT`.
- Verify no transcript/audio in logs (NFR).

## Staging E2E

Use fixed test stories with known page text; avoid non-deterministic flakiness by accepting **Retry** OR **Success** only on “borderline” fixtures if PM defines them; otherwise use controlled mock STT fixtures.

---

# Accessibility Checks by Age Band

Platform: children **3–8**, Arabic RTL (`00_Project_Principles.md`).

| Age band | Cognitive / motor | QA focus |
|----------|-------------------|----------|
| **3–4** | Limited reading; taps imprecise | Extra-large touch targets; minimal text per screen; audio-led **Narrator**; parent may co-tap — flow still understandable |
| **5–6** | Emerging readers | **Start Reading** / **Done** clearly distinct; loading messages not scary; **Retry** feels friendly |
| **7–8** | More patience; reads UI copy | Decision 7 **Continue** copy clear; progress “page X of Y” readable; no exam framing |

**All bands**

- Screen reader (TalkBack / VoiceOver): CTAs labeled with same Arabic as `11` (`cta.*`).
- Color: state not conveyed by color alone (`09`).
- Contrast: high contrast mode if host provides.
- Motion: celebration animation skippable/reduced when host supports reduced motion.
- RTL: mirror icons and reading order; verify `summary.line_pages` number order reads naturally.

Document failures with screenshots + `message_key` expected vs actual.

---

# Analytics Verification

For each critical flow, validate events in `15` § Analytics (staging debugger or test harness):

- Funnel: `reading_session_started` → … → `reading_session_completed`
- Outcomes: `page_outcome_success` / `page_outcome_retry` match UI
- Failures: `page_failure` with correct `failureCode`
- Decision 7: offer/accept events
- **No** custom events with PII or child transcript

---

# Test Data and Privacy

- Use synthetic child profiles; no real child recordings in shared tickets.
- Test audio clips: short Arabic samples approved for QA vault.
- Wipe Session Store between cases unless testing EC-06 persistence.

---

# Release Checklist (Condensed)

- [ ] Traceability: US-01–US-07 AC pass
- [ ] EC-01–EC-13 covered (incl. EC-13 max duration / F11)
- [ ] Device matrix executed on staging
- [ ] String audit vs `11` (including a11y labels)
- [ ] Gamification negatives pass
- [ ] Analytics spot-check on one full session
- [ ] NFR smoke: recording start, timeout behavior

---

# Related Documents

| Document | Role |
|----------|------|
| `Developer Notes.md` | Mock hooks, state implementation |
| `UX Writing Guide.md` | Copy review rules |
| `16_Cursor_Master_Prompt.md` | Eng milestones aligned with QA entry |

---

# Decision Summary

- Oracles are `07` and `08`; strings are `11`; states are `12`.
- Layer unit → contract → device E2E; mock AI for determinism.
- Accessibility validated per age band 3–8, not only on one “average” child profile.
