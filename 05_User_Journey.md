# 05_User_Journey

# User Journey

**Version:** 1.1  
**Status:** Final

---

# Purpose

Describe the **Reading Session** from the child's perspective (Arabic RTL, ages **3–8**). All Noor lines use keys from **`11_Message_Library.md`**.

**Screen-level specs (Purpose, Components, States, Loading, Empty, Error, Accessibility, Animations, Voice, Business Rules, AC, Edge Cases):**

| Surface | Document |
|---------|----------|
| Story library, details, entry | `Book Library Flow.md` |
| Page recording & processing | `Recording UX Specification.md` |
| Narrator playback | `Audio Playback Flow.md` |
| Reading page / session | `09_UI_UX_Guidelines.md`, `12_AI_Evaluation_Flow.md` |

---

# Happy Path

## 1. Open Story
- Child selects a story.
- **Read with Noor** (`cta.read_with_noor`) is available (after consent — `14_Assumptions.md` SP-01).

**Emotion:** Curious  

**Noor:** `welcome.01` — مرحبًا! أنا نور. هيا نقرأ معًا.

---

## 2. Recording start

- Child taps **Start Reading** (`cta.start_reading`).
- Microphone permission if needed.

**Emotion:** Excited

---

## 3. Read the Page

- Child reads aloud during **recording**.
- Noor listens quietly (`listen.*` only if needed).

**Emotion:** Focused

---

## 4. Recording stop & processing

- Child taps **Done** (`cta.done_reading`) → **upload** → **evaluation** (internal).
- Loading: `loading.*` (e.g. `loading.01`, `loading.02`) — no exam language.

---

## 5A. Success

- Outcome **Success**; Noor shows `success.*`.
- **Continue** via `cta.next_page` (**Next Page**).

**Emotion:** Proud

---

## 5B. Retry

- Outcome **Retry**; Noor shows `retry.*`.
- **Narrator** plays; `cta.retry` available for new **recording start**.

**Emotion:** Safe and motivated

---

## 5C. Decision 7 — Continue

- After **3** **Retry** outcomes on the same page: `continue.*` + `cta.continue_reading`.

**Emotion:** Supported (not punished)

---

## 6. Next Page

Repeat from step 2. Progress: Page X of Y (RTL).

---

## 7. Completion & Reading Summary

- **Completion** celebration: `complete.*`
- **Reading Summary:** `summary.line_pages`, `summary.line_effort`
- CTA: `cta.read_another_story`

---

# Alternative Flows

## Internet Lost
`network.*`; preserve **Reading Session**; **recording start** after reconnect.

## Microphone Denied
`mic.*`; re-request permission.

## AI Timeout
Friendly message; child taps **Done** again (no auto re-upload — `EC-08`).

## Child Leaves Mid-Reading
Preserve Session Store when possible (`EC-06`).

---

# Emotion Timeline

| Stage | Child Emotion | Noor's Role |
|-------|---------------|-------------|
| Start | Curious | Welcome |
| Recording | Focused | Listen |
| Success | Proud | Celebrate |
| Retry | Slightly frustrated | Encourage + narrator |
| Continue (D7) | Relieved | Encourage forward |
| Finish | Happy | **Reading Summary** |

---

# Delight Moments

Contextual rotation of `delight.*` after milestones (`03` Decision 11) — not purely random.

---

# PM Thinking

Uncertainty is met with encouragement; **Retry** and **Continue** both protect confidence.

---

# Decision Summary

## Decisions Made
- Aligned with **Success** / **Retry** / **Continue** terminology.
- Arabic copy by reference to `11`.

## Open Questions
None.

## Future Enhancements
- Personalized journey (post-MVP).
