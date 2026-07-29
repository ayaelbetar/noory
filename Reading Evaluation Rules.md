# Reading Evaluation Rules

**Version:** 1.0  
**Status:** Final — **internal / backend / analytics only**  
**Audience:** Backend engineers, ML/STT integrators, Analytics, QA (oracle definitions)  
**Not for:** Child UI, parent-facing dashboards in MVP, client API responses  
**Related:** `00_Project_Principles.md`, `12_AI_Evaluation_Flow.md`, `15_Technical_Architecture.md`, `Business Rules.md`, `AI Decision Tree.md`, `14_Assumptions.md` (EA-05, SP-04)

---

## Purpose

Define how the **Evaluation Engine** interprets a page recording against **expected page text** (from Noory host content). This document specifies **internal reading bands**, **STT confidence handling**, **pronunciation analysis**, and the **mapping to child-visible outcomes** (**Success**, **Retry**, **Continue**).

**Continue** is **not** produced by the evaluation engine directly; it is offered by the **Decision Engine** when `retryCount >= 3` after repeated **Retry** outcomes (Decision 7).

---

## Design constraints (non-negotiable)

| Constraint | Source |
|------------|--------|
| Child sees only **Success** or **Retry** UX (plus Decision 7 **Continue**) | `12`, `11` |
| HTTP 200 body excludes scores, bands, transcripts | `15`, BR-EVL-01 |
| Arabic STT + Arabic page text for MVP | `00` §11 |
| Similarity threshold default **0.70** for SUCCESS vs RETRY | `12`, `15`, EA-05 |
| Bands and numeric scores may appear in **server logs** and **internal analytics** | BR-ANL-02 |

---

## Pipeline overview (internal)

1. **Ingest** audio (validated MIME, duration, size).  
2. **STT** → transcript + per-utterance or global **confidence** (provider-specific; normalized internally).  
3. **Normalize** transcript and reference page text (Arabic diacritics policy, whitespace, tatweel removal — implementation detail in backend; document in code README).  
4. **Compare** transcript to reference → **similarity score** ∈ [0.0, 1.0].  
5. **Pronunciation pass** (optional sub-score) → internal flags only.  
6. **Assign internal reading band** from score + confidence + quality gates.  
7. **Map band → API outcome** **SUCCESS** or **RETRY**.  
8. **Decision Engine** updates `retryCount`, `offerContinue`.  

If steps 2–7 cannot complete, return **`failureCode`** (no outcome) per `12` / `15` — see `Error Handling.md`.

---

## Internal reading bands (canonical enum)

These strings are **English internal labels** for logs, metrics, and ops dashboards. **Never** localize them into child UI.

| Band ID | Internal label | Meaning (internal) |
|---------|----------------|-------------------|
| `IRB-01` | **Excellent Reading** | Strong match; high STT confidence; fluent page coverage |
| `IRB-02` | **Good Reading** | Solid match; minor normalization-only differences |
| `IRB-03` | **Minor Mistakes** | Match at or just above threshold; small word/substitution gaps |
| `IRB-04` | **Major Mistakes** | Below threshold; substantial omissions or substitutions |
| `IRB-05` | **Needs Full Assistance** | Very low match and/or STT unusable for fair comparison; child likely needs narrator support |

### Band assignment rules (default MVP)

Let **S** = similarity score after normalization (0.0–1.0).  
Let **C** = normalized STT confidence (0.0–1.0).  
Let **MIN_CONF** = minimum confidence to trust STT for banding (default **0.55**, server config).

**Quality gate:** If **C < MIN_CONF** and speech was detected, prefer HTTP **422** `LOW_CONFIDENCE` when audio is too ambiguous for fair scoring; if speech is clearly present but garbled, assign **Needs Full Assistance** internally then map to **RETRY** (see STT section).

| Condition (evaluated in order) | Internal band |
|--------------------------------|---------------|
| STT success, **C ≥ MIN_CONF**, **S ≥ 0.90** | **Excellent Reading** |
| STT success, **C ≥ MIN_CONF**, **0.80 ≤ S < 0.90** | **Good Reading** |
| STT success, **C ≥ MIN_CONF**, **0.70 ≤ S < 0.80** | **Minor Mistakes** |
| STT success, **C ≥ MIN_CONF**, **0.50 ≤ S < 0.70** | **Major Mistakes** |
| STT success, **C ≥ MIN_CONF**, **S < 0.50** | **Needs Full Assistance** |
| STT success but **C < MIN_CONF** (policy: still compare) | Cap band at **Major Mistakes** or **Needs Full Assistance**; emit `sttConfidenceLow: true` in internal metrics |

