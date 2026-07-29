# Business Rules

**Version:** 1.0  
**Status:** Final — implementation source of truth for product behavior  
**Audience:** Product, Engineering, QA, Analytics, Content  
**Platform:** Noory (ages **3–8**) · Feature: **Read with Noor**  
**Principle anchor:** `00_Project_Principles.md`  
**Related:** `03_Product_Decisions.md`, `11_Message_Library.md`, `12_AI_Evaluation_Flow.md`, `13_System_Flow.md`, `15_Technical_Architecture.md`, `Reading Evaluation Rules.md`, `AI Decision Tree.md`, `Error Handling.md`

---

## Purpose

This document defines **ID’d business rules (BR-*)** that govern **Read with Noor** and the surrounding Noory platform context. Rules are **normative**: if code, copy, or analytics conflict with a BR, the BR wins unless explicitly superseded in `19_Decision_Log.md`.

Rules are grouped by category. Each rule includes **enforcement** (who must implement it) and **verification** (how QA proves it).

---

## Terminology (canonical)

**Full project glossary:** `README.md` § Canonical Terminology. The table below is a **BR-only subset** for rule text.

| Term | Meaning |
|------|---------|
| **Reading Session** | One story from **Read with Noor** entry through **Reading Summary** |
| **Page attempt** | One **recording start** → read aloud → **recording stop** (**Done**) cycle |
| **Outcome** | Server result **Success** or **Retry** only (HTTP 200) |
| **Continue** | Decision 7 skip to next page after **3** **Retry** outcomes on the same page |
| **Failure** | Technical/processing error with `failureCode` — **not** a **Retry** outcome |
| **Internal reading band** | Backend-only label; never shown to the child (`Reading Evaluation Rules.md`) |

---

## Category: Platform (Noory)

### BR-PLT-01 — Age and locale scope

**Rule:** **Read with Noor** MVP targets children **3–8** reading **Arabic** stories aloud. Child UI is **Arabic-first**, **RTL**, per `00_Project_Principles.md` §11.

**Enforcement:** Host app + Reading Buddy module.  
**Verification:** UI locale audit; no English in child-visible strings except where Noory platform requires system dialogs.

### BR-PLT-02 — Feature entry

**Rule:** The child enters the activity only via approved CTA **`cta.read_with_noor`** (اقرأ مع نور). Passive story reading without Noor remains a separate Noory mode.

**Enforcement:** Noory host navigation.  
**Verification:** AC from `07_Acceptance_Criteria.md` session start; analytics `reading_session_started`.

### BR-PLT-03 — Native Noory experience

**Rule:** Visual patterns, touch targets, and session exit behavior align with Noory app standards (`09_UI_UX_Guidelines.md`). Reading Buddy is embedded, not a standalone web view or chat surface.

**Enforcement:** Flutter module + design review.  
**Verification:** Design QA checklist against Noory component library.

### BR-PLT-04 — Session boundaries

**Rule:** One **Reading Session** maps to one `clientSessionId` (UUID), one `storyId`, and persists page progress in Session Store until **Completed** or explicit exit (`13_System_Flow.md`).

**Enforcement:** Client Session Store.  
**Verification:** Restart app mid-story; progress retained per `14_Assumptions.md` TA-05 / EC-06.

### BR-PLT-05 — Cost and abuse guard

**Rule:** Maximum **40** evaluate calls per **Reading Session** and per-recording limits (**120s**, **8 MB**) per `15_Technical_Architecture.md` § NFR.

**Enforcement:** Client counter + server validation.  
**Verification:** Integration test at limit; expect graceful block with child-safe messaging (no “limit exceeded” blame copy — use `network.02` or host-standard gentle message if product adds a key later).

---

## Category: Read with Noor (activity)

### BR-RWF-01 — Child tries first (recording order)

**Rule:** On each page, **Noor MUST NOT play narrator audio before the child’s first evaluation attempt** on that page. Sequence is mandatory:

1. **Idle** → **Preparing** (consent/mic) → **Recording** (**recording start**)
2. Child reads aloud → **recording stop** (**Done**, `cta.done_reading`)
3. **Uploading** / **Evaluating** → outcome **Success** or **Retry**

**Enforcement:** State machine (`12_AI_Evaluation_Flow.md`); narrator gated on **Retry** path only after first outcome.  
**Verification:** First visit to page: no `narrator_started` before first `page_outcome_*` or `page_failure`.

### BR-RWF-02 — Single primary action per step

