# 08_Edge_Cases

# Edge Cases

**Version:** 1.3  
**Status:** Final — **canonical owner** of **EC-01 through EC-13**  
**Detail for `failureCode` recovery:** **`Error Handling.md`** (do not duplicate EC definitions there without EC ID reference)

---

# Purpose

Boundary and failure scenarios. Map each to **`failureCode`** (`12` taxonomy), **`11` messages**, and **`15` § Analytics** (`page_failure` or outcome events).

**Extended catalog:** **`Error Handling.md`** and **`Recovery Flows.md`** use the full template (Trigger, System Behavior, UI, Voice, Recovery, Developer Notes, QA Notes) for every failure class. This file retains MVP **EC-*** IDs for traceability with **`07_Acceptance_Criteria.md`**.

---

# EC-01 — No Internet Connection

**Scenario**  
Internet unavailable before or during **Uploading**.

**failureCode:** `NETWORK_ERROR`  
**Expected:** `network.*`; state **Idle**; Session Store preserved.

---

# EC-02 — Internet Lost During Evaluation

**Scenario**  
Connection drops mid-request.

**failureCode:** `NETWORK_ERROR`  
**Expected:** Same as EC-01; increment `attemptSequence`; child taps **Done** again when online.

---

# EC-03 — Microphone Permission Denied

**Scenario**  
Mic declined in **Preparing**.

**failureCode:** N/A (platform)  
**Expected:** `mic.*`; remain **Idle** / **Preparing** until granted.

---

# EC-04 — No Voice Detected

**Scenario**  
Empty/silent audio.

**failureCode:** `EMPTY_AUDIO`  
**Expected:** `retry.*`; re-record.

---

# EC-05 — Background Noise

**Scenario**  
STT/eval unreliable.

**failureCode:** `LOW_CONFIDENCE` or `RETRY` outcome  
**Expected:** If 422 `LOW_CONFIDENCE` → `retry.02`; if outcome **Retry** → normal **Retry** path + `page_outcome_retry`.

---

# EC-06 — Child Leaves the Page

**Scenario**  
Exit during **Uploading** / **Evaluating**.

**Expected:** Cancel request; persist Session Store (TA-05).

---

# EC-07 — Multiple Button Taps

**Scenario**  
Duplicate **Start** / **Done** / **Retry**.

**Expected:** Debounce; one active upload; EC maps to no duplicate `page_upload_completed`.

---

# EC-08 — AI Timeout

**Scenario**  
Server >30s or HTTP 408.

**failureCode:** `AI_TIMEOUT`  
**Expected:** `network.02`; **Idle**; manual **Done** (no auto re-upload).

---

# EC-09 — Last Page Completed

**Scenario**  
Final page **Success** or Decision 7 **Continue**.

**Expected:** **Completed** + **Reading Summary**; `reading_session_completed`.

---

# EC-10 — Unsupported Audio

**Scenario**  
Bad format/corrupt file.

**failureCode:** `INVALID_AUDIO` or `UNSUPPORTED_FORMAT`  
**Expected:** `retry.01`; re-record.

---

# EC-11 — Decision 7 (Max Retry → Continue)

**Scenario**  
3 **Retry** outcomes on same page.

**Expected:** **Continue** state; `page_continue_offered` / `page_continue_accepted`; see AC-06-02.

---

# EC-12 — Parent / Guardian Consent Not Granted

**Scenario**  
SP-01 not satisfied.

**Expected:** No API calls; **Read with Noor** blocked.

---

# EC-13 — Recording Max Duration

**Scenario**  
120s reached.

**Expected:** Auto **Done** → **Uploading**; if `PAYLOAD_TOO_LARGE` handle via taxonomy.

---

# UX Principles for Edge Cases

Never blame child; use `11` only; always return to a clear next step (**Idle** / **Continue**).

---

# PM Thinking

Edge cases = test cases for QA; codes = backend/Flutter contract.

---

# Decision Summary

## Decisions Made
- EC mapped to `failureCode` where applicable.

## Open Questions
None.

## Future Enhancements
- Offline-specific ECs (Out of Scope MVP).
