# Error Handling

**Version:** 1.0  
**Status:** Final — child-safe recovery spec  
**Audience:** Flutter engineers, Backend engineers, QA, Voice/content  
**Owner:** **`failureCode`** recovery detail (normative). **Edge case IDs EC-01–EC-13** are owned by **`08_Edge_Cases.md`** only—this file maps failures to EC where applicable and expands UI/voice/recovery.  
**Taxonomy source:** `12_AI_Evaluation_Flow.md` § AI Failure Taxonomy, `15_Technical_Architecture.md` HTTP table  
**Copy source:** `11_Message_Library.md` (`message_key` only)  
**Related:** `08_Edge_Cases.md`, `13_System_Flow.md`, `Business Rules.md`, `AI Decision Tree.md`

---

## Purpose

Define **what happens** when something goes wrong during **Read with Noor**: triggers, **system behavior**, **UI** (via `11` keys), **voice** (Noor TTS policy), **recovery** steps, and **developer/QA notes**.

**Distinction:** A **Retry** **outcome** (HTTP 200, `outcome: RETRY`) is **successful processing** — use `retry.*` and narrator. This document covers **`failureCode`** paths and platform errors only.

---

## Global handling principles

| Principle | Implementation |
|-----------|----------------|
| Never blame the child | All copy from `11`; no “you failed” framing (`00` §3) |
| Always offer a next step | Usually return to **Idle** with **recording start** or **Done** available |
| No technical details in UI | Do not show HTTP codes, `failureCode`, or English `error.message` |
| AI invisible | Use Noor voice/network wording, not “STT error” |
| Analytics | Emit `page_failure` with `failureCode`, `recoverable`, ids (`15` § Analytics) |
| Outcome count integrity | Failures **do not** increment Decision 7 `retryCount` (**BR-RET-05**) |

---

## UI state mapping (default)

| After handling | Reading Buddy state | Primary child action |
|----------------|---------------------|----------------------|
| Recoverable fault | **Idle** (same page) | **recording start** or **Done** if buffer retained* |
| Mic denied | **Idle** / **Preparing** | Retry permission via OS settings (host) |
| Consent missing | Feature blocked | Exit to Noory reading |

\*MVP default: after failed upload, discard buffer; child re-records (**BR-REC-02**).

---

## Voice (Noor TTS) policy

| Rule | Detail |
|------|--------|
| Speak selected `message_key` Arabic text | Same as on-screen where TTS enabled |
| Do not speak `en_reference` | Dev-only strings |
| Failures use network/retry/mic families | Not `success.*` |
| Optional | Host may disable TTS; on-screen text still required |

---

## Taxonomy reference (canonical codes)

| `failureCode` | HTTP | Edge case |
|---------------|------|-----------|
| `NETWORK_ERROR` | — (client) | EC-01, EC-02 |
| `AI_TIMEOUT` | 408 | EC-08 |
| `EMPTY_AUDIO` | 422 | EC-04 |
| `LOW_CONFIDENCE` | 422 | EC-05 |
| `INVALID_AUDIO` | 400 | EC-10 |
| `UNSUPPORTED_FORMAT` | 400 | EC-10 |
| `STT_FAILED` | 422 | — |
| `EVALUATION_FAILED` | 422 | — |
| `UPSTREAM_ERROR` | 502 | — |
| `SERVICE_UNAVAILABLE` | 503 | — |
| `PAYLOAD_TOO_LARGE` | 413 | EC-13 |

Platform (no `failureCode`): mic permission **EC-03**, consent **EC-12**, backgrounding **EC-06**, duplicate taps **EC-07**.

---

## NETWORK_ERROR

### Trigger

- No HTTP response (offline, DNS, TLS handshake failure).  
- Client abort or **60s** client timeout on `POST /evaluate` (`15`).  
- Connection drop mid-request (EC-02).

### System behavior

