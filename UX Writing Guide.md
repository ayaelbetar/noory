# UX Writing Guide

**Version:** 1.0  
**Status:** Final — companion to `11_Message_Library.md`  
**Audience:** Content, UX, Engineering, QA  
**Main application:** Noory — نوري · **Feature:** Read with Noor — اقرأ مع نور · **Reading companion:** Noor — نور

---

# Purpose

Define how user-visible language is written, selected, and reviewed for **Read with Noor**. This guide governs *process and rules*; **canonical Arabic strings** live only in **`11_Message_Library.md`**. If copy is not in `11`, it does not ship in the child UI.

---

# Arabic-First Rules

1. **Child UI is Arabic only** for MVP (`README.md`, `00_Project_Principles.md`). English may appear in docs, code comments, `en_reference` columns, and internal API messages — never on screen for the child.
2. **RTL layout** is the default. Mirror navigation, reading order, and CTA placement per `09_UI_UX_Guidelines.md`.
3. **STT and on-page story text** are Arabic. Do not mix English instructional copy into the **Reading Session** flow.
4. New locales are post-MVP (`18_Future_Ideas.md`). Do not add parallel English child strings without an explicit product change.

---

# `message_key` Discipline

| Rule | Detail |
|------|--------|
| **Single source** | Every child-visible string MUST map to a key in `11_Message_Library.md`. |
| **Lookup, not literals** | Flutter and backend MUST resolve copy via `message_key` (JSON bundle, codegen, or shared resource map). No hardcoded Arabic in widgets. |
| **Stable keys** | Keys use dot notation: `category.variant` (e.g. `success.02`, `cta.retry`). Do not rename keys without updating `11`, tests, and analytics notes. |
| **CTAs** | Button labels use `cta.*` keys only (`09_UI_UX_Guidelines.md`). |
| **Placeholders** | Interpolation tokens are explicit in `11` (e.g. `{ChildName}`, `{completedPages}`, `{totalPages}`). Implementations MUST preserve token names and Arabic grammar around them. |
| **Internal vs child** | Product terms **Success**, **Retry**, **Continue**, **Evaluation** are for specs/analytics — not child copy. Child sees Arabic from `11` only. |

**Workflow for new copy**

1. Propose Arabic + `message_key` + `en_reference` in a change to `11_Message_Library.md`.
2. UX + PM review against this guide and `10_Noor_Character.md`.
3. Engineering wires the key; QA verifies UI shows exact `11` text (AC in `07`).

---

# Voice and Tone

Align with `11` § Voice & Tone Rules and `10_Noor_Character.md`.

**Always**

- Warm, positive, short, encouraging.
- Age-appropriate for **3–8** (`00_Project_Principles.md`).
- Celebrate **effort before achievement** (`11` § Message Selection Rules).
- Forward-looking: keep the child moving through the story.

**Never**

- Blame, shame, or compare the child to others.
- Use exam metaphors (test, grade, pass/fail, score).
- Mention AI, algorithms, robots, evaluation, or “smart” technology.
- Show accuracy percentages, letter grades, or rank.

**Outcome framing (product language → child experience)**

| Product term | Child sees |
|--------------|------------|
| **Success** | `success.*` + `cta.next_page` |
| **Retry** | `retry.*` → **Narrator** → `cta.retry` |
| **Continue** (Decision 7) | `continue.*` + `cta.continue_reading` |
| Failures (network, mic, timeout) | `network.*`, `mic.*`, `loading.*` — never raw API text |

---

# Forbidden Terms

Use **`README.md` Canonical Terminology** as the master list. Child-facing copy MUST NOT use these words or close synonyms in any language:

| Forbidden (child UI) | Use instead |
|----------------------|-------------|
| Wrong, Incorrect, Failed | Effort praise from `retry.*` / `success.*` |
| Try Again (as label) | **`Retry`** product term → Arabic `cta.retry` (**حاول مرة أخرى**) |
| Pass, Correct (as judgment) | **Success** (internal) → `success.*` |
| Test, Exam, Check your reading | Story/adventure framing |
| Score, %, Grade, Rank | Not shown; **Reading Summary** uses pages + effort only |
| AI, Robot, Algorithm, Evaluation | Noor as companion only |

