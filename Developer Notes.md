# Developer Notes

**Version:** 1.0  
**Status:** Final — engineering handoff supplement  
**Audience:** Flutter, backend, analytics engineers  
**Primary canonical docs:** `15_Technical_Architecture.md`, `12_AI_Evaluation_Flow.md`, `13_System_Flow.md`, `16_Cursor_Master_Prompt.md`

---

# Purpose

Implementation pointers that complement (not replace) architecture specs. Use this for day-one setup, module boundaries, and common pitfalls.

## Copy sync (mandatory)

| Source of truth | Implementation asset |
|-----------------|------------------------|
| **`11_Message_Library.md`** | Flutter `packages/reading_buddy/assets/messages_ar.json` (or host bundle) |

- Every child-visible key in code **must** exist in **`11`** with the same Arabic text.
- Do **not** ship keys with child-visible **scores** (e.g. «نتيجتك»), exam labels, or English UI.
- Add new keys via **`UX Writing Guide.md`** process → update **`11`** first, then JSON.

Registry: **`FINAL_DOCUMENTATION_INDEX.md`**.

---

# Flutter Module Boundaries

## Host vs Reading Buddy Module

Per `13_System_Flow.md`:

| Layer | Responsibility |
|-------|----------------|
| **Noory Mobile App (host)** | Story shell, consent (SP-01), content/narrator URLs, navigation, global RTL theme, analytics SDK |
| **Reading Buddy Module** | **Reading Session** UI, state machine, recording, API client, Session Store, message resolution |

## Host must expose

```dart
// Conceptual — names may match Noory platform conventions
StoryReadingContext(
  storyId,
  pages[],           // pageId, text, narratorAudioUrl
  totalPages,
  childDisplayName?, // optional; enables personal.*
  consentGranted,    // SP-01
)
```

Entry: **Read with Noor** (`cta.read_with_noor`) → module route with context.

## Module packages (suggested)

- `reading_buddy_state` — enum + transition reducer
- `reading_buddy_session` — Session Store persistence
- `reading_buddy_api` — `POST /v1/reading-buddy/evaluate`
- `reading_buddy_ui` — screens/widgets; strings via `message_key`
- `reading_buddy_analytics` — thin wrapper over Noory SDK

Implement order: see `16_Cursor_Master_Prompt.md`.

---

# State Machine (`12` + `13`)

**Single enum** `ReadingBuddyState` — names MUST match `12_AI_Evaluation_Flow.md`:

`idle` · `preparing` · `recording` · `uploading` · `evaluating` · `success` · `retry` · `narrator` · `continue` · `completed`

## Implementation notes

