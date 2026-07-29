# 07_Acceptance_Criteria

# Acceptance Criteria

**Version:** 1.2  
**Status:** Final

---

# Purpose

Define testable acceptance criteria for every MVP user story (Given / When / Then).  
Canonical terms: `README.md`. Arabic copy: `11_Message_Library.md`.  
State machine: `12_AI_Evaluation_Flow.md`. API & NFR: `15_Technical_Architecture.md`. Analytics: `15` § Analytics (canonical).

---

# US-01 — Start Reading with Noor

### AC-01-01: Start Reading Session

**Given** the child is on the story details page  
**And** Noory parent/guardian consent for **AI Reading Buddy** is satisfied (`14_Assumptions.md` SP-01)  
**When** the child taps **Read with Noor** (`cta.read_with_noor`)  
**Then** the **Reading Session** screen opens (RTL Arabic)  
**And** Noor displays a welcome message from `welcome.*`.

### AC-01-02: Consent gate

**Given** consent is not satisfied  
**When** the child attempts **Read with Noor**  
**Then** the Noory consent flow is shown  
**And** **Reading Session** does not start until approved.

### AC-01-03: Optional child name

**Given** the child enters **Read with Noor** for the first time  
**When** the introduction screen is shown  
**Then** the child may enter an optional name and continue without entering one  
**And** the chosen name is saved locally and used in Noor's encouragement messages  
**And** the child can edit it later from the feature settings icon.

---

# US-02 — Record Reading

### AC-02-01: Recording start

**Given** the reading page is open in state **Idle**  
**When** the child taps **Start Reading** (`cta.start_reading`)  
**Then** state becomes **Preparing** then **Recording** within 2 seconds  
**And** a listening indicator is visible  
**And** analytics `page_recording_started` fires (`15` § Analytics).

### AC-02-02: Recording stop

**Given** state **Recording** with at least 1 second elapsed  
**When** the child taps **Done** (`cta.done_reading`)  
**Then** **recording stop** occurs  
**And** state becomes **Uploading**  
**And** client calls `POST /v1/reading-buddy/evaluate` per `15`.

### AC-02-03: Microphone permission denied

**Given** microphone permission is unavailable  
**When** **recording start** is attempted  
**Then** show `mic.*` messages  
**And** allow permission to be requested again.

---

# US-03 — Page processing (internal evaluation)

### AC-03-01: Evaluation outcomes

**Given** **upload** completed  
**When** **evaluation** finishes  
**Then** the system assigns exactly one outcome: **Success** or **Retry**  
**And** the child never sees the words AI or Try Again; a simple final reading score is shown only in the Reading Summary.

### AC-03-02: Evaluation timeout

**Given** **evaluation** exceeds 30 seconds  
**When** timeout occurs  
**Then** show friendly Arabic message (`network.02` or `loading.*`)  
**And** the child must tap **Done** again to re-submit (no automatic re-upload).

### AC-03-03: Failure code UX

**Given** API returns `error.code` or client `NETWORK_ERROR`  
**When** mapped via `12` AI Failure Taxonomy  
**Then** show the specified `11` message keys only  
**And** fire analytics `page_failure` with `failureCode`  
**And** return to **Idle** for re-record (no child-facing English error).

---

# US-04 — Positive Feedback (Success)

### AC-04-01: Success path

**Given** outcome **Success**  
**When** feedback is shown  
**Then** Noor displays `success.*`  
**And** **Continue** via `cta.next_page` is enabled.

---

# US-05 — Narrator Support (Retry)

### AC-05-01: Retry path

**Given** outcome **Retry**  
**When** the **Retry** state begins  
**Then** Noor displays `retry.*`  
**And** **narrator** audio plays for the page  
**And** `cta.retry` is available for a new **recording start**.

### AC-05-02: Narrator independence from Noor Voice

**Given** **🔊 صوت نور** is turned OFF  
**When** the page evaluation returns **Retry**  
**Then** Noor's optional guidance voice does not play  
**And** the professional narrator audio for that exact page still plays normally  
**And** the reading flow remains unchanged.

---

# US-06 — Continue Reading

### AC-06-01: Next page after Success