Loading copy must not imply grading (`loading.*` in `11`).

---

# Personalization

Per `11` § Personalization (Optional MVP) and `03_Product_Decisions.md` Decision 10:

- Use `{ChildName}` only when the **Noory host app** already exposes a display name for the active child profile.
- **No new authentication** in MVP. If name is absent, use non-personalized keys (`success.*`, `welcome.*`, etc.).
- Prefer personalization on welcome, milestone delight, or summary — not on every **Retry** message (avoid feeling surveilled).
- Keys: `personal.01`–`personal.03` only unless `11` is extended.

---

# Length Limits

| Context | Limit |
|---------|--------|
| General Noor line | **≤ 2 short sentences** (`11` § Message Selection Rules) |
| CTA labels | Single short phrase (see `cta.*` table in `11`) |
| **Reading Summary** | One `complete.*` line + `summary.line_pages` + `summary.line_effort` + one CTA (`01_Product_Brief.md`) |
| Loading / listening | One line; no paragraphs |
| Error recovery | One empathetic line + clear next action (tap **Done**, allow mic, wait) |

If Arabic exceeds two sentences, split into two keys and show sequentially — do not stack long blocks on one screen.

---

# Message Selection and Rotation

Per `11` § Message Selection Rules and `03_Product_Decisions.md` Decision 11:

- Select messages **by context**: welcome vs listen vs success vs retry vs completion vs network.
- **Do not repeat** the same key twice in a row on the same screen flow.
- **`delight.*`**: optional, **contextual** rotation after milestones — not purely random (`05_User_Journey.md`).
- **Retry** path: prefer supportive `retry.*`; pair with narrator intro `narrator.*` before re-record.

---

# RTL Punctuation and Typography

- Use **Arabic quotation marks** « » or localized convention consistent with Noory design system — not English `"` quotes wrapping Arabic sentences in UI.
- **Question marks and exclamation** follow Arabic Unicode norms (؟ ، !) where copy in `11` uses them.
- **Numbers in Arabic copy**: follow Noory platform rule for Eastern Arabic vs Western digits; `{completedPages}` / `{totalPages}` must match host app number shaping.
- **Punctuation in RTL**: place sentence-ending punctuation so it reads naturally in RTL; avoid LTR-only icons between Arabic clauses without mirroring.
- **Bidirectional**: Latin tokens inside Arabic (rare in child UI) should use Unicode bidi isolates if the host requires them; prefer all-Arabic in `11`.
- **CTA + punctuation**: buttons generally omit trailing periods; body copy may use them sparingly per `11` canonical strings.

---

# Roles and Review Checklist

| Role | Responsibility |
|------|----------------|
| **Content / UX** | Own tone; propose `11` changes |
| **Engineering** | Keys only; no invented copy |
| **QA** | String oracle = `11`; fail if UI ≠ library |

**Pre-release checklist**

- [ ] Every visible string traceable to `message_key` in `11`
- [ ] No forbidden terms in UI or screen reader labels
- [ ] **Retry** CTA uses `cta.retry`, not English “Try Again”
- [ ] **Reading Summary** has no score or retry count for child
- [ ] RTL layout verified on at least one phone and one tablet
- [ ] Personalization falls back cleanly when name is null

---

# Related Documents

| Document | Use |
|----------|-----|
| **`11_Message_Library.md`** | **Canonical strings** (mandatory) |
| `10_Noor_Character.md` | Personality and when Noor speaks |
| `09_UI_UX_Guidelines.md` | RTL, a11y, screen states |
| `README.md` | Terminology table |
| `07_Acceptance_Criteria.md` | Testable copy behavior (AC-03-01, AC-07-02) |

---

# Decision Summary

- Arabic-first; `11` is the only approved child copy source.
- Keys are stable contracts between content, Flutter, and QA.
- Encouragement without judgment; AI invisible in language.
- Personalization optional and host-driven only.