**Rule:** At each state, expose one primary child action where possible: **Start Reading**, **Done**, **Next Page**, **Retry**, **Continue** (`11_Message_Library.md` UI labels).

**Enforcement:** UX + Flutter UI layer.  
**Verification:** Tap-target audit; debounce duplicate taps (EC-07).

### BR-RWF-03 — Story-first UI

**Rule:** Page illustration and story text remain visually dominant; Noor feedback is brief overlay or companion area — not an exam results screen.

**Enforcement:** UX (`20_Design_Principles.md`).  
**Verification:** No full-screen “score” or red error styling.

### BR-RWF-04 — Reading Summary

**Rule:** At **Completed**, show **Reading Summary** with effort, pages, and one simple final reading score. Count **Success** pages plus Decision 7 **Continue** pages in `completedPages` (`01_Product_Brief.md`).

**Enforcement:** Client summary calculator + copy keys.  
**Verification:** AC completion; analytics `reading_session_completed`.

### BR-RWF-05 — AI invisibility

**Rule:** Child-facing copy never references AI, robots, algorithms, STT, or “evaluation.” Noor speaks as a companion (`00_Project_Principles.md` §2, `11_Message_Library.md` Voice & Tone).

**Enforcement:** Copy pipeline; code review blocks hardcoded strings.  
**Verification:** String audit; forbidden-term scan.

---

## Category: Evaluation (internal only)

### BR-EVL-01 — Outcomes exposed to client

**Rule:** API HTTP 200 returns only `outcome`: **SUCCESS** | **RETRY**, plus `retryCount`, `offerContinue`. **Never** return similarity, transcript, STT text, or internal reading band to the client (`15_Technical_Architecture.md`).

**Enforcement:** Backend response serializer; client must not parse hidden fields.  
**Verification:** AC-07-02; proxy inspection of JSON.

### BR-EVL-02 — Internal reading bands

**Rule:** Backend assigns one internal band per successful evaluation pass: **Excellent Reading**, **Good Reading**, **Minor Mistakes**, **Major Mistakes**, **Needs Full Assistance** (`Reading Evaluation Rules.md`). Bands drive **analytics and ops only**, not child UI.

**Enforcement:** Evaluation engine.  
**Verification:** Server logs/metrics contain band; Flutter UI contains no band strings.

### BR-EVL-03 — Threshold decision

**Rule:** Similarity **≥ 0.70** (configurable server-side, default per `14_Assumptions.md` EA-05) maps internal analysis to API **SUCCESS**; below maps to **RETRY** unless processing fails (then `failureCode`, not outcome).

**Enforcement:** Decision Engine (`15_Technical_Architecture.md`).  
**Verification:** Golden-file tests at 0.69 vs 0.70 boundary.

### BR-EVL-04 — Final score only

**Rule:** Show only one simple final reading score after the full book is completed. Do not show per-page percentages, letter grades, “accuracy,” word-level corrections, or comparative rankings to the child.

**Enforcement:** Product + UX + engineering.  
**Verification:** UI walkthrough all states including **Retry** and **Continue**.

### BR-EVL-05 — Pronunciation analysis internal

**Rule:** Word- or phoneme-level pronunciation feedback is **out of MVP** for child UX. Internal pronunciation diff may be computed for band assignment and analytics only (`Reading Evaluation Rules.md`).

**Enforcement:** Backend only; no coaching UI.  
**Verification:** No phoneme highlight or “say it like this” child flows.

### BR-EVL-06 — Normal Retry is not failure

**Rule:** A **Retry** **outcome** is expected learning behavior. Fire `page_outcome_retry`, **not** `page_failure` (`12_AI_Evaluation_Flow.md`).

**Enforcement:** Analytics wrapper.  
**Verification:** Event stream on struggle pages.

---

## Category: Narrator and Retry path

### BR-NAR-01 — Narrator after Retry outcome

**Rule:** When outcome is **Retry**, transition to **Narrator** state and play host-provided `narratorAudioUrl` for the current page (`03_Product_Decisions.md` Decision 6).

**Enforcement:** Flutter playback after HTTP 200 **RETRY**.  
**Verification:** `narrator_started` follows `page_outcome_retry`; audio URL from host content.

### BR-NAR-02 — Narrator gate (first attempt)

**Rule:** Narrator MUST NOT run on **Success** path. Narrator MUST NOT run before the first **Done** evaluation on that page (see BR-RWF-01).

**Enforcement:** State machine guards.  
**Verification:** Unit tests on `ReadingBuddyState` transitions.

