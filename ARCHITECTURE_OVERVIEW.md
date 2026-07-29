# Architecture Overview — Noory Documentation

**Version:** 1.0  
**Status:** Final  
**Audience:** Product Review Board, Engineering, QA, Cursor AI  

This document explains **how specification files relate**. It does not duplicate normative rules—see **`FINAL_DOCUMENTATION_INDEX.md`** for owners.

---

## Product context

```mermaid
flowchart TB
  subgraph platform [Noory Platform ages 3-8]
    HOST[Noory Host App]
    LIB[Story Library Catalog]
    OTHER[Other learning activities post-MVP]
  end
  subgraph rwf [Read with Noor MVP]
    DET[Story Details]
    RB[Reading Buddy Module]
    SESS[Reading Session]
    SUM[Reading Summary]
  end
  HOST --> LIB
  LIB --> DET
  DET -->|cta.read_with_noor| RB
  RB --> SESS
  SESS --> SUM
  SUM --> LIB
```

**Canonical user flow (Read with Noor):**

Noory host → **Story / Library Catalog** → **Story Details** → **Read with Noor** (consent/mic) → **Reading Session** (per-page: **recording start** → read → **recording stop** → upload → evaluation → feedback) → next page or **Reading Summary** → Catalog.

Same flow in: `05_User_Journey.md`, `Book Library Flow.md`, `13_System_Flow.md`, `QA Test Strategy.md` (F1–F3).

---

## Documentation layers

```mermaid
flowchart TB
  subgraph L1 [L1 Governance]
    R[README terminology]
    P00[00 Principles]
    BR[Business Rules]
    D03[03 Decisions]
  end
  subgraph L2 [L2 Experience]
    J05[05 Journey]
    BLF[Book Library Flow]
    RUX[Recording UX Spec]
    APL[Audio Playback Flow]
    G09[09 UI UX tokens]
    A11[11 Messages AR]
  end
  subgraph L3 [L3 AI and Logic]
    RER[Reading Evaluation Rules]
    ADT[AI Decision Tree]
    S12[12 State Machine]
    S13[13 System Flow]
  end
  subgraph L4 [L4 Engineering]
    S15[15 API Analytics NFR]
    S14[14 Assumptions]
    DEV[Developer Notes]
  end
  subgraph L5 [L5 Quality]
    AC07[07 Acceptance Criteria]
    EC08[08 Edge Cases EC]
    ERR[Error Handling]
    REC[Recovery Flows]
    QA[QA Test Strategy]
  end
  subgraph L6 [L6 Character and A11y]
    BIBLE[Noor Character Bible]
    CA[Child Accessibility]
    ANIM[Animation Guidelines]
    AUD[Audio Design Guidelines]
  end
  L1 --> L2
  L2 --> L3
  L3 --> L4
  L4 --> L5
  L2 --> L6
```

**Dependency rule:** Lower layers must not contradict L1. **`00_Project_Principles.md`** wins conflicts, then **`03_Product_Decisions.md`** / **`19_Decision_Log.md`**, then topic owners in the index.

---

## Read with Noor — runtime architecture (logical)

```mermaid
sequenceDiagram
  participant Child
  participant UI as Reading Buddy UI
  participant Host as Noory Host
  participant API as POST evaluate
  Child->>UI: recording start
  UI->>Child: listen state
  Child->>UI: recording stop Done
  UI->>API: upload audio
  API-->>UI: Success or Retry outcome
  alt Success
    UI->>Child: success messages next page
  else Retry after first attempt
    UI->>Child: retry messages
    UI->>Child: narrator playback
    Child->>UI: re-record
  end
  Note over UI,Child: Narrator never before first attempt on page
```

Normative detail: **`AI Decision Tree.md`**, **`12_AI_Evaluation_Flow.md`**, **`Recording UX Specification.md`**.

---

## Single source of truth matrix

| Concern | Do not duplicate in | Owner |
|---------|---------------------|--------|
| BR-* rules | `01`, `07`, `12` prose | `Business Rules.md` |
| EC-01–EC-13 definitions | `Error Handling.md` titles only; link EC ID | `08_Edge_Cases.md` |
| failureCode tables | `08` | `Error Handling.md` |
| Internal bands Excellent… | Child UI | `Reading Evaluation Rules.md` |
| Wire states Idle/Recording/… | UX spec duplicates OK if aligned | `12` (wire), `Recording UX Specification.md` (UX labels) |
| Arabic strings | Code, Figma, DOCX | `11_Message_Library.md` |
| API JSON schema | `12` | `15` § API Contracts |
| Analytics event names | `12` | `15` § Analytics |
| Noor tone / forbidden words | Long form in `10` | `Noor Character Bible.md` |
| Phase roadmap | `18` ideas list | `Future Roadmap.md` (phases), `18` (ideas) |

---

## Implementation package map (Flutter)

| Spec | Code alignment |
|------|------------------|
| `Book Library Flow.md` | Host catalog + `StoryLibraryScreen` |
| `11_Message_Library.md` | `assets/messages_ar.json` **must match keys** (no extra score copy) |
| `12` / `13` | `ReadingBuddyState`, Session Store |
| `15` | Backend `/evaluate`, analytics |
| `16` | Milestones, module boundaries |

See **`Developer Notes.md`** for sync rules.

---

## Related files

- **`FINAL_DOCUMENTATION_INDEX.md`** — full file registry  
- **`00_Index.md`** — navigation entry  
- **`REVIEW_REPORT.md`** — latest consolidation audit  
- **`README.md`** — terminology and reading order  