**Given** outcome **Success** on a non-final page  
**When** the child taps `cta.next_page`  
**Then** the next page opens  
**And** progress updates (Page X of Y).

### AC-06-02: Decision 7 — Continue

**Given** the same page has received **3** outcomes of **Retry**  
**When** the third **Retry** flow completes  
**Then** show `continue.*` and `cta.continue_reading`  
**When** the child taps **Continue**  
**Then** advance to the next page without **Success** on that page  
**And** mark page as continued in session stats.

---

# US-07 — Finish Story & Reading Summary

### AC-07-01: Completion

**Given** the final page reaches **Success** or Decision 7 **Continue**  
**When** **completion** triggers  
**Then** show `complete.*` celebration  
**And** show **Reading Summary** per `01_Product_Brief.md`.

### AC-07-02: Reading Summary content

**Given** **Reading Summary** is displayed  
**Then** show `summary.line_pages` with correct `{completedPages}` and `{totalPages}`  
**And** show `summary.line_effort`  
**And** show one simple final reading score for the completed story, while hiding per-page accuracy and **Retry** counts  
**And** offer `cta.read_another_story`.

---

# Non-Functional Acceptance Criteria

See **`15_Technical_Architecture.md` § NFR** (canonical).

- **Recording start** ≤ 2s (AC-02-01).
- Client HTTP timeout **60s**; server processing **30s** → `AI_TIMEOUT`.
- p95 evaluation ≤ **8000ms** `processingTimeMs` (TA-03).
- Max audio **120s** / **8 MB**; max **40** evaluate calls per session (EA-08).
- UI responsive on main isolate during **Uploading** / **Evaluating**.
- Recoverable errors per `12` taxonomy only.
- **Reading Session** progress preserved (TA-05).
- Server audio deleted per SP-02 (backend integration test).
- Logging/monitoring per `15` NFR (no PII/audio in logs).

---

# Traceability Matrix

Maps **Product Decisions** → **User Stories** → **Acceptance Criteria** → **Edge Cases** → **AI Flow** → **System Flow** → QA coverage.

| Decision (`03`) | User Story | AC ID | Edge Case | AI Flow (`12`) | System Flow (`13`) |
|-----------------|------------|-------|-----------|----------------|-------------------|
| D1 Companion Noor | US-01 | AC-01-01 | — | Session start | Steps 1–2 |
| D3 AI invisible | US-03 | AC-03-01 | EC-08 | Guardrails | Noor messages only |
| D4 Encourage | US-04, US-05 | AC-04-01, AC-05-01 | EC-04–05 | Success/Retry UX | Decision Engine |
| D5 Page-level eval | US-03 | AC-03-01, AC-03-03 | EC-10 | Step 4 / taxonomy | POST `/evaluate` |
| D6 Narrator | US-05 | AC-05-01 | — | Step 6 | Narrator service |
| D7 Max Retry → Continue | US-06 | AC-06-02 | EC-11 | Step 7 | Decision Engine |
| D8 Minimal UI | US-01–07 | All | EC-07 | State machine | Reading UI |
| D10 Personalization | US-04 | AC-04-01 (optional) | — | — | Profile name if present |
| D12 Reading Summary | US-07 | AC-07-01, AC-07-02 | EC-09 | Step 8 | Completion |
| SP-01 Consent | US-01 | AC-01-02 | EC-12 | — | Gate before session |
| SP-02 Retention | NFR | NFR | EC-13 | Upload | Backend lifecycle |
| EC-13 Max recording | US-02 | AC-02-02 | EC-13 | Step 2 | Audio Recorder |

**QA rule:** Every EC-01–EC-13 must have at least one AC or dedicated backend/ops test noted in test plan.

---

# PM Thinking

Acceptance criteria describe observable behavior aligned with canonical **Success**, **Retry**, **Continue**, and **Reading Summary**—not implementation details.

---

# Decision Summary

## Decisions Made
- Gherkin AC with consent, recording stop, Decision 7, Reading Summary.
- Traceability matrix maintained here.

## Open Questions
None for AC coverage.

## Future Enhancements
- Accessibility-specific AC IDs.
- Parent-facing AC (post-MVP).
