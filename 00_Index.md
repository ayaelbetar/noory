# Noory Documentation Index

**Version:** 1.2  
**Last updated:** 2026-07-28  
**Owner:** Product + Technical Writing  
**Status:** **PRODUCTION READY — FROZEN** (2026-07-28)  
**Purpose:** Primary navigation entry for the Read with Noor specification package.

**Rule:** Each topic has exactly one **owner** document. If two files disagree, the owner wins (see registry below).

---

## Start here

| Role | Path |
|------|------|
| Everyone | `README.md` (terminology, MVP scope, reading order) |
| Engineering / Cursor | `README.md` → `ARCHITECTURE_OVERVIEW.md` → `16_Cursor_Master_Prompt.md` |
| Product / UX | `00_Project_Principles.md` → `01_Product_Brief.md` → owner docs in registry |
| QA | `07_Acceptance_Criteria.md` → `08_Edge_Cases.md` → `QA Test Strategy.md` |
| Leadership | `99_Product_Bible.md` → `01_Product_Brief.md` |

**Full registry (owners, dependencies, cross-refs):** `FINAL_DOCUMENTATION_INDEX.md`  
**How specs relate (layers, flows):** `ARCHITECTURE_OVERVIEW.md`  
**Latest documentation audit:** `REVIEW_REPORT.md`  
**Latest validation:** `DOCUMENTATION_VALIDATION_REPORT_2026-07-28.md`  
**Documentation change log:** `CHANGELOG.md`

---

## Canonical topic → owner

| Topic | Owner |
|-------|--------|
| Terminology | `README.md` |
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

Historical audits and implementation reports live in `archive/reviews/`. Do not use them as current behavior oracles.

---

## Related documents

- `FINAL_DOCUMENTATION_INDEX.md` — complete file registry  
- `REVIEW_REPORT.md` — Product Review Board audit (2026-07-27)  
- `DOCUMENTATION_REFACTOR_REPORT_2026-07-28.md` — consolidation pass (this cycle)
- `DOCUMENTATION_VALIDATION_REPORT_2026-07-28.md` — final validation & **PRODUCTION READY — FROZEN**
