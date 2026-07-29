# 15_Technical_Architecture

# Technical Architecture

**Version:** 1.2  
**Status:** Final — **engineering handoff (Flutter + backend)**

---

# Purpose

Architecture, **API contracts**, **canonical analytics**, **NFRs**, and **Flutter implementation** pointers for **AI Reading Buddy** MVP.

**Cross-references (must stay aligned):** `12_AI_Evaluation_Flow.md` (state + failures), `13_System_Flow.md` (components), `07_Acceptance_Criteria.md` (tests), `14_Assumptions.md` (engineering assumption registry).

---

# Architecture Principles

- Modular design; provider-agnostic STT/evaluation
- HTTPS only; child copy only from `11_Message_Library.md`
- Client owns **Reading Session** state (MVP); backend stateless per request

---

# High-Level Architecture

```
Flutter Reading Module (Noory App)
   │ Session Store + State Machine (12)
   ▼
HTTPS API  POST /v1/reading-buddy/evaluate
   ▼
Backend Orchestrator
   ├─► Speech-to-Text (Arabic)
   ├─► Evaluation (similarity ≥ 0.70 → Success else Retry)
   └─► Decision Engine (retryCount, offerContinue)
```

**Content & narrator:** Provided by **Noory host app** (story page text, `narratorAudioUrl`). Not owned by Reading Buddy backend in MVP (`14` EA-03).

---

# Frontend Responsibilities (Flutter)

- Implement state enum exactly as `12_AI_Evaluation_Flow.md` (**Idle** … **Completed**).
- `ReadingBuddyApiClient` → API below; map `failureCode` → UX via `12` taxonomy.
- `SessionStore`: persist fields in `13_System_Flow.md`.
- Emit analytics via `AnalyticsSpec` helpers (`15` § Analytics — canonical).
- RTL; all strings from `11` by `message_key`.
- Keep narrator playback (`narratorAudioUrl`) independent from the local **🔊 صوت نور** preference; the preference controls optional Noor TTS only.

---

# Backend Responsibilities

- Validate uploads; run STT + evaluation within timeouts (`15` § NFR).
- Return **Success** | **Retry** OR structured `failureCode` (no child-facing scores).
- Enforce SP-02 audio deletion ≤24h.
- Log/metric: `requestId`, latency, `failureCode` (no raw audio/transcripts in logs).

---

# API Contracts (MVP)

**Base URL:** `{NOORY_API_BASE}/v1/reading-buddy`  
**Auth:** Use existing Noory app session token (Bearer). Header: `Authorization: Bearer {token}`  
**Idempotency:** Client sends `Idempotency-Key: {clientSessionId}:{pageId}:{attemptSequence}` on evaluate (attemptSequence increments each **Done** press).

---

## POST `/evaluate`

Evaluate one page recording ( **upload** + **evaluation** in one request ).

| Item | Value |
|------|--------|
| **Method** | `POST` |
| **Content-Type** | `multipart/form-data` |
| **Timeout (client)** | **60s** connect+send+read |
| **Retry policy (client)** | Max **2** retries on `NETWORK_ERROR`, `503`, `502` with exponential backoff **1s, 2s**; **no** auto-retry on `4xx` except optional `408` once |

### Request (multipart fields)

| Field | Type | Required | Rules |
|-------|------|----------|--------|
| `clientSessionId` | UUID string | Yes | Client **Reading Session** id |
| `storyId` | string | Yes | Noory story id |
| `pageId` | string | Yes | Stable page id |
| `pageIndex` | integer | Yes | 0-based |
| `durationMs` | integer | Yes | 1000–120000 |
| `mimeType` | string | Yes | `audio/mp4` (AAC) or `audio/wav` |
| `audio` | file | Yes | Max **8 MB** |
| `consentVersion` | string | No | Noory consent record version (SP-01) |

### Response `200 OK` (evaluation succeeded)

```json
{
  "result": {
    "outcome": "SUCCESS",
    "retryCount": 2,
    "offerContinue": false
  },
  "meta": {
    "requestId": "req_abc123",
    "processingTimeMs": 3400
  }
}
```

