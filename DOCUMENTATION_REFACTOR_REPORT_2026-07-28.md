# Documentation Refactor Report — Noory Read with Noor

**Date:** 2026-07-28  
**Scope:** All Markdown in `<repository root>`  
**Role:** Senior Documentation Architect / Technical Writer pass (no application code)  
**Baseline:** Product Review Board audit 2026-07-27 (`REVIEW_REPORT.md`)

---

## Part A — Documentation Audit (Step 1)

Every file was read or cross-checked against the owner registry. **Canonical** = normative source of truth for a topic. **Supporting** = narrative, traceability, or index; must reference canonical owners.

| Document | Purpose | Scope | Owner | Depends on | Canonical / Supporting | Disposition |
|----------|---------|-------|-------|------------|------------------------|-------------|
| `00_Index.md` | Navigation entry | Whole package | Tech Writing | `FINAL_DOCUMENTATION_INDEX` | Supporting | **Kept** (new) |
| `00_Project_Principles.md` | Tie-breaker principles | All features | Product | — | **Canonical** (principles) | Kept |
| `01_Product_Brief.md` | Scope, KPIs, Reading Summary | MVP product | PM | `00`, `03` | **Canonical** (product scope) | Kept |
| `02_Competitive_Research.md` | Market context | Differentiation | PM | — | Supporting | Kept |
| `03_Product_Decisions.md` | Feature decisions incl. Decision 7 | MVP decisions | PM | `00` | **Canonical** (decisions) | Kept |
| `04_Personas.md` | Child 3–8 + parent | Personas | UX/PM | `00` | **Canonical** (personas) | Kept |
| `05_User_Journey.md` | Emotional journey | UX narrative | UX | flows, `11` | Supporting | Kept |
| `06_User_Stories.md` | Backlog stories | MVP stories | PM | `05`, `01` | **Canonical** (stories) | Kept |
| `07_Acceptance_Criteria.md` | Gherkin AC + matrix | Testable AC | QA/PM | `06`, `08`, `12` | **Canonical** (AC) | Kept |
| `08_Edge_Cases.md` | EC-01–EC-13 | Edge behavior | QA/Eng | `12`, `11` | **Canonical** (EC IDs) | Kept |
| `09_UI_UX_Guidelines.md` | RTL, tokens summary | UI baseline | UX | `20`, specialists | **Canonical** (UI tokens summary) | Kept |
| `10_Noor_Character.md` | Index to Bible | Pointer only | Content | Bible, `11` | Supporting | Kept |
| `11_Message_Library.md` | Arabic `message_key` | All child copy | Content | `UX Writing Guide` | **Canonical** (strings) | Kept |
| `12_AI_Evaluation_Flow.md` | State machine, failure taxonomy overview | Session wire flow | Eng/PM | `15`, `Reading Evaluation Rules` | **Canonical** (states/transitions) | **Modified** (bands → reference) |
| `13_System_Flow.md` | Host integration, Session Store | Integration | Eng | `12`, `14`, `15` | **Canonical** (integration) | Kept |
| `14_Assumptions.md` | EA-*, SP-* registry | Assumptions | PM/Eng | — | **Canonical** (assumptions) | Kept |
| `15_Technical_Architecture.md` | API, analytics, NFR | Engineering | Eng | `14`, `12` | **Canonical** (API/analytics) | Kept |
| `16_Cursor_Master_Prompt.md` | Implementation entry | Cursor/Eng | Eng | Index + owners | Supporting | **Modified** (archive paths) |
| `17_Project_Writeup.md` | Stakeholder narrative | Summary | PM | `01`, `99` | Supporting | Kept |
| `18_Future_Ideas.md` | Post-MVP idea backlog | Ideas only | PM | `01` | **Canonical** (ideas list) | **Modified** (roadmap deduped) |
| `19_Decision_Log.md` | Chronological D-* | Decision history | PM | `03` | Supporting (history) | Kept |
| `20_Design_Principles.md` | Visual/interaction principles | Design | UX | `00` | **Canonical** (design principles) | Kept |
| `99_Product_Bible.md` | Executive one-pager | Leadership | PM | `01`, `00` | Supporting (exec) | **Modified** (metadata) |
| `README.md` | Terminology, package index | Whole package | All | `00`, `03` | **Canonical** (terms) | **Modified** |
| `FINAL_DOCUMENTATION_INDEX.md` | Full registry | All files | Tech Writing | — | **Canonical** (ownership registry) | **Modified** |
| `ARCHITECTURE_OVERVIEW.md` | Doc layers, SSOT matrix | Relationships | Eng/PM | Index | Supporting | **Modified** |
| `REVIEW_REPORT.md` | Latest PRB audit | Meta | PRB | — | Supporting | **Modified** (archive note) |
| `CHANGELOG.md` | Doc change log | Meta | Tech Writing | — | Supporting | **Modified** |
| `Business Rules.md` | BR-* catalog | Behavior | PM/Eng/QA | `00`, `03`, `12` | **Canonical** (business rules) | **Modified** (terminology pointer) |
| `Book Library Flow.md` | Library screens | Library UX | UX/Eng | `11`, `13` | **Canonical** (library) | Kept |
| `Recording UX Specification.md` | Recording states UX | Recording UX | UX/Eng | `12`, `11` | **Canonical** (recording UX) | Kept |
| `Audio Playback Flow.md` | Narrator Retry-only | Audio playback | UX/Eng | `00` §3a, `12` | **Canonical** (narrator) | Kept |
| `Reading Evaluation Rules.md` | IRB bands, 0.70 logic | Internal eval | Backend/QA | `12`, `15`, `14` | **Canonical** (bands/threshold detail) | Kept |
| `AI Decision Tree.md` | Branching logic | AI decisions | Eng/PM | `Reading Evaluation Rules`, `12` | **Canonical** (decision tree) | Kept |
| `Error Handling.md` | failureCode recovery | Error UX | Eng/QA | `08`, `12`, `15` | **Canonical** (failureCode) | Kept |
| `Recovery Flows.md` | Interruptions | Recovery | Eng/QA | `08`, `13` | **Canonical** (recovery) | Kept |
| `Noor Character Bible.md` | Full Noor spec | Character | Content/UX | `11`, `00` | **Canonical** (Noor personality) | Kept |
| `Child Accessibility.md` | Ages 3–8 a11y | A11y | UX/QA | `09`, `04` | **Canonical** (a11y) | Kept |
| `Animation Guidelines.md` | Motion | Motion | UX/Eng | `09`, `12` | **Canonical** (motion) | Kept |
| `Audio Design Guidelines.md` | Sound/haptics | Audio design | UX/Eng | Recording UX | **Canonical** (sound) | Kept |
| `Gamification Rules.md` | MVP celebration | Motivation MVP | PM/UX | `00`, `11` | **Canonical** (MVP gamification) | Kept |
| `UX Writing Guide.md` | Copy process | Content process | Content | `11`, README | Supporting | Kept |
| `Developer Notes.md` | Flutter sync notes | Eng notes | Eng | `15`, `13`, `16` | Supporting | Kept |
| `QA Test Strategy.md` | F1–F10, layers | QA strategy | QA | `07`, `08` | **Canonical** (QA strategy) | Kept |
| `Future Roadmap.md` | Platform phases post-MVP | Roadmap phases | PM/Leadership | `18`, `01` | **Canonical** (phased roadmap) | Kept |
| `archive/reviews/*` | Historical audits | Meta | — | — | Non-normative | **Archived** |

