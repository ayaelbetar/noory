# 14_Assumptions

# Assumptions

**Version:** 1.2  
**Status:** Final

---

# Purpose

Product hypotheses, **privacy requirements**, and the **canonical engineering assumption registry** for AI Reading Buddy MVP.

**Status labels (engineering registry only):**

- **Confirmed** — fixed by this spec; implement as written.
- **Assumption – Needs Validation** — implement provisional default; validate with Noory platform / ops / legal.
- **Out of Scope** — explicitly not part of MVP.

---

# Engineering Assumption Registry (Canonical)

All engineering choices and open technical decisions live here. Other documents MUST reference `EA-*` IDs instead of duplicating “open questions.”

| ID | Statement | Status |
|----|-----------|--------|
| EA-01 | Backend framework is NestJS **or** FastAPI | Assumption – Needs Validation |
| EA-02 | Arabic STT + evaluation vendors (subprocessors) | Assumption – Needs Validation |
| EA-03 | Story text, page ids, and `narratorAudioUrl` come from **Noory host app** / existing Content APIs — not from Reading Buddy MVP backend | **Confirmed** |
| EA-04 | Mobile implementation target is **Flutter** (Dart 3.x) | **Confirmed** |
| EA-05 | Similarity threshold **0.70** for **Success** vs **Retry** | Assumption – Needs Validation (pilot tuning) |
| EA-06 | Analytics delivery via existing **Noory analytics SDK/pipeline** | Assumption – Needs Validation |
| EA-07 | `/evaluate` availability SLO **99.5%** monthly | Assumption – Needs Validation (ops ownership) |
| EA-08 | Cost guard: max **40** `/evaluate` calls per **Reading Session**; max **120s** audio | **Confirmed** |
| EA-09 | Monitoring alerts (5xx, latency, `AI_TIMEOUT` rate) | Assumption – Needs Validation (ops) |
| EA-10 | Server-side malware scan on uploads | Assumption – Needs Validation (or **Out of Scope** if Noory edge handles) |
| EA-11 | API auth via existing Noory Bearer session token | **Confirmed** |
| EA-12 | Server-side session **database** for Reading Buddy | **Out of Scope** (MVP) |
| EA-13 | OpenAPI YAML published separately | **Out of Scope** until post-MVP (human-readable contract in `15` is canonical) |

**External dependencies (not resolved in docs):** Noory legal sign-off on SP-01 consent copy; vendor STT contracts; production cloud region — track in release checklist, not MVP feature scope.

---

# Product Assumptions

## PA-01 — Children Enjoy Reading with a Companion

**Assumption**  
Children are more motivated when reading with a friendly companion.

**Risk**  
Children may ignore Noor.

**Mitigation**  
Usability testing; iterate on `10_Noor_Character.md` and `11_Message_Library.md`.

---

## PA-02 — Positive Feedback Builds Confidence

**Assumption**  
Encouraging messages increase motivation more than corrective feedback.

**Risk**  
Feedback may become repetitive.

**Mitigation**  
Context-aware rotation in `11_Message_Library.md`.

---

# User Assumptions

## UA-01

Children can independently tap simple controls.

## UA-02

Parents or guardians grant microphone permission when needed (see SP-01).

## UA-03

Children are reading Arabic stories appropriate for their age.

---

# Content Assumptions

- Every story has page-level text.
- Narrator audio exists for each page.
- Story content is age-appropriate.
- Reading order is predefined.

---

# Technical Assumptions

## TA-01 — Arabic STT Available

Reliable Arabic Speech-to-Text for children’s voices.  
**Registry:** EA-02 (**Assumption – Needs Validation**).

## TA-02 — Internet Required

Internet during **Uploading** / **Evaluating**. Offline evaluate: **Out of Scope** (EA-12 context).

## TA-03 — Evaluation Latency

p95 `processingTimeMs` ≤ **8000** after upload (`15` NFR).  
**Registry:** EA-07 for production SLO enforcement.

## TA-04 — Replaceable Providers

STT/evaluation swappable without UX change. **Confirmed.**

## TA-05 — Reading Session Persistence (MVP)

**Assumption**  
**Reading Session** state (current page, retry counts, completed/continued pages) persists **on device** via Noory app storage for the duration of the story and reasonable app restarts.

**Not in MVP:** Server-side session database, cross-device sync, or reading history product features.

**Mitigation**  
Document in `13_System_Flow.md` Session Store; recover gracefully if state lost (restart at last known page if available).

---

# Security, Privacy & Data Handling (MVP)

