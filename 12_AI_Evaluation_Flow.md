# 12_AI_Evaluation_Flow

# AI Evaluation Flow

**Version:** 1.2  
**Status:** Final  
**Canonical references:** API `15` · Analytics `15` § Analytics · Terms `README.md` · Copy `11` · Internal bands `Reading Evaluation Rules.md` · Decision tree `AI Decision Tree.md`

---

# Internal reading bands (reference only)

**Owner:** **`Reading Evaluation Rules.md`** (IRB-01–IRB-05, similarity thresholds, STT confidence gates, band → **SUCCESS** / **RETRY** mapping).

This document describes **session states and outcomes** only. Do not copy band tables here — link to **`Reading Evaluation Rules.md`**. Children always see **Success**, **Retry**, or Decision 7 **Continue** messaging from **`11_Message_Library.md`** — never internal band labels.

---

# Purpose

**Reading Session** lifecycle: states, transitions, outcomes, **AI Failure Taxonomy**, and recovery.

---

# Evaluation Outcomes (vs Failures)

| Outcome | UI state | Child UX |
|---------|----------|----------|
| **Success** | **Success** | `success.*` + `cta.next_page` |
| **Retry** | **Retry** | `retry.*` + **Narrator** + `cta.retry` |

**Failures** (`error.code` or client `NETWORK_ERROR`): no outcome; recover per taxonomy below.

---

# Reading Session State Machine (Complete)

### State diagram

```
                    ┌─────────────┐
                    │    Idle     │◄────────────────────────────┐
                    └──────┬──────┘                             │
                           │ Start Reading                      │
                           ▼                                    │
                    ┌─────────────┐                             │
                    │  Preparing  │ (mic permission, consent)   │
                    └──────┬──────┘                             │
                           │ ready                              │
                           ▼                                    │
                    ┌─────────────┐                             │
                    │  Recording  │─────────────────────────────┤
                    └──────┬──────┘  cancel / fault recover     │
                           │ Done / max 120s                    │
                           ▼                                    │
                    ┌─────────────┐                             │
                    │  Uploading  │─── failure ──► Idle ────────┤
                    └──────┬──────┘                             │
                           │ HTTP response                      │
                           ▼                                    │
                    ┌─────────────┐                             │
                    │ Evaluating  │ (client: awaiting response)  │
                    └──────┬──────┘                             │
              ┌────────────┼────────────┐                       │
              │ outcome    │ failure    │                       │
              ▼            ▼            │                       │
       ┌──────────┐  (recover)────────┘                       │
       │ Success  │                                             │
       └────┬─────┘                                             │
            │ Next Page (not last)                              │
            └─────────────────────────────────────────────────┘
            │ last page
            ▼
       ┌──────────┐     ┌─────────────┐
       │ Completed│────►│ Reading     │ (terminal: another story CTA)
       └──────────┘     │ Summary UI  │
                        └─────────────┘

       ┌──────────┐
       │  Retry   │──► Narrator ──► Idle (re-record)
       └────┬─────┘
            │ offerContinue
            ▼
       ┌──────────┐
       │ Continue │ (Decision 7 skip) ──► Idle or Completed
       └──────────┘
```

### State definitions

| State | Enum | Description |
|-------|------|-------------|
| **Idle** | `idle` | Page shown; may start **Preparing**. |
| **Preparing** | `preparing` | Consent/mic checks; optional `before.*`. |
| **Recording** | `recording` | Mic capture; `listen.*`. |
| **Uploading** | `uploading` | POST `/evaluate` in flight; `loading.*`. |
| **Evaluating** | `evaluating` | Client-side wait for parseable response (often overlaps upload). |
| **Success** | `success` | Outcome **Success**; show `success.*`. |
| **Retry** | `retry` | Outcome **Retry**; before/during narrator. |
| **Narrator** | `narrator` | Page narration playing. |
| **Continue** | `continue` | Decision 7; `continue.*` + `cta.continue_reading`. |
| **Completed** | `completed` | Session end; **Reading Summary** visible. |

