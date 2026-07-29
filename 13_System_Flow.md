# 13_System_Flow

# System Flow

**Version:** 1.2  
**Status:** Final

---

# Purpose

Component interactions for one **Reading Session**. **State names** and **failures** MUST match `12_AI_Evaluation_Flow.md`. **API** MUST match `15_Technical_Architecture.md`.

---

# System Components

- Child (User)
- Noory Mobile App (Flutter host)
- Reading Buddy Module (UI + state machine + API client)
- Session Store (client-local)
- Backend API (`POST /v1/reading-buddy/evaluate`)
- Speech-to-Text Service
- AI Evaluation Engine
- Decision Engine
- Narrator Audio (URLs from host content)
- Content Repository (host)

---

# End-to-End Flow (aligned)

1. Host opens story → **Read with Noor** → **Idle** → **Preparing** (consent/mic).
2. **Recording** → **Uploading** → `POST /evaluate` → **Evaluating** (client).
3. HTTP 200 → **Success** or **Retry** UI states.
4. **Retry** → **Narrator** → **Idle** (re-record) OR **Continue** if `offerContinue`.
5. **Success** → next page **Idle** OR **Completed** + **Reading Summary**.
6. HTTP 422/4xx/5xx or `NETWORK_ERROR` → map `failureCode` (`12` taxonomy) → **Idle** for re-record.

---

# Component Responsibilities

## Reading Buddy Module (Flutter)

- State machine: **Idle** … **Completed** (`12`).
- `ReadingBuddyApiClient`: contracts in `15`.
- Analytics: only events in `15` § Analytics (canonical).
- Session Store fields: `clientSessionId`, `storyId`, `currentPageIndex`, `completedPageIds[]`, `continuedWithoutSuccessPageIds[]`, `pageRetryCounts{pageId}`, `attemptSequence{pageId}`, `sessionStartedAt`.

## Backend API

- Implements `15` POST `/evaluate`; returns outcomes or `error.code`.
- Enforces NFR timeouts and size limits.

## Decision Engine

- Threshold 0.70; `retryCount`; `offerContinue` when ≥3.

## Narrator Audio

- Host plays `narratorAudioUrl` during **Narrator** state (not necessarily backend).

---

# Error Flow

All errors map through `12` AI Failure Taxonomy → `11` messages → `page_failure` analytics.

Duplicate taps: UI debounce (EC-07).

---

# Sequence Overview

Child → Flutter UI → (Preparing) → Record → POST /evaluate → STT → Eval → Decision → JSON → UI → [Narrator] → … → **Completed**

---

# Security & Privacy

`14` SP-01–SP-05; `15` Security section.

---

# Consistency Verification (P1)

| Check | Source of truth |
|-------|-----------------|
| States | `12` |
| HTTP codes | `15` API Contracts |
| Tests | `07` AC + EC |
| Assumptions | `14` Engineering Registry |

---

# PM Thinking

This file describes **who talks to whom**; contracts live in `15`, behavior in `12`.

---

# Decision Summary

## Decisions Made
- Flutter module boundary explicit.
- Single evaluate endpoint per **Done**.

## Open Questions
None in this file — see `14` EA-*.

## Future Enhancements
- Server session sync.