### BR-NAR-03 — Re-record after narrator

**Rule:** After narrator completes, return to **Idle** with **`cta.retry`** (حاول مرة أخرى) enabled for a new **recording start** on the same page.

**Enforcement:** Client state machine.  
**Verification:** Journey test: Retry → narrator → record again.

### BR-NAR-04 — Encouragement copy on Retry

**Rule:** **Retry** UI uses only `retry.*` messages plus `narrator.*` before playback (`11_Message_Library.md`).

**Enforcement:** Message key lookup.  
**Verification:** No invented Arabic strings in Retry state.

### BR-NAR-05 — Narrator is independent from Noor Voice

**Rule:** The **🔊 صوت نور** setting controls only Noor's optional TTS guidance, instructions, and encouragement. It MUST NOT mute, pause, hide, or otherwise affect the professional narrator audio. Narrator playback remains available and automatically plays after every eligible Retry outcome regardless of the setting.

**Enforcement:** Keep `NarratorService` separate from `VoiceFeedbackService`; settings may stop only the latter.
**Verification:** Turn **🔊 صوت نور** OFF, produce a Retry outcome, and verify the exact page narrator audio still plays.

---

## Category: Decision 7 — Retries and Continue

**Policy (clarification):** The child may **re-record** many times on the **Retry** path, but each processed **Retry** **outcome** on the **same page** increments `retryCount`. After **3** such outcomes, **Continue** is offered—not unlimited outcomes per page. Technical **failures** (`failureCode`) do not increment `retryCount` (**BR-RET-05**).

### BR-RET-01 — Retry outcome counting

**Rule:** `retryCount` increments on each API **RETRY** outcome for the same `pageId` within the same `clientSessionId`. Client Session Store `pageRetryCounts` reconciles with server response.

**Enforcement:** Client + server Decision Engine.  
**Verification:** Three deliberate **Retry** outcomes increment to 3.

### BR-RET-02 — Continue offer threshold

**Rule:** After **3** **Retry** outcomes on the **same page**, set `offerContinue: true` and enter **Continue** state (Decision 7, `03_Product_Decisions.md`). Constant: `MAX_RETRY_OUTCOMES_PER_PAGE = 3`.

**Enforcement:** Server Decision Engine; client honors `offerContinue`.  
**Verification:** AC-06-02; EC-11; analytics `page_continue_offered`.

### BR-RET-03 — Continue UX

**Rule:** **Continue** state shows `continue.01` or `continue.02` and primary CTA **`cta.continue_reading`**. Accepting advances page without requiring another **Success** on that page; record page id in `continuedWithoutSuccessPageIds[]`.

**Enforcement:** Session Store + navigation.  
**Verification:** `page_continue_accepted`; summary counts page as read.

### BR-RET-04 — Continue is not punishment

**Rule:** Copy frames **Continue** as moving the adventure forward, never as failure or skipping because the child “failed.”

**Enforcement:** Approved messages only.  
**Verification:** Copy review against `11_Message_Library.md` Decision 7 section.

### BR-RET-05 — Failures do not increment retryCount

**Rule:** `failureCode` responses (422/4xx/5xx, `NETWORK_ERROR`) do **not** count toward Decision 7 **Retry** tally unless product explicitly logs otherwise — **default: no increment** (`12_AI_Evaluation_Flow.md` transition notes).

**Enforcement:** Server + client outcome parsing.  
**Verification:** Simulate `AI_TIMEOUT` three times; **Continue** must not appear unless three **RETRY** outcomes occurred.

---

## Category: Consent and privacy

### BR-CNS-01 — Consent before microphone

**Rule:** **Read with Noor** and microphone capture require satisfied parent/guardian consent per **SP-01** (`14_Assumptions.md`). If consent declined, block **`cta.read_with_noor`** and mic APIs (EC-12).

**Enforcement:** Noory host consent flags.  
**Verification:** No `reading_session_started` without consent; no `/evaluate` calls.

### BR-CNS-02 — Consent version on evaluate

**Rule:** Client may send `consentVersion` on `POST /evaluate` when Noory platform provides it (`15_Technical_Architecture.md`).

**Enforcement:** API client.  
**Verification:** Request field present in staging when host supplies version.

### BR-CNS-03 — Audio retention

**Rule:** Backend deletes processing audio within **24 hours**; no raw audio in logs; device deletes temp audio after upload ACK or failed upload timeout (SP-02).