- Cancel or complete request with error in client.  
- Transition **Uploading** / **Evaluating** → **Idle**.  
- Preserve Session Store (`storyId`, `pageIndex`, `attemptSequence` already incremented on **Done** — do not roll back sequence).  
- Client may auto-retry request up to **2** times with backoff **1s, 2s** for transient network (`15`); if all fail, surface UX below.

### UI (`11` keys)

- Primary: `network.01`  
- Secondary (optional rotation): `network.02`  
- CTA: **recording start** (`cta.start_reading`) when ready

### Voice

- Speak `network.01` if TTS on.

### Recovery

1. Wait for connectivity.  
2. Child taps **recording start**, reads, **Done** again.  
3. New upload uses new `attemptSequence` / idempotency key.

### Developer notes

- Map all client transport errors to `NETWORK_ERROR` for analytics consistency.  
- Do not increment `retryCount` on server (no 200 body).  
- Log `requestId` if partial response received.

### QA notes

- Airplane mode before **Done** and during upload.  
- Expect `page_failure` with `recoverable: true`.  
- Verify no **Continue** offer from failures alone.

---

## AI_TIMEOUT

### Trigger

- Server processing exceeds **30s** → HTTP **408** (`15`).  
- EC-08.

### System behavior

- Parse `error.code` == `AI_TIMEOUT`.  
- **Idle**; **no** automatic re-upload of same blob.

### UI

- `network.02` (child-safe “try again later” tone — not “AI timed out”)  
- CTA: **Done** path requires new **recording start** → read → **Done**

### Voice

- `network.02`

### Recovery

Manual re-record and submit; optional client single retry on 408 per `15` policy.

### Developer notes

- Backend must emit before client 60s when possible to distinguish from `NETWORK_ERROR`.  
- Monitor `AI_TIMEOUT` rate alert (>5% per `15` NFR).

### QA notes

- Simulate slow STT stub >30s.  
- Confirm no auto-loop upload.

---

## EMPTY_AUDIO

### Trigger

- HTTP **422**; no speech detected in audio (silence, mic muted, far from mic).  
- EC-04.

### System behavior

- Reject evaluation; no outcome.  
- **Idle**; discard or keep buffer per client policy — **default discard**.

### UI

- `retry.01` (encouraging, not blaming)  
- CTA: **recording start**

### Voice

- `retry.01`

### Recovery

Re-record with audible speech; check mic input level in QA environments.

### Developer notes

- Distinguish from `INVALID_AUDIO` (corrupt/too short file).  
- Server validates `durationMs` minimum 1000.

### QA notes

- Submit silence clip; expect 422 and `page_failure`.

---

## LOW_CONFIDENCE

### Trigger

- HTTP **422**; STT confidence below reject threshold (`Reading Evaluation Rules.md`).  
- Heavy background noise (EC-05).

### System behavior

- No similarity outcome; optional internal log with confidence value.

### UI

- `retry.02` (“let’s listen together” tone)  
- CTA: **recording start**  
- **Note:** Narrator is **not** auto-played on failure; narrator plays on **Retry** **outcome** only. After re-record, if outcome **Retry**, narrator runs per normal path.

### Voice

- `retry.02`

### Recovery

Re-record in quieter environment; closer to mic.

### Developer notes

- Do not show confidence % to child.  
- Analytics may include `sttConfidenceBucket` server-side only.

### QA notes

- Play loud background noise sample; expect 422 or eventual **Retry** outcome depending on stub policy.

---

## INVALID_AUDIO

### Trigger

- HTTP **400**; corrupt file, too short, missing audio field, duration &lt; 1s.  
- EC-10.

### System behavior

- Reject before STT.  
- **Idle**.

### UI

- `retry.01`  
- CTA: **recording start**

### Voice

- `retry.01`

### Recovery

Re-record; verify encoder outputs valid AAC/WAV.

### Developer notes

- Client should pre-validate duration before upload to reduce 400s.

### QA notes

- Truncate file manually; expect 400.

---

## UNSUPPORTED_FORMAT

### Trigger

- HTTP **400**; MIME not in allowlist (`audio/mp4`, `audio/wav`).

### System behavior