`outcome` enum: `SUCCESS` | `RETRY` (maps to UI states **Success** / **Retry**).

- `retryCount`: server-side count of **Retry** outcomes for this page in this `clientSessionId` (client may reconcile with Session Store).
- `offerContinue`: `true` when `retryCount >= 3` (Decision 7).

**Never include** similarity score, transcript, or STT text in client response.

### Response `422 Unprocessable Entity` (processing failure)

```json
{
  "error": {
    "code": "AI_TIMEOUT",
    "recoverable": true
  },
  "meta": { "requestId": "req_abc123" }
}
```

`error.message` if present is **English internal** — do not show to child.

### HTTP status & error codes

| HTTP | `error.code` | Meaning |
|------|----------------|---------|
| 400 | `INVALID_AUDIO` | Missing/ corrupt / too short audio |
| 400 | `UNSUPPORTED_FORMAT` | MIME not allowed |
| 408 | `AI_TIMEOUT` | Processing > **30s** server-side |
| 413 | `PAYLOAD_TOO_LARGE` | > 8 MB |
| 422 | `EMPTY_AUDIO` | No speech detected |
| 422 | `LOW_CONFIDENCE` | STT confidence below minimum |
| 422 | `STT_FAILED` | STT provider error |
| 422 | `EVALUATION_FAILED` | Non-STT processing error |
| 502 | `UPSTREAM_ERROR` | STT/AI vendor failure |
| 503 | `SERVICE_UNAVAILABLE` | Temporary outage |
| — | `NETWORK_ERROR` | **Client-only** (no HTTP response) |

Full UX mapping: `12_AI_Evaluation_Flow.md` § AI Failure Taxonomy.

---

## GET `/health`

| Item | Value |
|------|--------|
| **Method** | `GET` |
| **Timeout** | 5s |
| **Response 200** | `{ "status": "ok", "version": "1.0.0" }` |
| **Use** | Optional preflight; not required for child flow |

---

# Analytics Specification (Canonical)

**Single source of truth.** All other docs MUST reference this section — do not duplicate event lists.

**Transport:** Noory analytics SDK / pipeline (exact SDK: **Assumption – Needs Validation** `14` EA-06).  
**PII:** No raw audio/transcripts; use existing Noory anonymous/session ids per SP-03.

| Event name | Trigger | Properties | Purpose | Success metric |
|------------|---------|------------|---------|----------------|
| `reading_session_started` | **Read with Noor** entered | `storyId`, `totalPages`, `clientSessionId` | Funnel start | Sessions started |
| `reading_session_preparing` | Enter **Preparing** | `storyId`, `pageIndex` | Mic/consent timing | Prep success rate |
| `page_recording_started` | **Recording** start | `storyId`, `pageId`, `pageIndex` | Engagement | Recordings / session |
| `page_recording_stopped` | **Done** pressed | `durationMs`, `pageId` | Quality | Valid duration rate |
| `page_upload_started` | Enter **Uploading** | `pageId`, `attemptSequence` | Pipeline | Upload attempts |
| `page_upload_completed` | HTTP 200/422 received | `pageId`, `latencyMs`, `httpStatus` | Performance | Upload success % |
| `page_outcome_success` | `outcome=SUCCESS` | `pageId`, `retryCount` | Learning path | Success rate / page |
| `page_outcome_retry` | `outcome=RETRY` | `pageId`, `retryCount` | Struggle signal | Retry rate |
| `page_failure` | Any `error.code` | `failureCode`, `recoverable`, `pageId` | Reliability | Failure rate by code |
| `page_continue_offered` | `offerContinue=true` | `pageId`, `retryCount` | Decision 7 | Offer rate |
| `page_continue_accepted` | **Continue** tapped | `pageId` | Motivation | Skip-after-retry rate |
| `narrator_started` | Enter **Narrator** | `pageId` | Support usage | Narrator plays |
| `reading_session_completed` | **Completed** + summary | `completedPages`, `totalPages`, `sessionRetryTotal`, `durationSeconds` | Core KPI | **Reading Session** completion |

