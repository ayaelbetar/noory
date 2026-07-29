# 01_Product_Brief

# AI Reading Buddy for Noory

**Version:** 1.2  
**Status:** Final — engineering handoff

---

## Product Overview

**Noory** is a children’s learning platform for ages **3–8**. **Read with Noor** (documented as **AI Reading Buddy** in engineering IDs) is a core reading activity: **Noor** listens while the child reads Arabic aloud, encourages them, and offers help **only after** the child’s first attempt on each page. AI remains invisible to the child.

Documentation package status: production-ready spec v2.0 (`README.md`).

---

## Why Now?

Modern Speech-to-Text (STT) enables interactive reading that encourages independent reading while preserving storytelling joy.

---

## Problem Statement

Children often need encouragement while reading aloud, but parents and teachers are not always available.

Without timely positive feedback, children may lose confidence.

---

## Proposed Solution

Noor listens during a **Reading Session**, compares reading to the expected page text (server-side), and responds with **Success** or **Retry** outcomes. A simple final reading score is shown only after the book is finished.

**Order of help:** On each page, the child **always** reads first. **Narrator** audio and re-record are available only on the **Retry** path after the first evaluation—not before (`00` §3a, `Audio Playback Flow.md`).

If the child struggles:
- Encourage (**Retry** path)
- Play **narrator** audio
- Allow **recording start** again
- After **3** **Retry** outcomes on the same page (**Decision 7**), offer **Continue** to the next page

---

## Vision

Reading should feel like a shared adventure, not a test.

---

## Mission

Help children become confident readers through positive, Noor-led encouragement.

---

## Target Audience

### Primary
Children aged **3–8** learning through Noory; **Read with Noor** focuses on Arabic reading aloud with companion support.

### Secondary
Parents and educators.

---

## Why Noor?

- Suitable for both boys and girls.
- Connected to Noory.
- Represents light, imagination, and discovery.

See **10_Noor_Character.md**.

---

## Product Goals

- Increase engagement.
- Improve story completion.
- Build confidence.
- Encourage independent reading.
- Strengthen Noory's educational value.

---

## MVP Scope

Included:
- **Read with Noor** entry
- **Reading Session** (one story)
- **Recording start** / **recording stop** (**Done**) / **upload** / **evaluation**
- Outcomes: **Success**, **Retry**; **Continue** after max retries (Decision 7)
- Arabic STT + page-level comparison
- **Narrator** on **Retry**
- **Voice Feedback:** short Noor encouragement at session start, Success, Retry support, and story completion; child can mute it from feature settings
- **Reading Summary** at **completion**
- Noor companion (Arabic copy in `11_Message_Library.md`)
- Privacy/consent per `14_Assumptions.md` (SP-01–SP-05)

---

## Out of Scope

- Parent dashboard
- Reading history product UI
- New authentication flows
- Gamification
- Adaptive learning
- Teacher reports
- Word-level pronunciation feedback
- Per-page accuracy scores

---

## Reading Summary (MVP Specification)

Shown at **completion** of a **Reading Session** (after last page **Success** or Decision 7 **Continue** on last page).

### Displayed to the child (Arabic, `11_Message_Library.md`)

- Celebration line (`complete.*`)
- **Pages read:** `summary.line_pages` — `{completedPages}` = pages with **Success** + pages accepted via Decision 7 **Continue**; `{totalPages}` = story page count
- Effort praise (`summary.line_effort`)
- A simple final reading score for the whole story; no per-page scores or letter grades
- CTA: **Read another story** (`cta.read_another_story`)

### Not displayed to the child

- Similarity **score** / threshold
- Per-page **Retry** counts
- STT transcripts or audio

### Calculation (client session + optional backend events)

| Field | Definition |
|-------|------------|
| `completedPages` | Count of pages with outcome **Success** OR `continued_without_success` (Decision 7) |
| `totalPages` | From Content Service |
| `sessionRetryTotal` | Sum of **Retry** outcomes in session (analytics only) |
| `finalReadingScore` | Percentage of story pages completed with **Success**; pages accepted through Decision 7 contribute 0 to this score |

### Celebration UX

- Noor visual: completion expression (`10_Noor_Character.md`)
- Short animation (subtle; respect reduced motion when host app supports it)
- Audio optional: brief success tone if Noory standard allows

### Analytics

**Canonical specification:** `15_Technical_Architecture.md` § **Analytics Specification (Canonical)** — event names, triggers, properties, and KPIs. Do not duplicate event lists elsewhere.

**Reading Summary** completion fires `reading_session_completed` (see `15`).

---

## Assumptions

See **14_Assumptions.md** (including SP-01–SP-05, TA-05 session persistence).

---

## Constraints

- MVP scope; no server-side session **database**
- **Reading Session** state on device (`13_System_Flow.md`)
- No new authentication
- Arabic-first child UI (RTL)

---

## Dependencies

- Speech-to-Text (Arabic)
- Backend evaluation API
- Narrator audio
- Internet (upload/evaluation)
- Existing Noory content & consent flows

---

## Success Metrics

### Product
- **Reading Session** completion rate
- Story completion (reach **Reading Summary**)

### UX
- Child enjoyment (usability studies)
- **Retry** → eventual **Success** or **Continue** without drop-off

### Technical
- Stable **recording start**/**stop**
- Evaluation latency (target p95 < 8s post-upload per TA-03)

---

## Risks & Mitigations

- AI misunderstanding → **Retry** + narrator; Decision 7 **Continue**
- Internet failure → `network.*`; preserve session (`08_Edge_Cases.md`)
- Child frustration → Decision 7; positive copy only
- Privacy → SP-01–SP-05

---

## Guiding Statement

> With Noor, every page lights the path to reading.  
> With Noory, every story opens a new world of imagination.

---

## Decision Summary

### Decisions Made
- Noor is the reading companion.
- AI stays invisible.
- Encouragement over correction.
- Canonical outcomes: **Success** | **Retry**.
- Decision 7: **3** retries → **Continue**.
- **Reading Summary** spec (above).

### Open Questions
- Confirm consent copy with Noory legal (SP-01).

### Future Enhancements
- Reading history
- Parent dashboard
- AI coach
- Personalized learning