**Orphan check:** No specification file lacks a registry row or role path. Historical audits were the only “floating” meta files at root; moved to `archive/reviews/`.

---

## Part B — Problems Detected (Step 2)

### Duplication (addressed or accepted)

| Topic | Locations before | Owner | Action |
|-------|------------------|-------|--------|
| Internal reading bands table | `12`, `Reading Evaluation Rules` | `Reading Evaluation Rules.md` | Removed table from `12` |
| Post-MVP phased roadmap | `18` Phases 1–5, `Future Roadmap` | `Future Roadmap.md` | Replaced phases in `18` with backlog + link |
| Noor personality (long form) | Was in `10` + Bible | `Noor Character Bible.md` | Already fixed in 2026-07-27 audit |
| EC vs failureCode prose | `08`, `Error Handling` | Split owners | Already split |
| Motion/audio/a11y detail | `09` + specialists | Specialist docs | Already split |
| Terminology glossary | `README`, `Business Rules` | `README.md` | BR now points to README |
| Executive vision/MVP bullets | `99`, `01`, `00` | `01` + `00` for detail | **Accepted** — `99` is intentional one-pager |
| User flow narrative | `05`, `Book Library`, `13`, QA F1 | Each owns layer | **Accepted** — cross-linked, not identical normative text |
| Failure taxonomy table | `12`, `Error Handling`, `15` | `12` taxonomy; `Error Handling` expands | **Accepted** — `Error Handling` references EC IDs |
| Forbidden words | `00`, Bible, `10`, README | `00` + Bible §Forbidden | **Accepted** — principle in `00`, character detail in Bible |