### Transition table

| From | Event | To | Notes |
|------|-------|-----|-------|
| Idle | `tap_start_reading` | Preparing | Analytics: `reading_session_preparing` |
| Preparing | `mic_ready` | Recording | Fail → `mic.*`, stay Preparing/Idle |
| Preparing | `mic_denied` | Idle | EC-03 |
| Recording | `tap_done` / `max_duration` | Uploading | Analytics: `page_recording_stopped` |
| Uploading | `http_200_outcome` | Success or Retry | Parse `outcome` |
| Uploading | `http_422` / network | Idle | Failure taxonomy; **no** outcome increment |
| Evaluating | (same as upload complete) | Success / Retry / Idle | |
| Success | `tap_next_page` | Idle | Next page index++ |
| Success | `last_page` | Completed | Summary |
| Retry | `narrator_complete` | Idle | Enable `cta.retry` |
| Retry | `offerContinue=true` | Continue | After 3rd **Retry** outcome |
| Continue | `tap_continue_reading` | Idle or Completed | Mark `continued_without_success` |
| Any | `session_exit` | Idle | Persist Session Store EC-06 |

---

# Step Rules (unchanged product behavior)

- **Recording stop:** `cta.done_reading`; min 1s; max 120s auto-stop → Uploading.
- **Threshold:** 0.70 similarity → **Success** else **Retry** (server).
- **Decision 7:** `retryCount >= 3` → **Continue** state.
- **AI timeout:** 30s server → `AI_TIMEOUT`; child taps **Done** again (no auto re-upload).

---

# AI Failure Taxonomy (Canonical)

| `failureCode` | When | User message (`11`) | Recovery action | Analytics event |
|---------------|------|---------------------|-----------------|-----------------|
| `NETWORK_ERROR` | Client no HTTP / timeout 60s | `network.01` | Stay on page; retry **Done** when online | `page_failure` |
| `AI_TIMEOUT` | HTTP 408 / server 30s | `network.02` | Tap **Done** again | `page_failure` |
| `EMPTY_AUDIO` | HTTP 422 | `retry.01` | Re-record | `page_failure` |
| `LOW_CONFIDENCE` | HTTP 422 STT low confidence | `retry.02` | Re-record; narrator optional on next **Retry** outcome | `page_failure` |
| `INVALID_AUDIO` | HTTP 400 | `retry.01` | Re-record | `page_failure` |
| `UNSUPPORTED_FORMAT` | HTTP 400 MIME | `retry.01` | Re-record (client must send allowed MIME) | `page_failure` |
| `STT_FAILED` | HTTP 422 | `network.02` | Retry **Done** later | `page_failure` |
| `EVALUATION_FAILED` | HTTP 422 | `network.02` | Retry **Done** later | `page_failure` |
| `UPSTREAM_ERROR` | HTTP 502 | `network.02` | Retry with backoff (API policy) | `page_failure` |
| `SERVICE_UNAVAILABLE` | HTTP 503 | `network.02` | Retry with backoff | `page_failure` |
| `PAYLOAD_TOO_LARGE` | HTTP 413 | `retry.01` | Shorter recording | `page_failure` |

**Properties for `page_failure`:** `{ failureCode, recoverable, pageId, pageIndex, storyId }`.

**Note:** A normal **Retry** **outcome** is not a failure — fire `page_outcome_retry`, not `page_failure`.

---

# AI Design Principles & Guardrails

- AI invisible in child UI; no transcripts/scores on device.
- MVP evaluation: similarity-based (`14` SP-04).
- No training on child audio without legal approval.

---

# Out of Scope (MVP)

Word-level coaching; child-facing analytics; offline evaluate.

---

# PM Thinking

States map 1:1 to Flutter `ReadingBuddyState` and QA oracles.

---

# Decision Summary

## Decisions Made
- Full lifecycle including **Preparing** and **Completed**.
- Canonical failure codes aligned with `15` API.

## Open Questions
None — validation items in `14` EA-* registry.

## Future Enhancements
- Streaming STT state.