**Reading Summary** calculations: `01_Product_Brief.md` (display); completion event carries analytics fields.

---

# Non-Functional Requirements (NFR)

| Area | Requirement |
|------|-------------|
| **Performance** | **Recording start** ≤ **2s** after tap (`07` AC-02-01). UI thread: no blocking work >16ms on main isolate. |
| **Latency** | p95 **evaluation** `processingTimeMs` ≤ **8000** after upload complete (`14` TA-03). |
| **Timeouts** | Client HTTP **60s**; server processing **30s** → `AI_TIMEOUT`. |
| **Availability** | Target **99.5%** monthly for `/evaluate` (**Assumption – Needs Validation** until SLO owned by ops — `14` EA-07). |
| **Audio limits** | Max **120s** / **8 MB** per request; max **40** evaluate calls per **Reading Session** (cost guard — `14` EA-08). |
| **Logging** | Structured JSON; fields: `requestId`, `storyId`, `pageId`, `outcome`, `failureCode`, `latencyMs`; **no** audio/transcript/PII. |
| **Monitoring** | Alerts on 5xx rate >2%, p95 latency >8s, `AI_TIMEOUT` >5% (`14` EA-09 ops). |
| **Cost awareness** | STT billed per audio minute — enforce duration limits; no client polling loops; single evaluate per **Done**. |

---

# Decision Engine (Backend)

- Similarity ≥ **0.70** → `SUCCESS`; else `RETRY` (`12`).
- Increment `retryCount` on each `RETRY` response.
- `offerContinue = (retryCount >= 3)`.

---

# Security & Privacy

SP-01–SP-05 in `14_Assumptions.md`. Upload validation: MIME whitelist, size cap, virus scan (**Assumption – Needs Validation** `14` EA-10 if not in Noory platform).

---

# Suggested Technology Stack

| Layer | Recommendation | Status |
|-------|----------------|--------|
| Mobile | **Flutter** (Dart 3.x) | **Confirmed** for this handoff doc |
| Backend | NestJS or FastAPI | **Assumption – Needs Validation** (`14` EA-01) |
| STT / eval vendors | TBD | **Assumption – Needs Validation** (`14` EA-02) |

---

# Flutter Developer Handoff (Day 1)

1. Read `12` state machine → implement `ReadingBuddyState` enum (names match § State Machine).
2. Implement `SessionStore` (shared_preferences or Noory storage abstraction).
3. Implement `ReadingBuddyApiClient.postEvaluate()` exactly as § POST `/evaluate`.
4. Map API `outcome` → transitions to **Success** / **Retry**; map `failureCode` via taxonomy in `12`.
5. Wire analytics wrapper calling events in § Analytics (canonical).
6. Do **not** hardcode Arabic strings — load from `11` keys (JSON/codegen optional).
7. Host app must expose: `StoryReadingContext(storyId, pages[], narratorUrl, childDisplayName?)`, consent flags.

**Guessing removed:** audio limits, timeouts, retry policy, error codes, state names, and event names are fixed above.

---

# API / Architecture Consistency Checklist

| Topic | `12` | `13` | `15` | `07` |
|-------|------|------|------|------|
| Outcomes Success/Retry | ✓ | ✓ | ✓ | AC-03-01 |
| Decision 7 count=3 | ✓ | ✓ | ✓ | AC-06-02 |
| Timeouts 30s/60s | ✓ | ✓ | ✓ | AC-03-02, NFR |
| No score to client | ✓ | ✓ | ✓ | AC-07-02 |
| Failure codes | Taxonomy | Error flow | HTTP table | AC-03-02 |

---

# PM Thinking

Contracts enable parallel Flutter/backend work without changing product behavior.

---

# Decision Summary

## Decisions Made
- API + analytics + NFR canonical in this file.
- Flutter as primary mobile target for implementation docs.

## Open Questions
None — open items live in `14` engineering registry with validation status.

## Future Enhancements
- OpenAPI YAML export; streaming STT.