### Conflicts

No **unresolved** normative conflicts found after 2026-07-27 PRB fixes. Verified alignment on:

- Ages **3–8**
- **0.70** threshold (EA-05, `Reading Evaluation Rules`, `Business Rules` BR-EVL-03)
- **3 Retry outcomes** → **Continue** (Decision 7)
- **120s** / **8 MB** / **40** evaluates per session
- **Child tries first** / narrator gate
- Child-visible copy **`11` only**

### Remaining acceptable overlap

- **`12` § Step Rules** repeats threshold/Decision 7 in one line each — operational summary for state machine readers; numeric policy remains in `Reading Evaluation Rules`, `03`, `Business Rules`.
- **`AI Decision Tree`** and **`12`** both describe branching — tree is canonical for logic; `12` for wire states.

---

## Part C — Canonical Ownership (Step 3)

Confirmed per `FINAL_DOCUMENTATION_INDEX.md` and `00_Index.md`. No ownership changes this pass except:

- **Internal bands:** reinforced **`Reading Evaluation Rules.md`** (removed competing table in `12`).
- **Platform phasing:** reinforced **`Future Roadmap.md`** (removed competing phases in `18`).

---

## Part D — Safe Refactoring Performed (Steps 4–8)

| Change | Rationale |
|--------|-----------|
| Created `00_Index.md` | Single navigation entry without moving 45+ spec files (preserves flat paths in README) |
| Created `archive/reviews/` + README | Historical meta docs labeled non-normative |
| Edited `18_Future_Ideas.md` | Remove duplicated phased roadmap |
| Edited `12_AI_Evaluation_Flow.md` | Replace band table with owner reference |
| Edited `Business Rules.md` | Glossary defers to README |
| Updated registry files | README, FINAL_DOCUMENTATION_INDEX, ARCHITECTURE, 16, 99, REVIEW_REPORT, CHANGELOG |

**Not done (intentional):**

- No relocation of numbered specs into `docs/` subfolder — would break hundreds of internal links and contradict README flat-root contract.
- No edits to Flutter project (per instructions).
- No deletion of business content — only deduplicated normative tables/phases where a clear owner exists.

---

## Part E — Final Report (Step 9)

### 1. Files reviewed

**49** Markdown files at audit start (44 normative/supporting specs at root + 5 archived).

### 2. Files modified

- `00_Index.md` (created)
- `18_Future_Ideas.md`
- `12_AI_Evaluation_Flow.md`
- `README.md`
- `FINAL_DOCUMENTATION_INDEX.md`
- `ARCHITECTURE_OVERVIEW.md`
- `16_Cursor_Master_Prompt.md`
- `99_Product_Bible.md`
- `Business Rules.md`
- `REVIEW_REPORT.md`
- `CHANGELOG.md`
- `archive/reviews/README.md` (created)
- `DOCUMENTATION_REFACTOR_REPORT_2026-07-28.md` (this file)

