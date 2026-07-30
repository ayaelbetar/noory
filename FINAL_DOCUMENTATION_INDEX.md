# Final Documentation Index

**Version:** 1.3
**Status:** **PRODUCTION READY — FROZEN** (Documentation Validation 2026-07-28)
**Last updated:** 2026-07-30
**Purpose:** Single registry of every specification file: owner, scope, dependencies, and who references it.

**Rule:** If two documents define the same behavior, the **Owner** row wins. All others must reference the owner, not copy normative text.

---

## How to use this index

| Role | Start here |
|------|------------|
| All | `00_Index.md` → `README.md` |
| Engineering / Cursor | `README.md` → `ARCHITECTURE_OVERVIEW.md` → `16_Cursor_Master_Prompt.md` |
| Product / UX | `00_Project_Principles.md` → `01_Product_Brief.md` → owner docs below |
| QA | `07_Acceptance_Criteria.md` → `08_Edge_Cases.md` → `QA Test Strategy.md` |
| Content / Arabic | `11_Message_Library.md` only for child strings |

---

## Core numbered specifications (`00`–`20`, `99`)

| Document | Owner topic | Purpose | Depends on | Referenced by |
|----------|-------------|---------|------------|---------------|
| `README.md` | **Terminology & package index** | Canonical terms, MVP scope, Appendix B, reading paths | `00`, `03` | All |
| `00_Project_Principles.md` | **Principles & tie-breakers** | Non-negotiable product rules (child tries first, no exam UX) | — | All |
| `01_Product_Brief.md` | **Product scope & KPIs** | Noory platform + Read with Noor MVP, Reading Summary | `00`, `03` | `99`, `06`, `07` |
| `02_Competitive_Research.md` | Market context | Differentiation research | — | `01`, `03` |
| `03_Product_Decisions.md` | **Feature decisions** | Decision 7, thresholds, rejected alternatives | `00` | `12`, `19`, `Business Rules.md` |
| `04_Personas.md` | **Personas** | Child 3–8 + parent context | `00` | `05`, `Child Accessibility.md` |
| `05_User_Journey.md` | **Journey narrative** | Emotional beats; points to screen specs | `11`, flow owners | `06`, `07` |
| `06_User_Stories.md` | **Backlog stories** | User stories | `05`, `01` | `07` |
| `07_Acceptance_Criteria.md` | **Acceptance criteria & traceability** | Gherkin AC, matrix to EC/flows | `06`, `08`, `12` | `QA Test Strategy.md` |
| `08_Edge_Cases.md` | **Edge cases EC-01–EC-13** | Canonical EC IDs and expected behavior | `12`, `11` | `07`, `Error Handling.md` |
| `09_UI_UX_Guidelines.md` | **UI/UX & design tokens (summary)** | RTL, tokens, recording phase summary | `11`, `20`, specialist owners | `16`, `Developer Notes.md` |
| `10_Noor_Character.md` | **Noor (summary index)** | Short pointer; full spec in Bible | `Noor Character Bible.md`, `11` | `05`, `12` |
| `11_Message_Library.md` | **Child-visible Arabic copy** | All `message_key` strings (208 keys) | `UX Writing Guide.md` | All UI docs |
| `12_AI_Evaluation_Flow.md` | **Session state machine & outcomes** | States, Success/Retry, failure taxonomy overview | `15`, `Reading Evaluation Rules.md` | `13`, `07`, `AI Decision Tree.md` |
| `13_System_Flow.md` | **System integration flow** | Host integration, Session Store, sequences | `12`, `14`, `15` | `Developer Notes.md` |
| `14_Assumptions.md` | **Assumptions & EA-* / SP-* registry** | Consent, retention, EA-05 threshold, EA-08 limits | — | `15`, `07` |
| `15_Technical_Architecture.md` | **API, analytics, NFR** | `/evaluate` contract, analytics canonical, Flutter handoff | `14`, `12` | `Developer Notes.md`, `Error Handling.md` |
| `16_Cursor_Master_Prompt.md` | **Implementation entry** | Read order, milestones, do-not-invent rules | Index + owners | Eng, Cursor |
| `17_Project_Writeup.md` | Stakeholder narrative | Short summary | `01`, `99` | Leadership |
| `18_Future_Ideas.md` | **Post-MVP ideas (backlog)** | Ideas explicitly out of MVP | `01` | PM |
| `19_Decision_Log.md` | **Decision chronology** | D-01… including D-07 | `03` | Audits |
| `20_Design_Principles.md` | **Design principles** | Visual/interaction principles | `00` | `09` |
| `99_Product_Bible.md` | **Executive one-pager** | Leadership snapshot | `01`, `00` | Leadership |

---

## Extended specifications (normative owners)