- Reject; log client version and MIME.

### UI

- `retry.01`  
- CTA: **recording start**

### Voice

- `retry.01`

### Recovery

Fix client encoder configuration.

### Developer notes

- **Prevent in client** — server is last line of defense.

### QA notes

- Force wrong MIME in debug build only.

---

## STT_FAILED

### Trigger

- HTTP **422**; STT provider returned error or empty pipeline result.

### System behavior

- No transcript; no outcome.  
- May retry upstream once server-side before returning 422 (backend policy).

### UI

- `network.02`  
- CTA: retry **Done** flow later (**recording start** → read → **Done**)

### Voice

- `network.02`

### Recovery

User retry; ops fixes provider outage.

### Developer notes

- Map vendor codes to `STT_FAILED`; never forward vendor message to client.

### QA notes

- STT stub returns 500; expect 422 + `page_failure`.

---

## EVALUATION_FAILED

### Trigger

- HTTP **422**; comparison step failed (bug, bad reference text, normalization exception).

### System behavior

- Log stack server-side; return structured error only.

### UI

- `network.02`  
- CTA: re-record and **Done**

### Voice

- `network.02`

### Recovery

User retry; engineering fixes reference text or engine.

### Developer notes

- Alert on rate spike — may indicate content deployment mismatch.

### QA notes

- Missing page text in fixture → 422.

---

## UPSTREAM_ERROR

### Trigger

- HTTP **502**; vendor gateway failure.

### System behavior

- Client may retry up to 2 times with backoff (`15`).

### UI

- `network.02`

### Voice

- `network.02`

### Recovery

Retry when service restored.

### Developer notes

- Include `requestId` in ops logs.

### QA notes

- Simulate 502 twice then 200 — verify backoff.

---

## SERVICE_UNAVAILABLE

### Trigger

- HTTP **503**; maintenance or overload.

### System behavior

- Same retry policy as **502**.

### UI

- `network.02`

### Voice

- `network.02`

### Recovery

Delayed retry.

### Developer notes

- Respect `Retry-After` header if present (optional enhancement).

### QA notes

- Load test circuit breaker.

---

## PAYLOAD_TOO_LARGE

### Trigger

- HTTP **413**; audio &gt; **8 MB** or server limit.  
- Often follows max **120s** recording (EC-13).

### System behavior

- Reject upload; **Idle**.

### UI

- `retry.01`  
- CTA: **recording start** (shorter read)

### Voice

- `retry.01`

### Recovery

Child reads shorter passage or taps **Done** earlier.

### Developer notes

- Client should monitor blob size pre-upload.

### QA notes

- 121s+ or padded file &gt;8MB.

---

## Microphone permission denied (platform)

### Trigger

- OS denies mic in **Preparing** (EC-03).  
- **No** `failureCode`.

### System behavior

- Remain **Idle** or **Preparing**; no `/evaluate`.

### UI

- `mic.01`, `mic.02`  
- Host deep-link to Settings if Noory standard supports it.

### Voice

- `mic.02` preferred (explains why mic needed)

### Recovery

Parent grants permission; child taps **Read with Noor** / **recording start** again.

### Developer notes

- Do not call evaluate without permission.

### QA notes

- Deny twice; verify no crash.

---

## Upload failures (client orchestration)

### Trigger

- Multipart build failure, disk full, cancelled request (user navigation EC-06).

### System behavior

- Treat as `NETWORK_ERROR` or client `UPLOAD_CANCELLED` internal enum mapped to `NETWORK_ERROR` for analytics unless host distinguishes cancel.

### UI

- `network.01` or `network.02`  
- **Idle**

### Voice

- Match selected network message.

### Recovery

Re-record after return to page.

### Developer notes

- On EC-06, cancel HTTP and delete temp files per SP-02.

### QA notes

- Background app during **Uploading**; resume — no duplicate outcome.

---

## Evaluate step (client “Evaluating”)

### Trigger

- HTTP response received but JSON parse error.

### System behavior

