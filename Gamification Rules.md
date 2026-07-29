# Gamification Rules

**Version:** 1.0  
**Status:** Final — MVP scope  
**Audience:** PM, UX, Engineering, QA  
**Related decisions:** `19_Decision_Log.md` D-09, D-11, D-12 · `03_Product_Decisions.md`

---

# Purpose

Define what **motivation and celebration** mean for **Read with Noor** in MVP, without turning reading into a game with scores, ranks, or punishment. This document is the product contract for “light delight” vs “gamification systems.”

---

# MVP Philosophy

**Celebrate reading; do not gamify performance.**

The child should feel:

- Safe to try again (**Retry** is support, not failure).
- Proud of effort, not judged by accuracy.
- Curious to open another story — not pressured to maintain a streak.

Internal **evaluation** and similarity thresholds exist for routing only (`12_AI_Evaluation_Flow.md`). They are **never** child-facing (`07` AC-03-01, AC-07-02).

---

# In Scope (MVP)

## 1. Celebration without competition

| Moment | Behavior | Copy / assets |
|--------|----------|----------------|
| Page **Success** | Brief positive feedback | `success.*` from `11` |
| Page **Retry** | Encouragement, then narrator | `retry.*`, `narrator.*` |
| Decision 7 **Continue** | Validate effort, advance story | `continue.*`, `cta.continue_reading` |
| Story **Completion** | Visible celebration | `complete.*` + Noor completion expression (`10_Noor_Character.md`) |
| Subtle animation | Short, optional | Respect host **reduced motion** when available (`01_Product_Brief.md` § Celebration UX) |

No points, coins, XP, levels, or badges in MVP.

## 2. Effort praise (core loop)

- Every **Retry** message frames trying as progress (`retry.04`: every try helps you improve).
- **Success** messages praise reading quality and effort (`success.05`: proud of your effort).
- **Listening** state uses supportive `listen.*` during **Recording**.
- Product principle: **Encourage, Never Judge** (`00_Project_Principles.md`).

## 3. Reading Summary (session closure)

Per `01_Product_Brief.md` and Decision 12:

**Shown to child**

- `complete.*` celebration line
- `summary.line_pages` — pages read vs total (count only, no %)
- `summary.line_effort` — effort praise
- `cta.read_another_story`

**Not shown**

- Similarity score, threshold, per-page **Retry** counts, transcripts, rankings

**Analytics** may carry `sessionRetryTotal`, `completedPages`, etc. (`15` § Analytics) — internal only.

## 4. Optional delight rotation

Per `03_Product_Decisions.md` Decision 11 and `11` § Delight Messages:

- Use `delight.01`–`delight.04` **occasionally** at contextual milestones (e.g. mid-story page, after first **Success** on a hard page, before **Reading Summary**).
- **Contextual selection with rotation** — not purely random; **no consecutive repeat** of the same delight key.
- Delight is **additive**; never block the critical path (record → evaluate → next action).

## 5. Optional personalization

If host provides child display name: `personal.*` keys (`11`). Not required for MVP delight to function.

---

# Explicitly Out of Scope (MVP)

Do **not** implement without explicit product amendment (`README.md` MVP Out, `18_Future_Ideas.md` Phase 2+):

| Category | Examples |
|----------|----------|
| **Scores & grades** | Child-visible accuracy %, stars per page, letter grades, “3/5 correct” |
| **Leaderboards** | Class, friends, global, weekly top readers |
| **Streak punishment** | Broken streak shame, “you lost your streak”, reduced rewards for missed days |
| **Streak rewards (MVP)** | Daily login streaks, streak flames, streak-multiplier points |
| **Badges & achievements** | First Story, Five Stories, Brave Reader, collectible trophies |
| **Economy** | Coins, shop, unlockables, pay-to-skip **Retry** |
| **Competition** | Versus modes, races, timed reading contests |
| **Punitive mechanics** | Lives/hearts, energy bars, cooldown timers on reading |
| **Parent-facing gamification UI** | Milestone dashboards, achievement galleries (parent dashboard is out of MVP) |
| **Adaptive difficulty rewards** | XP-based level-ups tied to evaluation scores |

**Note:** `sessionRetryTotal` and outcome analytics are **measurement**, not gamification — they must not surface in child UI.

---

# Interaction with Product States

Gamification-adjacent UX must respect `12_AI_Evaluation_Flow.md`:

- **Narrator** plays only on **Retry** path after evaluation — not as a “hint purchase.”
- **Continue** after 3 **Retry** outcomes is a **dignified exit ramp**, not a “skip level” penalty.
- Failures (`NETWORK_ERROR`, `AI_TIMEOUT`, etc.) use recovery copy only — no “game over.”

---

# Content and UX Guardrails

- All celebration copy from **`11_Message_Library.md`** (`UX Writing Guide.md`).
- Noor expressions per `10_Noor_Character.md` (e.g. completion 🌟) — no aggressive confetti that implies winning/losing.
- Do not tie animation intensity to evaluation outcome severity ( **Retry** should feel as warm as **Success**).

---

# Future (Not MVP)

Ideas such as achievements, parent milestone views, and reading history live in **`18_Future_Ideas.md`**. **`Future Roadmap.md`** describes platform-wide phases. Neither overrides this document for MVP builds.

**Gate for post-MVP gamification:** validate core **Reading Session** completion and child enjoyment first (`18` § Success Criteria for Expansion).

---

# QA Oracle (Summary)

| Check | Expected |
|-------|----------|
| Child UI shows score | **Fail** |
| Streak UI present | **Fail** |
| Badge on **Reading Summary** | **Fail** |
| `summary.line_effort` present at completion | **Pass** |
| **Retry** uses encouraging `retry.*` | **Pass** |
| Delight blocks **Done** / **Retry** | **Fail** |

Full criteria: `07_Acceptance_Criteria.md` US-03, US-07.

---

# Decision Summary

- MVP motivation = Noor’s voice + effort praise + **Reading Summary** + optional `delight.*`.
- No scores, leaderboards, streak punishment, or achievement systems in MVP.
- Analytics measure engagement; they do not become child-facing game mechanics.
