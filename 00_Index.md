# Noory Documentation Index

**Version:** 1.4
**Last updated:** 2026-07-31
**Owner:** Product + Technical Writing  
**Status:** **PRODUCTION READY — FROZEN** (2026-07-28)  
**Purpose:** Primary navigation entry for the Read with Noor specification package.

**Product hierarchy:** **Noory — نوري** is the main application; **Read with Noor — اقرأ مع نور** is its interactive reading feature; **Noor — نور** is the reading companion character.

**Rule:** Each topic has exactly one **owner** document. If two files disagree, the owner wins (see registry below).

**Submitted POC override:** This frozen 2026-07-28 package preserves the
planning baseline, including historical 0.70 similarity references. The active
submitted POC is governed by `README.md` and `docs/manager-delivery-pack.md`:
its current reading-content rule is score **> 0.60** with **>= 80%** word
completion. Do not apply the frozen 0.70 references to the running POC.

---

## Start here

| Role | Path |
|------|------|
| Everyone | `README.md` (POC runtime, setup, manager handoff) |
| Product / PM / Leadership | `docs/DELIVERY_INDEX.md` → manager delivery pack |
| Engineering / Cursor | `README.md` → `ARCHITECTURE_OVERVIEW.md` → `16_Cursor_Master_Prompt.md` |
| Product / UX (frozen specs) | `00_Project_Principles.md` → `01_Product_Brief.md` → owner docs in registry |
| QA | `07_Acceptance_Criteria.md` → `08_Edge_Cases.md` → `QA Test Strategy.md` |
| Leadership | `99_Product_Bible.md` → `01_Product_Brief.md` |

**Full registry (owners, dependencies, cross-refs):** `FINAL_DOCUMENTATION_INDEX.md`  
**How specs relate (layers, flows):** `ARCHITECTURE_OVERVIEW.md`  
**Latest documentation audit:** `REVIEW_REPORT.md`  
**Current manager handoff:** `docs/manager-delivery-pack.md`
**Documentation change log:** `CHANGELOG.md`

---

## Canonical topic → owner

| Topic | Owner |
|-------|--------|
| Terminology (frozen specs) | `README.md` (POC runtime); canonical terms in frozen package via `01_Product_Brief.md` and `11_Message_Library.md` |
| Principles & tie-breakers | `00_Project_Principles.md` |
| Product scope & KPIs | `01_Product_Brief.md` |
| Feature decisions | `03_Product_Decisions.md` |
| Business rules (BR-*) | `Business Rules.md` |
| Acceptance criteria | `07_Acceptance_Criteria.md` |
| Edge cases (EC-01–EC-13) | `08_Edge_Cases.md` |
| failureCode recovery detail | `Error Handling.md` |
| UI tokens (summary) | `09_UI_UX_Guidelines.md` |
| Design principles | `20_Design_Principles.md` |
| Noor personality (full) | `Noor Character Bible.md` (index: `10_Noor_Character.md`) |
| Arabic child strings | `11_Message_Library.md` |
| Session state machine (wire) | `12_AI_Evaluation_Flow.md` |
| Internal bands & threshold logic | `Reading Evaluation Rules.md` |
| AI branching | `AI Decision Tree.md` |
| API, analytics, NFR | `15_Technical_Architecture.md` |
| Recording UX | `Recording UX Specification.md` |
| Library navigation | `Book Library Flow.md` |
| Narrator (Retry only) | `Audio Playback Flow.md` |
| Post-MVP ideas | `18_Future_Ideas.md` |
| Platform phases (post-MVP) | `Future Roadmap.md` |

---

## Archive (non-normative)

The root markdown package is the frozen 2026-07-28 specification baseline.
Current submitted-POC behavior, validation, and delivery status live in
`README.md` and `docs/`. The removed historical review archive is not a
repository navigation target.

---

## Related documents

- `FINAL_DOCUMENTATION_INDEX.md` — complete file registry  
- `REVIEW_REPORT.md` — Product Review Board audit (2026-07-27)  
- `docs/DELIVERY_INDEX.md` — ordered manager delivery list
- `docs/manager-delivery-pack.md` — current manager handoff and scope boundary