**Pilot tuning:** Thresholds **0.90 / 0.80 / 0.70 / 0.50** and **MIN_CONF** are server-configurable; default aligns with EA-05 (**0.70** success cutoff).

---

## Mapping: internal band → API outcome

| Internal band | API `outcome` | Child-visible state | Child messaging (keys only) |
|---------------|---------------|---------------------|----------------------------|
| **Excellent Reading** | `SUCCESS` | **Success** | `success.*`, `cta.next_page` |
| **Good Reading** | `SUCCESS` | **Success** | `success.*`, `cta.next_page` |
| **Minor Mistakes** | `SUCCESS` | **Success** | `success.*`, `cta.next_page` |
| **Major Mistakes** | `RETRY` | **Retry** → **Narrator** | `retry.*`, `narrator.*`, `cta.retry` |
| **Needs Full Assistance** | `RETRY` | **Retry** → **Narrator** | `retry.*`, `narrator.*`, `cta.retry` |

**Note:** **Minor Mistakes** still yields **Success** because **S ≥ 0.70**. Product intent: celebrate effort and keep the story moving when the page is “good enough” for MVP (`03_Product_Decisions.md` — confidence over perfection).

---

## Mapping: evaluation + Decision Engine → Continue

| Situation | API fields | Child-visible state |
|-----------|------------|---------------------|
| Any **RETRY** outcome, `retryCount < 3` | `offerContinue: false` | **Retry** path |
| **RETRY** outcome, `retryCount >= 3` | `offerContinue: true` | **Continue** (Decision 7) with `continue.*`, `cta.continue_reading` |

The evaluation engine **does not** emit a third outcome enum. **Continue** is a **client state** driven by `offerContinue` after a **RETRY** response (`12_AI_Evaluation_Flow.md`).

---

## Similarity and threshold concepts

### Primary metric (MVP)

**Token-level similarity** (or character n-gram similarity) between normalized **STT transcript** and **reference page text** from host content repository.

- **SUCCESS cutoff:** **S ≥ 0.70** (config key e.g. `readingBuddy.similaritySuccessThreshold`).  
- **Band boundaries:** as table above; independent of UI.  
- **Reference text:** must match the exact page the child sees (same story revision as host).

### What similarity is not (for product)

- Not shown to the child.  
- Not a “grade.”  
- Not stored on device in MVP API responses.

### Internal analytics fields (allowed)

When logging `page_outcome_success` or `page_outcome_retry` **server-side enrichment** (not in Flutter JSON):

| Field | Type | Example |
|-------|------|---------|
| `similarityScore` | float | `0.73` |
| `internalReadingBand` | enum string | `Minor Mistakes` |
| `sttConfidence` | float | `0.82` |
| `sttConfidenceBucket` | enum | `high` / `medium` / `low` |
| `referenceTokenCount` | int | `42` |
| `transcriptTokenCount` | int | `39` |

Client SDK events remain per `15` § Analytics unless Noory platform extends schema with **server-side** event enrichment only.

---

## STT confidence rules

### Normalization

Map provider confidence to **C** ∈ [0.0, 1.0]. Document provider mapping in backend runbook.

### Failures vs low confidence

| Condition | HTTP | `failureCode` | Outcome increment? |
|-----------|------|---------------|-------------------|
| No speech / silence | 422 | `EMPTY_AUDIO` | No |
| Speech but **C** below reject threshold and policy = strict | 422 | `LOW_CONFIDENCE` | No |
| STT provider error | 422 | `STT_FAILED` | No |
| STT ok, comparison ok | 200 | — | Yes (**SUCCESS** or **RETRY**) |

**Reject threshold** (default **0.35**): below this, return `LOW_CONFIDENCE` instead of guessing a band.

**Borderline banding:** Between **0.35** and **MIN_CONF**, engine may still return 200 **RETRY** with band **Needs Full Assistance** if product policy chooses “always encourage retry” over hard failure — **default MVP:** return `LOW_CONFIDENCE` when **C < MIN_CONF** and **S** would be unreliable.