1. **Reducer pattern:** `(state, event) → state` with explicit events from transition table (`12` § Transition table).
2. **Uploading vs Evaluating:** May overlap in UI; both show `loading.*`; only one in-flight HTTP evaluate per page (debounce EC-07).
3. **Outcomes:** HTTP 200 with `result.outcome` → **Success** or **Retry** only. No third child outcome.
4. **Failures:** Map `error.code` or client `NETWORK_ERROR` via `12` § AI Failure Taxonomy → return **Idle** (or **Preparing** for mic) without incrementing success/retry outcome analytics incorrectly.
5. **Decision 7:** Backend `offerContinue` when `retryCount >= 3`; UI **Continue** state; persist `continuedWithoutSuccessPageIds[]`.
6. **Session exit:** Any state → persist Session Store (EC-06, TA-05); cancel in-flight upload when leaving **Uploading**/**Evaluating**.

## Session Store fields (`13`)

Persist locally: `clientSessionId`, `storyId`, `currentPageIndex`, `completedPageIds[]`, `continuedWithoutSuccessPageIds[]`, `pageRetryCounts{pageId}`, `attemptSequence{pageId}`, `sessionStartedAt`.

Use for **Reading Summary** `completedPages` / analytics payload — not for child-visible retry totals.

---

# API Client

- **Endpoint:** `POST /v1/reading-buddy/evaluate` — contract in `15_Technical_Architecture.md`.
- **Timeouts:** Client HTTP **60s**; treat server **408** / `AI_TIMEOUT` per taxonomy.
- **Limits:** Max **120s** audio, **8 MB**, max **40** evaluate calls per **Reading Session** (EA-08).
- **Never display** `error.message` (English internal) to the child — map to `11` keys only.

---

# Assets and Media

| Asset | Owner | Notes |
|-------|--------|------|
| Noor character states | Design / host bundle | Expressions per `10_Noor_Character.md` (listening, success, retry, completion) |
| Narrator audio | Content / host | `narratorAudioUrl` per page; play in **Narrator** state |
| Message strings | `11` | JSON or codegen; Arabic canonical |
| Optional success tone | Noory platform | Brief; mute if host policy disables (`01` § Celebration UX) |
| Mic / network icons | Design system | RTL-aware; a11y labels in Arabic |

Preload narrator for current page when entering **Retry** to reduce wait after evaluation.

---

# Analytics (Internal Fields Only)

**Canonical event list:** `15_Technical_Architecture.md` § Analytics Specification — do not duplicate or rename events in code comments elsewhere.

## Wrapper rules

- Fire events at triggers defined in `15` (e.g. `page_recording_started` on enter **Recording**).
- **Properties:** use documented fields only (`storyId`, `pageId`, `pageIndex`, `retryCount`, `failureCode`, `completedPages`, `sessionRetryTotal`, `durationSeconds`, etc.).
- **No PII** in custom properties: no raw name, audio, transcript (SP-03).
- **`page_failure`:** include `failureCode`, `recoverable`, `pageId`.
- **`reading_session_completed`:** align with **Reading Summary** calculations (`01_Product_Brief.md`).

Internal similarity scores stay server-side; never log child name with page transcripts.

---

# Copy and Localization

**Do not invent copy** (`11`, `16`, `UX Writing Guide.md`):

- Widgets call `messages.resolve('success.02')` (or equivalent).
- Placeholders: `{ChildName}`, `{completedPages}`, `{totalPages}` — substitute before display; fallback when name missing.
- Screen reader: Arabic labels from same keys as visible text (`09` § Accessibility).

---

# Recording UX (Pointers)

- **Recording start** ≤ **2s** from tap (`07` AC-02-01, NFR).
- **Recording stop:** minimum **1s** elapsed before **Done** accepted (AC-02-02).
- Auto-stop at **120s** → **Uploading**.
- During **Recording**: show `listen.*`; Noor quiet/minimal (`09` § Noor in the Interface).
- Mic permission in **Preparing**; denied → `mic.*`, EC-03.

See `12` Step Rules for narrator-before-child prohibition on first attempt (BR: Noor never reads page before first attempt).

---

# Testing Hooks (Dev / QA)

- **Mock API:** return `SUCCESS` / `RETRY` and each `error.code` from `15` table for UI tests.
- **Feature flag:** optional stub evaluate for offline UI development — must not ship to production without backend.
- **State logging:** debug builds may log state transitions; strip audio/content from logs.

---

# Age 3–8 Testing Matrix (Engineering)

Platform audience: **3–8 years**, Arabic (`00_Project_Principles.md`). Validate builds with representative devices and input modes:

| Age band | Focus | Engineering checks |
|----------|--------|---------------------|
| **3–4** | Tap targets, accidental double-tap | Debounce (EC-07); min 48dp targets (`09`); simple one-CTA screens |
| **5–6** | Core loop literacy | Clear **Start Reading** / **Done**; narrator auto-play understandable |
| **7–8** | Retry patience, longer sessions | Decision 7 **Continue** discoverable; loading states ≤ NFR; no score leakage |

| Dimension | Variants to smoke-test |
|-----------|-------------------------|
| **Form factor** | Phone (small), tablet (primary persona) |
| **Orientation** | Per Noory app policy |
| **Permission** | Mic granted / denied / re-request |
| **Network** | Online, offline at upload, mid-request drop (EC-01, EC-02) |
| **Audio** | Silent (EC-04), noisy environment (EC-05) |
| **Session** | Mid-session app background (EC-06) |
| **Accessibility** | Large text / TalkBack if host supports; reduced motion for celebration |

Usability sessions complement automated tests; AC oracles remain `07` + `08`.

---

# Security and Privacy Pointers

- SP-01–SP-05 in `14_Assumptions.md`.
- Consent gate before **Preparing** / API calls (EC-12).
- Audio retention/deletion per SP-02 (backend).

---

# Document Map (When Stuck)

| Question | Read |
|----------|------|
| States & failures | `12_AI_Evaluation_Flow.md` |
| Who calls whom | `13_System_Flow.md` |
| HTTP & analytics | `15_Technical_Architecture.md` |
| Strings | `11_Message_Library.md` |
| Acceptance tests | `07_Acceptance_Criteria.md` |
| Edge cases | `08_Edge_Cases.md` |
| Implementation order | `16_Cursor_Master_Prompt.md` |

---

# Decision Summary

- Flutter module owns state machine + session + evaluate client; host owns story, consent, content.
- Enum names and analytics events are fixed contracts.
- Child strings only from `11`; internal metrics never become UI scores.
- Test across 3–8 with device, network, and permission matrix above.