| Document | Owner topic | Purpose | Depends on | Referenced by |
|----------|-------------|---------|------------|---------------|
| `Business Rules.md` | **Business rules BR-*** | ID'd normative behavior | `00`, `03`, `12` | QA, Eng, `07` |
| `Book Library Flow.md` | **Library → Details → entry** | Screen specs: catalog, details, RTL | `11`, `13` | `05`, `Developer Notes.md` |
| `Recording UX Specification.md` | **Recording UX states** | Idle through Re-record screen template | `12`, `11` | `05`, `QA Test Strategy.md` |
| `Audio Playback Flow.md` | **Narrator playback** | Retry-path-only playback rules | `00` §3a, `12` | `Recording UX Specification.md` |
| `Reading Evaluation Rules.md` | **Internal evaluation bands** | IRB-* bands, 0.70 threshold, never child-visible | `12`, `15`, `14` EA-05 | `AI Decision Tree.md`, `Business Rules.md` |
| `AI Decision Tree.md` | **AI / recording decision logic** | End-to-end decision tree | `Reading Evaluation Rules.md`, `12` | `Business Rules.md`, QA |
| `Error Handling.md` | **failureCode recovery** | Per-code UI/voice/recovery (not EC duplicate) | `08`, `12`, `15`, `11` | `QA Test Strategy.md` |
| `Recovery Flows.md` | **Interruption recovery** | Offline, background, kill, phone call | `08`, `13`, `Session Store` | QA, Eng |
| `Noor Character Bible.md` | **Noor personality (full)** | Voice, forbidden words, timing, animation | `11`, `00` | `10`, Content |
| `Child Accessibility.md` | **Accessibility ages 3–8** | Per-age interaction and motor guidance | `09`, `04` | QA, UX |
| `Animation Guidelines.md` | **Motion design** | Loops, celebration, reduced motion | `09`, `12` states | Eng, UX |
| `Audio Design Guidelines.md` | **Sound & haptics** | Levels, success chime, no buzzer on Retry | `Recording UX Specification.md` | Eng |
| `Gamification Rules.md` | **Celebration (MVP)** | What is / is not gamification in MVP | `00`, `11` | PM, QA |
| `UX Writing Guide.md` | **Copy process** | How to add keys; not duplicate strings | `11`, `README` terms | Content, Eng |
| `Developer Notes.md` | **Engineering notes** | Flutter module, sync rules, test matrix | `15`, `13`, `16` | Eng |
| `QA Test Strategy.md` | **QA strategy** | Layers, flows F1–F11, oracles | `07`, `08`, owners | QA |
| `Future Roadmap.md` | **Platform phases** | Post-MVP Noory phases (not MVP scope) | `18`, `01` | PM |

---

## Meta & historical (non-normative for behavior)

| Document | Purpose |
|----------|---------|
| `00_Index.md` | Primary navigation entry; quick owner lookup |
| `ARCHITECTURE_OVERVIEW.md` | How documents relate (graph + layers) |
| `FINAL_DOCUMENTATION_INDEX.md` | Full file registry (owner, depends, referenced-by) |
| `REVIEW_REPORT.md` | Latest Product Review Board audit |
| `archive/reviews/README.md` | Archive index for non-normative meta reports |
| `archive/reviews/` | Refactor & validation reports, code review, UI audit, PM assessment (2026-07-28–29) |
| `CHANGELOG.md` | Documentation change log |

---

## Canonical topic → owner (quick lookup)

| Topic | Owner document |
|-------|----------------|
| Terminology | `README.md` |
| Child tries first / narrator gate | `00` §3a, `Business Rules.md` BR-RWF-01, `Audio Playback Flow.md` |
| Business rules | `Business Rules.md` |
| Edge cases EC-* | `08_Edge_Cases.md` |
| failureCode detail | `Error Handling.md` |
| Recording UX states | `Recording UX Specification.md` |
| Library navigation | `Book Library Flow.md` |
| Internal AI bands & threshold | `Reading Evaluation Rules.md` |
| AI branching logic | `AI Decision Tree.md` |
| State machine wire names | `12_AI_Evaluation_Flow.md` |
| API & analytics | `15_Technical_Architecture.md` |
| Arabic child strings | `11_Message_Library.md` |
| Noor personality | `Noor Character Bible.md` (summary: `10`) |
| Design tokens (summary) | `09_UI_UX_Guidelines.md` |
| Design principles | `20_Design_Principles.md` |
| Motion | `Animation Guidelines.md` |
| Sound | `Audio Design Guidelines.md` |
| Ages 3–8 a11y | `Child Accessibility.md` |
| Celebration / no scores | `Gamification Rules.md`, `00` §3 |
| Retry cap (Decision 7) | `03` Decision 7, `Business Rules.md` BR-RET-02 (**3 Retry outcomes** → **Continue**) |
| Recording max duration | `08` EC-13, `15` NFR (**120s**) |

---

## Appendix B

Enterprise **`Noory_PRD_and_QA_Specification_v3_Final.docx`** complements this package; **markdown owners above** remain implementation source of truth unless superseded by signed change control (`README.md` Appendix B).
