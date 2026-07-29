# 00_Project_Principles

# AI Reading Buddy for Noory

**Version:** 1.0  
**Status:** Approved — source of truth for principle conflicts  
**Audience:** Product, UX, Engineering, QA, Content, Cursor AI  

---

## Product Principles

This document defines the core principles that guide every product, design, UX, AI, and engineering decision for the AI Reading Buddy feature.

Whenever there is a conflict between two solutions, **these principles decide the outcome** (before `03_Product_Decisions.md` / `19_Decision_Log.md` for specific feature choices).

### How to use this document

| Role | Use principles to… |
|------|---------------------|
| Product | Scope trade-offs, KPI interpretation, reject punitive features |
| UX | Journey tone, copy approval, RTL/a11y priorities |
| Engineering | Error UX, retry logic, AI fallbacks, privacy defaults |
| QA | Expected behavior under failure; never accept shaming or “exam” UX |
| Cursor AI | Do not invent requirements that violate any principle below |

---

## Vision

Create an AI-powered reading experience that makes every child feel supported, encouraged, and excited to continue reading.

The goal is not to evaluate children.  
The goal is to help them love reading.

**Platform:** **Noory** is a children’s learning platform (ages **3–8**). **Read with Noor** is one activity inside Noory: the child reads books aloud while Noor listens, evaluates internally, encourages, and helps only when necessary.

**MVP constraint:** Arabic-speaking children **3–8 years**, reading **Arabic** stories aloud with Noor. Details in `01_Product_Brief.md`, `04_Personas.md`, and `Child Accessibility.md`.

---

## Core Principles

Each principle includes **implementation intent** so engineering and QA can test behavior, not slogans.

### 1. Child First

- Prioritize the child's emotional experience.
- **Intent:** Latency, errors, and permissions must be handled without blame or confusion. If a choice improves metrics but increases child anxiety, reject it.

### 2. AI Should Feel Invisible

- Children interact with Noor, not with AI.
- **Intent:** No child-facing copy referencing AI, robots, models, or “smart technology.” Failures degrade to Noor-led encouragement + narrator path (`11_Message_Library.md`, `12_AI_Evaluation_Flow.md`).

### 3. Encourage, Never Judge

- Never use negative language.
- **Intent:** No red “wrong answer” patterns, no scores shown to the child, no comparison to other readers. Wording must come from approved messages only.
- **Forbidden child-facing words (any language):** Wrong, Incorrect, Failed, exam/test framing, accuracy percentages, letter grades, or “you lost.”
- **Allowed framing:** effort, trying, listening together, continuing the adventure (`11_Message_Library.md`).

### 3a. Child Tries First — Noor Helps After

- **Noor NEVER reads the page before the child’s first attempt** on that page.
- The child **always** tries first via **recording start** → read aloud → **recording stop**.
- Noor **only** helps **after** the first evaluation on that page (e.g. **Retry** path: narrator model, then re-record).
- **Intent:** Preserve agency and playfulness; never feel like being read to instead of reading. See `Business Rules.md` BR-RWF-01, `Recording UX Specification.md`, `Audio Playback Flow.md`.

### 4. Reading Is an Adventure

- Reading should never feel like an exam.
- **Intent:** Page evaluation supports continuation of the story; it is not a high-stakes test. UI keeps focus on the story (`20_Design_Principles.md` — Reading Comes First).

### 5. Progress Over Perfection

- Celebrate improvement.
- **Intent:** Summary and feedback highlight effort, pages completed, and retries—not accuracy percentages shown to the child.

### 6. Positive Reinforcement

- Every retry is progress.
- **Intent:** Narrator-assisted retry is a supported path, not a penalty. Same page may be attempted again without shame copy.

### 7. Simplicity Wins

- Minimal UI, minimal actions.
- **Intent:** One primary action per step where possible; large touch targets; no settings maze for children (`09_UI_UX_Guidelines.md`).

### 8. Native Noory Experience

- Feel like part of Noory.
- **Intent:** Visual and interaction patterns align with Noory; Noor feels embedded in the reading flow, not a bolt-on chatbot.

### 9. Noor Is a Reading Companion

- Noor is a friend, not a teacher or examiner.
- **Intent:** Tone from `10_Noor_Character.md`. Noor does not lecture, grade, or moralize beyond brief encouragement.

### 10. Every Story Opens New Horizons

- Every page should inspire curiosity.
- **Intent:** Feedback is short and forward-looking so the child keeps turning pages.

### 11. Arabic-First and RTL (MVP)

- The child experience is Arabic by default; layout is **RTL**.
- **Intent:** STT, on-screen text, and Noor messages are Arabic for MVP. LTR exceptions only where technically required (e.g. internal logs), never for child UI.

### 12. Accessible by Default

- Design for young children and varying literacy levels.
- **Intent:** Readable type, contrast, tap targets, clear audio cues, and reduced cognitive load (`09_UI_UX_Guidelines.md`). Do not rely on reading alone for critical instructions where audio/visual affordances exist.

### 13. Privacy and Dignity

- Treat voice and reading behavior as sensitive child data.
- **Intent:** Collect minimum audio/data needed for the session; follow retention and consent rules in `14_Assumptions.md` and `15_Technical_Architecture.md`. Never use child audio for marketing or unrelated model training unless explicitly approved outside this MVP spec.

---

## Noor Philosophy

Noor represents light, curiosity, confidence, and imagination.

The name "Noor":

- Works naturally for both boys and girls.
- Connects with the Noory brand.
- Symbolizes knowledge and discovery.
- Feels warm and memorable.

**Brand Message**

> With Noor, every page lights the path to reading.  
> With Noory, every story opens a new world of imagination.

**Content boundary:** Noor stays in character; no open-ended chat, political/religious/medical advice, or adult topics (`10_Noor_Character.md`, `12_AI_Evaluation_Flow.md` AI guardrails section).

---

## Principle Conflicts (Tie-Breakers)

When two principles appear to conflict, resolve in this order:

1. **Child First** and **Privacy and Dignity** (safety and emotional safety)
2. **Encourage, Never Judge** / **Noor Is a Reading Companion**
3. **Simplicity Wins** / **Reading Is an Adventure**
4. **Native Noory Experience** / brand consistency
5. Business or technical convenience

Document the resolution in `19_Decision_Log.md` if the choice affects MVP scope or architecture.

---

## Decision Summary

### Decisions Made

- Child-first experience
- AI remains invisible
- Noor is a reading companion
- Encouragement over correction
- Confidence over perfection
- Arabic-first MVP with RTL
- Page-level support, not exam-style grading (see `03_Product_Decisions.md`)

### Open Questions

None for **principle-level** direction. Platform-specific consent, retention, and provider contracts are tracked in `14_Assumptions.md` — confirm with legal/platform owners before release.

### Future Enhancements

- Parent dashboard
- Reading history
- AI pronunciation coaching

(Out of MVP scope — `18_Future_Ideas.md`.)

---

## Related Documents

| Topic | Document |
|-------|----------|
| Feature-level decisions | `03_Product_Decisions.md` |
| Visual/UX expression of principles | `20_Design_Principles.md`, `09_UI_UX_Guidelines.md` |
| Noor behavior and copy | `10_Noor_Character.md`, `11_Message_Library.md` |
| AI boundaries | `12_AI_Evaluation_Flow.md` |
| Privacy / retention | `14_Assumptions.md`, `15_Technical_Architecture.md` |

---

**Change log:** v1.0 — expanded with Arabic-first, a11y, privacy, tie-breakers, and role-based usage for production handoff (aligned with `README.md`).