- Map to `EVALUATION_FAILED` or `NETWORK_ERROR` if truncated body.  
- **Idle**

### UI

- `network.02`

### Voice

- `network.02`

### Recovery

Re-submit new recording.

### Developer notes

- Contract tests against `15` JSON schema.

### QA notes

- Malformed JSON stub.

---

## Backgrounding and session exit (EC-06)

### Trigger

- App to background during **Recording**, **Uploading**, or **Evaluating**.  
- User navigates away from story.

### System behavior

- **Recording:** pause/stop per platform policy; if stopped with &lt;1s, treat as cancel to **Idle**.  
- **Uploading:** cancel request; persist Session Store.  
- **Evaluating:** same as upload cancel.  
- Do **not** auto-play narrator.

### UI

- On return: **Idle** with page visible; optional `before.02`  
- No new message keys required

### Voice

- Optional `before.02` on resume

### Recovery

Normal **recording start** flow.

### Developer notes

- Host coordinates lifecycle; Reading Buddy module exposes `onHostPause()`.

### QA notes

- Switch apps mid-upload; verify no ghost **Success** UI.

---

## Duplicate button taps (EC-07)

### Trigger

- Double **Done**, **Start**, **Retry**.

### System behavior

- Debounce 300–500ms (product constant).  
- Single in-flight upload.

### UI

- No error message; ignore duplicate

### Voice

- No extra TTS

### Recovery

N/A

### Developer notes

- Guard `ReadingBuddyApiClient` with mutex/future.

### QA notes

- Rapid tap **Done** 5×; one `page_upload_completed`.

---

## Consent not granted (EC-12)

### Trigger

- SP-01 false.

### System behavior

- Block **Read with Noor** entry; zero evaluate calls.

### UI

- Host-owned consent screen (not in `11` MVP table)

### Voice

- Host-owned

### Recovery

Parent accepts consent in Noory settings.

### Developer notes

- Gate before `reading_session_started`.

### QA notes

- Consent false → no analytics session start.

---

## HTTP / failure quick matrix

| Code | UI message key(s) | Voice | Recoverable | Child action |
|------|-------------------|-------|-------------|--------------|
| `NETWORK_ERROR` | `network.01`, `network.02` | yes | yes | Re-record + **Done** |
| `AI_TIMEOUT` | `network.02` | yes | yes | Re-record + **Done** |
| `EMPTY_AUDIO` | `retry.01` | yes | yes | Re-record |
| `LOW_CONFIDENCE` | `retry.02` | yes | yes | Re-record |
| `INVALID_AUDIO` | `retry.01` | yes | yes | Re-record |
| `UNSUPPORTED_FORMAT` | `retry.01` | yes | yes | Re-record |
| `STT_FAILED` | `network.02` | yes | yes | Retry later |
| `EVALUATION_FAILED` | `network.02` | yes | yes | Retry later |
| `UPSTREAM_ERROR` | `network.02` | yes | yes | Retry later |
| `SERVICE_UNAVAILABLE` | `network.02` | yes | yes | Retry later |
| `PAYLOAD_TOO_LARGE` | `retry.01` | yes | yes | Shorter record |

---

## Logging and monitoring (developer)

| Field | Required |
|-------|----------|
| `failureCode` | yes |
| `requestId` | when available |
| `storyId`, `pageId`, `pageIndex` | yes |
| `clientSessionId` | yes |
| `latencyMs` | yes |
| Raw audio / transcript | **forbidden** in app logs |

Alerts: see `15` § NFR (5xx rate, p95 latency, `AI_TIMEOUT` %).

---

## QA regression pack (minimum)

1. Each `failureCode` row in matrix above (11 codes + network).  
2. EC-03 mic, EC-06 background, EC-07 debounce, EC-12 consent.  
3. Confirm **Retry outcome** still uses `retry.*` + narrator — **not** this failure matrix.  
4. Confirm Decision 7 only after three **RETRY** outcomes, not failures.

---

## Change log

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-07-27 | Full taxonomy aligned with `12`/`15`/`11` |