## SP-01 — Parent / Guardian Consent

**Policy**

- **AI Reading Buddy** is a child-directed feature inside Noory. Before the first use of **Read with Noor** (or before first **recording start** if Noory standard requires), show Noory’s **parent/guardian consent** flow covering:
  - Microphone use for the **Reading Session**
  - Temporary upload of audio for Arabic STT and page-level comparison
  - Data handling summarized below (link to Noory privacy policy)
- If consent is declined, **Read with Noor** is unavailable; core passive reading may still work per Noory app rules.
- MVP does **not** add a separate login; consent is delegated to **existing Noory platform** mechanisms.

**Engineering**  
Gate `cta.read_with_noor` and microphone APIs on consent flags provided by Noory host app.

**Legal copy:** **Assumption – Needs Validation** — exact strings owned by Noory legal (external dependency).

---

## SP-02 — Audio Storage & Retention

**Policy**

| Location | What | Retention |
|----------|------|-----------|
| Device (during session) | Recording buffer/blob until upload completes or fails | Delete after successful upload ACK or after user leaves page with failed upload (max **15 minutes** local temp) |
| Backend (processing) | Audio file for STT pipeline | Delete within **24 hours** of upload; do not retain for replay |
| Backend (logs) | No raw audio in application logs | N/A |
| Device (after session) | No long-term audio storage | Do not save recordings to gallery/files |

Transcripts produced by STT: treat as sensitive; delete with audio; do not persist on server beyond processing job in MVP.

---

## SP-03 — Child Privacy

- Collect **minimum data**: story/page IDs, timestamps, outcome enum (**Success** / **Retry** / **Continue** skip), retry counts, session completion — for reliability and **analytics** only.
- **No** child-facing profile creation beyond what Noory already has.
- **No** selling or sharing voice data with third parties except subprocessors required for STT/evaluation under Noory DPA.
- Display names for personalization only if already in Noory child profile (`11_Message_Library.md`).

---

## SP-04 — AI Usage Policy

- **Purpose limitation:** Audio and text used only to produce **Success** / **Retry** for the current page and aggregate session metrics.
- **No training:** Child audio and transcripts MUST NOT be used to train general-purpose models unless Noory legal explicitly approves a separate program (out of MVP scope).
- **MVP default evaluation:** Deterministic similarity / token match (`12_AI_Evaluation_Flow.md`). If LLM comparison is used, output restricted to structured outcome; no free-text to child.
- **Provider failover:** Degrade to **Retry** + narrator path; never expose provider errors to child.

---

## SP-05 — Data Handling Summary

| Data type | Child-visible | Stored server-side (MVP) | Analytics |
|-----------|---------------|---------------------------|-----------|
| Voice audio | No (ephemeral) | Transient ≤24h | No raw audio |
| STT transcript | No | Transient with audio | Aggregated only |
| Page outcomes | No scores | Optional event log (no PII) | Yes — **`15_Technical_Architecture.md` § Analytics (canonical)** |
| Reading Summary stats | Effort/pages only | Session events optional | Yes |

---

# Business Assumptions

- Reading engagement is a key success metric.
- Parents value independent reading practice.
- MVP validates user value before expanding functionality.

---

# Constraints

- MVP scope only.
- Arabic language only (child UI).
- No new authentication flows.
- No parent dashboard UI.
- No teacher portal.
- No offline **evaluation** mode.

---

# Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Slow AI response | Poor UX | Loading copy; timeout → manual **Done** (`12`) |
| Speech recognition errors | **Retry** loops | Narrator + Decision 7 **Continue** |
| Network instability | Interrupted flow | Session Store + `network.*` messages |
| Message repetition | Lower engagement | Contextual rotation |
| Privacy non-compliance | Legal | SP-01–SP-05; Noory policy alignment |

---

# If an Assumption Fails

- Re-evaluate product decision; update scope if needed; user feedback; iterate.

---

# PM Thinking

Assumptions are hypotheses. Privacy rules are **requirements**, not hypotheses—confirm with Noory legal before release.

---

# Decision Summary

## Decisions Made

- Documented SP-01–SP-05 for MVP.
- Client-local session persistence (TA-05).
- 24h max server audio retention.

## Open Questions

None — use **Engineering Assumption Registry** (EA-*) and SP-01 legal flag below.

## Future Enhancements

- Parent dashboard with aggregated stats only.
- Assumption validation log in Noory ops.

**Removed duplicate open questions:** STT provider, threshold, backend stack → EA-01, EA-02, EA-05.