**Enforcement:** Backend lifecycle jobs; client temp file cleanup.  
**Verification:** Ops checklist; security review.

### BR-CNS-04 — No training on child voice (MVP)

**Rule:** Child audio and transcripts MUST NOT be used for general model training unless separately approved outside MVP (SP-04).

**Enforcement:** Vendor contracts + data pipeline.  
**Verification:** Legal/DPA sign-off tracked in `14_Assumptions.md`.

### BR-CNS-05 — Minimum child-visible data

**Rule:** Personalization uses existing Noory child display name only when available (`personal.*` keys); no new child profile creation in Reading Buddy MVP (SP-03).

**Enforcement:** Host context `StoryReadingContext`.  
**Verification:** Missing name falls back to non-personalized messages.

---

## Category: Analytics (internal scoring allowed)

### BR-ANL-01 — Canonical event list

**Rule:** Emit only events defined in `15_Technical_Architecture.md` § Analytics. Do not duplicate event names in other docs.

**Enforcement:** `AnalyticsSpec` helpers.  
**Verification:** SDK payload audit.

### BR-ANL-02 — Internal scoring in analytics/backend

**Rule:** **Allowed (internal only):** similarity score, internal reading band, STT confidence bucket, `processingTimeMs`, `failureCode`, `retryCount`. **Forbidden in client API responses and child UI.**

**Enforcement:** Backend logging pipeline; analytics schema extension behind server-side or secure pipeline — never in HTTP 200 body to Flutter.

**Verification:** API contract tests; Flutter network layer tests assert absence of score fields.

### BR-ANL-03 — No raw audio/transcript in analytics

**Rule:** Analytics payloads exclude raw audio, full transcripts, and PII beyond existing Noory session identifiers (SP-03, SP-05).

**Enforcement:** Analytics wrapper sanitization.  
**Verification:** Event property allowlist review.

### BR-ANL-04 — Outcome vs failure separation

**Rule:** `page_outcome_success` / `page_outcome_retry` for HTTP 200 outcomes; `page_failure` only for error taxonomy (`12_AI_Evaluation_Flow.md`).

**Enforcement:** Client event mapping.  
**Verification:** QA matrix per `08_Edge_Cases.md`.

---

## Category: Recording and upload

### BR-REC-01 — Recording duration

**Rule:** Minimum **1s** after **Done**; maximum **120s** then auto-**Done** → **Uploading** (EC-13).

**Enforcement:** Client recorder.  
**Verification:** Timer tests; `durationMs` validation on API.

### BR-REC-02 — One evaluate per Done

**Rule:** Each **recording stop** triggers exactly one `POST /evaluate` with incremented `attemptSequence` and `Idempotency-Key` (`15_Technical_Architecture.md`).

**Enforcement:** API client; debounce (EC-07).  
**Verification:** No duplicate uploads on double-tap **Done**.

### BR-REC-03 — Allowed audio formats

**Rule:** `audio/mp4` (AAC) or `audio/wav` only; client must reject other MIME before upload.

**Enforcement:** Client encoder + server validation.  
**Verification:** `UNSUPPORTED_FORMAT` path in `Error Handling.md`.

### BR-REC-04 — Loading copy during upload/evaluate

**Rule:** Show `loading.*` only; no grading language (`11_Message_Library.md`).

**Enforcement:** UI state **Uploading** / **Evaluating**.  
**Verification:** Copy audit during slow network simulation.

---

## Rule precedence

When rules conflict, apply order from `00_Project_Principles.md` **Principle Conflicts**, then:

1. **BR-CNS-*** (consent/privacy) and **BR-EVL-04** (final score only)  
2. **BR-RWF-01** (child tries first)  
3. **BR-RET-*** (Decision 7)  
4. **BR-ANL-02** (internal analytics vs client API)  
5. Operational convenience  

Document exceptions in `19_Decision_Log.md`.

---

## Traceability matrix (selected)

| BR ID | Primary doc cross-ref | QA anchor |
|-------|----------------------|-----------|
| BR-RWF-01 | `00` §3a, `12` states | AC narrator gate |
| BR-EVL-01, BR-EVL-04 | `15` POST `/evaluate` | AC-07-02 |
| BR-RET-02 | `03` Decision 7, `12` | AC-06-02, EC-11 |
| BR-CNS-01 | `14` SP-01 | EC-12 |
| BR-ANL-02 | `15` § Analytics, SP-05 | Analytics schema review |

---

## Change log

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-07-27 | Initial production BR catalog for Read with Noor MVP |