### 3. Files merged

None (logical merges were completed in 2026-07-27 audit: `10` → Bible index, `08`/`Error Handling` split).

### 4. Files archived

Moved to `archive/reviews/`:

- `REVIEW_REPORT_v1.md`
- `REVIEW_REPORT_v2.md`
- `REVIEW_REPORT_v3.md`
- `FINAL_RELEASE_REPORT.md`
- `FINAL_IMPLEMENTATION_AUDIT.md`

### 5. Duplicate sections removed

- `18_Future_Ideas.md` — Phases 1–5 roadmap (~70 lines) → reference to `Future Roadmap.md`
- `12_AI_Evaluation_Flow.md` — Internal band mapping table → reference to `Reading Evaluation Rules.md`

### 6. Conflicts resolved

None new in this pass (prior PRB resolutions remain authoritative).

### 7. Remaining issues (non-blocking)

1. **Flutter `messages_ar.json` vs `11`** — engineering sync task (`Developer Notes.md`); not a spec gap.
2. **DOCX Appendix B** — keep in change control with markdown owners (`README.md`).
3. **Optional `library.*` keys** — if product adopts search/filter UI, add to `11` first.
4. **Failure taxonomy** — `12` and `Error Handling` both list codes; consider future trim of `Error Handling` intro table to EC/failureCode links only (low priority; QA uses both).
5. **Flat folder vs `docs/` example** — package intentionally flat; use `00_Index.md` as top-level index.

### 8. Final documentation structure

```
noory demo/
├── 00_Index.md                    ← start navigation
├── README.md                      ← terminology + package index
├── 00_Project_Principles.md … 99_Product_Bible.md
├── Business Rules.md, Book Library Flow.md, … (extended specs)
├── FINAL_DOCUMENTATION_INDEX.md   ← full owner registry
├── ARCHITECTURE_OVERVIEW.md
├── REVIEW_REPORT.md               ← latest PRB audit
├── CHANGELOG.md
├── DOCUMENTATION_REFACTOR_REPORT_2026-07-28.md
└── archive/
    └── reviews/                   ← historical audits (non-normative)
        ├── README.md
        ├── REVIEW_REPORT_v1.md … v3.md
        ├── FINAL_RELEASE_REPORT.md
        └── FINAL_IMPLEMENTATION_AUDIT.md
```

### 9. Recommendations

1. **Link maintenance:** When adding a spec, update `FINAL_DOCUMENTATION_INDEX.md` and one row in `00_Index.md` canonical table.
2. **Change control:** Any API, threshold, or `message_key` change → update owner doc + `CHANGELOG.md` + optional PRB note in `REVIEW_REPORT.md`.
3. **New contributors:** Read `00_Index.md` → role path → owner doc only for the topic being implemented.
4. **Quarterly doc review:** Re-run duplicate grep on `0.70`, `MAX_RETRY`, `120s`, forbidden terms, and band labels.
5. **Do not restore phased roadmap text in `18`** — add ideas as bullets; phases belong in `Future Roadmap.md`.

---

## Consistency checklist (Step 7)

| Check | Status |
|-------|--------|
| Business rules consistent | Pass |
| AI behavior consistent | Pass |
| Noor personality consistent | Pass |
| User flows consistent | Pass |
| Acceptance criteria consistent | Pass |
| Technical architecture consistent | Pass |
| Naming / terminology consistent | Pass |
| Folder structure consistent | Pass (flat specs + archive) |
| No duplicate band/roadmap definitions | Pass (after this pass) |

---

**Sign-off:** Documentation system is owner-mapped, deduplicated for known hotspots, and ready for continued implementation handoff. Normative behavior: **`00_Index.md`** → owner documents only.
