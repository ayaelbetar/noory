# 03_Product_Decisions

# Product Decisions

**Version:** 1.0  
**Status:** Final

---

# Purpose

This document records every major product decision made during the design of the AI Reading Buddy feature, including the reasoning behind each decision and alternatives that were considered.

---

# Decision 1 – Create a Reading Companion

**Decision**

Introduce Noor as a permanent reading companion instead of exposing an AI assistant.

**Reason**

Children connect emotionally with characters more than technology.

**Alternatives Considered**

- Generic AI assistant
- Voice evaluator only

**Rejected Because**

They feel technical and less engaging.

**Impact**

Higher emotional engagement.

---

# Decision 2 – Name the Companion "Noor"

**Decision**

Use the name "Noor".

**Reason**

- Suitable for boys and girls.
- Matches Noory.
- Symbolizes light, learning, and imagination.

**Alternatives Considered**

- Owl mascot
- Animal character
- Generic robot

**Rejected Because**

Less connected to the Noory brand.

---

# Decision 3 – AI Should Be Invisible

**Decision**

Do not mention AI in the child experience.

**Reason**

Children interact with Noor, not technology.

---

# Decision 4 – Encourage, Never Judge

**Decision**

Never use words such as Wrong, Failed, or Incorrect.

**Reason**

Confidence is more important than perfect pronunciation.

---

# Decision 5 – Page-Level Evaluation

**Decision**

Evaluate the whole page instead of every word.

**Reason**

Simpler MVP with lower complexity and lower cost.

**Future**

Word-level coaching can be added later.

---

# Decision 6 – Narrator Support

**Decision**

After an unsuccessful attempt, Noor automatically plays the narrator audio.

**Reason**

Children learn by listening before trying again.

---

# Decision 7 – Limit Repeated Failures

**Decision**

After **3** page-level outcomes of **Retry** on the **same page**, offer **Continue** (`cta.continue_reading`) so the child may advance without another **recording start** on that page.

**Reason**

Avoid frustration and preserve motivation (see `12_AI_Evaluation_Flow.md`, `08_Edge_Cases.md` EC-11).

**MVP constant:** `MAX_RETRY_OUTCOMES_PER_PAGE = 3` (configurable server-side; default 3).

---

# Decision 8 – Minimal UI

**Decision**

Keep the interface clean and distraction-free.

**Reason**

The story should remain the focus.

---

# Decision 9 – No Gamification in MVP

**Decision**

Exclude badges, streaks, and rewards from the first version.

**Reason**

Validate the reading experience before adding engagement systems.

---

# Decision 10 – Personalized Encouragement

**Decision**

Use the child's name whenever appropriate.

**Reason**

Creates a warmer emotional connection.

---

# Decision 11 – Contextual Messages

**Decision**

Messages change based on progress instead of being purely random.

**Reason**

Noor should feel aware of the child's journey.

---

# Decision 12 – Final Summary

**Decision**

Display an encouraging end-of-book summary instead of detailed analytics.

**Reason**

Celebrate achievement without overwhelming the child.

---

# Decision Summary

## Decisions Made

- Noor is the reading companion.
- Child-first experience.
- AI remains invisible.
- Page-level evaluation.
- Positive reinforcement only.
- Narrator support.
- Context-aware messages.
- Minimal MVP.
- Minimal UI.

## Open Questions

None.

## Future Enhancements

- Word-level pronunciation analysis.
- Adaptive AI coaching.
- Reading history.
- Parent dashboard.
- Badges and achievements.
- Personalized learning plans.
