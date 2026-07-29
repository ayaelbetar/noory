# 06_User_Stories

# User Stories

**Version:** 1.0  
**Status:** Final

---

# Traceability (MVP)

| User story | Acceptance criteria (`07`) |
|------------|----------------------------|
| US-01 — Start Reading with Noor | AC-01-01, AC-01-02 |
| US-02 — Record Reading | AC-02-01, AC-02-02, AC-02-03 |
| US-03 — Page processing | AC-03-01, AC-03-02, AC-03-03 |
| US-04 — Positive Feedback | AC-04-01 |
| US-05 — Narrator Support | AC-05-01 |
| US-06 — Continue Reading | AC-06-01, AC-06-02 |
| US-07 — Story Completion | AC-07-01, AC-07-02 |

US-08–US-10 are post-MVP (no MVP acceptance criteria).

---

# Epic

AI Reading Buddy enables children to read stories aloud with Noor, receive encouraging feedback, and build reading confidence.

---

# Feature 1 – Start Reading with Noor

## US-01

**As a** child

**I want** to start reading with Noor

**So that** I feel supported while reading.

**Priority:** Must

**Business Value:** High

---

# Feature 2 – Record Reading

## US-02

**As a** child

**I want** to record my reading

**So that** Noor can listen and help me.

**Priority:** Must

**Business Value:** High

---

# Feature 3 – Page processing

## US-03

**As a** child

**I want** Noor to respond after I finish reading a page

**So that** I know whether Noor celebrates (**Success**) or helps me try again (**Retry** / **Continue**).

**Priority:** Must

**Maps to:** AC-03-01 (`07_Acceptance_Criteria.md`)

---

# Feature 4 – Positive Feedback

## US-04

**As a** child

**I want** encouraging feedback

**So that** I stay motivated.

**Priority:** Must

---

# Feature 5 – Narrator Support

## US-05

**As a** child

**I want** to hear the narrator after struggling

**So that** I can learn and retry confidently.

**Priority:** Must

---

# Feature 6 – Continue Reading

## US-06

**As a** child

**I want** to move to the next page

**So that** I can finish the story.

**Priority:** Must

---

# Feature 7 – Story Completion

## US-07

**As a** child

**I want** Noor to celebrate finishing the story

**So that** I feel proud and excited to read again.

**Priority:** Must

---

# Future Stories

## US-08
As a parent, I want to see my child's reading progress.

## US-09
As a teacher, I want classroom reading insights.

## US-10
As a child, I want personalized reading recommendations.

---

# Story Priorities

| Story | Priority |
|--------|----------|
| Start Reading | Must |
| Record Reading | Must |
| AI Evaluation | Must |
| Encouragement | Must |
| Narrator | Must |
| Next Page | Must |
| Story Summary (**Reading Summary**) | Must |
| Parent Dashboard | Future |
| Teacher Reports | Future |

---

# Dependencies

- Speech-to-Text service
- AI evaluation engine
- Narrator audio
- Existing Noory stories

---

# PM Thinking

Stories are intentionally written from user value rather than technical implementation. Engineering tasks can later be derived from these stories without changing the product intent.

---

# Decision Summary

## Decisions Made

- Child-focused stories first.
- Parent and teacher stories deferred.
- MVP contains only essential reading flow.

## Open Questions

None.

## Future Enhancements

- Additional accessibility stories.
- Offline reading.
- Personalized AI coaching.
- Multi-language reading support.