### STT confidence buckets (analytics)

| Bucket | Condition |
|--------|-----------|
| `high` | **C ≥ 0.75** |
| `medium` | **0.55 ≤ C < 0.75** |
| `low` | **C < 0.55** |

---

## Pronunciation analysis (internal only)

MVP may compute a **pronunciation sub-score** for internal diagnostics **without** word-level child feedback (`03` Decision 5 — no word coaching in MVP).

### Inputs

- STT word-level timestamps (if provider supports Arabic).  
- Reference page tokens.  
- Optional: phoneme alignment (if vendor provides).

### Outputs (internal only)

| Output | Use |
|--------|------|
| `misreadTokenCount` | Analytics |
| `omittedTokenCount` | Band tie-breaker near threshold |
| `substitutionRate` | Ops tuning |
| `pronunciationFlags[]` | e.g. `SHADDA_SKIPPED`, `LONG_VOWEL_COLLAPSE` — **never** shown to child |

### Interaction with bands

- If **S** is in **[0.68, 0.72)** (near threshold), internal policy may **not** flip outcome; band may read **Minor Mistakes** vs **Major Mistakes** for analytics while outcome stays deterministic from **S ≥ 0.70**.  
- Pronunciation flags **must not** override **SUCCESS** to **RETRY** in MVP unless **S < 0.70** (no hidden penalty).

---

## Processing timeouts and partial results

| Scenario | Behavior |
|----------|----------|
| Server processing **> 30s** | HTTP **408**, `AI_TIMEOUT` — no band assigned |
| Evaluation logic throws | HTTP **422**, `EVALUATION_FAILED` |
| Upstream STT 5xx mapped | HTTP **502** / **503** per `15` |

No “default SUCCESS” on timeout. Child recovery: `Error Handling.md`.

---

## First attempt vs subsequent attempts (same page)

| Attempt | Evaluation rules | Narrator |
|---------|------------------|----------|
| First **Done** on page | Full pipeline; bands as above | **Only if** outcome **RETRY** |
| After narrator, re-record | Same pipeline; bands independent per attempt | Again only on **RETRY** |
| After Decision 7 **Continue** | No further evaluation on that page in session | N/A |

**retryCount** counts **RETRY** outcomes only, not STT failures.

---

## QA oracles (internal test expectations)

| Test case | Expected band (internal) | Expected outcome |
|-----------|-------------------------|------------------|
| Golden audio ≥ 0.92 similarity | Excellent Reading | SUCCESS |
| 0.85 similarity | Good Reading | SUCCESS |
| 0.72 similarity | Minor Mistakes | SUCCESS |
| 0.65 similarity | Major Mistakes | RETRY |
| 0.40 similarity | Needs Full Assistance | RETRY |
| Silent file | — | EMPTY_AUDIO |
| Heavy noise, C=0.30 | — | LOW_CONFIDENCE |
| Third RETRY on page | Major Mistakes (example) | RETRY + offerContinue true |

Child UI oracle: always **Success**, **Retry**, or **Continue** messaging from `11` — never band names.

---

## Forbidden exposures (checklist)

- [ ] No band strings in Flutter/Dart UI  
- [ ] No similarity in HTTP 200 JSON  
- [ ] No transcript returned to client  
- [ ] No word-level highlight “corrections”  
- [ ] No English internal labels spoken by Noor TTS  

---

## Related configuration keys (suggested)

| Key | Default | Purpose |
|-----|---------|---------|
| `similaritySuccessThreshold` | `0.70` | SUCCESS vs RETRY |
| `band.excellentMin` | `0.90` | IRB-01 |
| `band.goodMin` | `0.80` | IRB-02 |
| `band.minorMin` | `0.70` | IRB-03 |
| `band.majorMin` | `0.50` | IRB-04 |
| `stt.minConfidenceForScoring` | `0.55` | MIN_CONF |
| `stt.rejectBelowConfidence` | `0.35` | LOW_CONFIDENCE |
| `decision.maxRetryOutcomesPerPage` | `3` | offerContinue |

---

## Change log

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-07-27 | Internal bands + outcome mapping for MVP |
