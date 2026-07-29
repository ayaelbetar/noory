# 09_UI_UX_Guidelines

# UI / UX Guidelines

**Version:** 1.2  
**Status:** Final  
**Audience:** Children **3–8** on **Noory** · **Read with Noor** feature  
**Extended specs:** `Recording UX Specification.md`, `Animation Guidelines.md`, `Audio Design Guidelines.md`, `Child Accessibility.md`

---

# Purpose

Visual and interaction rules for **AI Reading Buddy** (Arabic RTL, child-first).  
**All copy:** `11_Message_Library.md`. **Terms:** `README.md`.

---

# Design Principles

- Child-first design.
- Clean, uncluttered layout.
- Story remains focal.
- Positive visual feedback only.

---

# RTL Layout (MVP)

- Root layout direction: **RTL** (`dir="rtl"` or platform equivalent).
- Story text: Arabic, right-aligned per Noory standards.
- Progress (`Page X of Y`): numerals may stay Western; label order follows RTL reading (e.g. «الصفحة 4 من 12»).
- **Continue** / **Retry** buttons: primary actions bottom-center or bottom-start in RTL (thumb reach).
- Icons with direction (chevrons, back): mirror for RTL.
- Noor avatar: consistent corner (e.g. bottom-start) without covering text.
- Do not hardcode LTR flex rows for control bars.

See also `20_Design_Principles.md` Principle 6.

---

# UI Principles

## Simplicity

Only controls for the current state (`12_AI_Evaluation_Flow.md`).

## Consistency

Use `message_key` labels from `11` for all buttons.

## Readability

- Large Arabic typography.
- High contrast.
- Comfortable line spacing.

---

# UX Principles

## Encourage, Never Judge

Use `success.*`, `retry.*`, `continue.*` only.  
Forbidden: Wrong, Failed, Incorrect, Try Again (product term).

## Reduce Anxiety

- No countdown timers.
- No scores or accuracy on screen.
- No harsh sounds/animations.

---

# Design System (Implementation Tokens)

**Owner split:** Visual tokens and layout defaults live here. **Motion** → `Animation Guidelines.md`. **Sound/haptics** → `Audio Design Guidelines.md`. **Per-age a11y** → `Child Accessibility.md`. **Principles** → `20_Design_Principles.md`.

## Colors

| Token | Usage | MVP guidance |
|-------|--------|--------------|
| `primary` | Primary CTAs (`cta.read_with_noor`, `cta.start_reading`) | Noory brand purple; sufficient contrast on white |
| `primaryContainer` | Story cards, Noor backdrop | Soft tint; never alarm red for Retry |
| `surface` | Page background | Calm neutral; story text area highest contrast |
| `errorContainer` | Recoverable banners only | Muted; paired with encouraging copy from `11`, not blame |
| `successAccent` | **Success** micro-celebration | Warm gold/green accent; no score UI |

Forbidden: red X icons, “fail” color as dominant Retry theme.

## Typography

| Role | Arabic guidance |
|------|-----------------|
| Story body | Largest readable size; line-height ≥ 1.5; Noto Naskh Arabic or Noory standard |
| Page progress | `titleLarge`; «الصفحة {n} من {total}» |
| Noor line | `bodyLarge`; max 2 short sentences |
| CTA | `labelLarge`; bold; never below 18sp effective |

Age adjustments: see **`Child Accessibility.md`** (3–4 larger type, 7–8 slightly denser allowed).

## Spacing & radius

- Screen padding: **16–24** dp.
- Card padding: **12–16** dp; gap **12** dp between library cards.
- Border radius: cards **12** dp; buttons **full** or **12** dp; sheets **16** dp top.

## Icons & illustration

- Book/cover fallback: `menu_book` or Noory illustration set.
- Directional icons mirrored in RTL.
- Noor avatar: consistent slot; never covers story text (`Animation Guidelines.md`).

## Touch targets

- Minimum **48×48** dp; primary CTAs **56** dp height where possible.
- Spacing between tappable controls ≥ **8** dp.

## Components

| Component | Rules |
|-----------|--------|
| **Buttons** | One primary FilledButton per step; secondary TextButton only for dismiss/back where specified |
| **Cards** | Library story rows; ink well full card; cover 72×96 min |
| **Dialogs** | Rare in child path; prefer banners (`EntryMessageBanner`) |
| **Bottom sheets** | Host-owned consent only; not for child quiz prompts |

## Motion, audio, haptics

- **`Animation Guidelines.md`**: listening loop, subtle Success, reduced motion.
- **`Audio Design Guidelines.md`**: soft success chime; no buzzer on Retry; narrator ducking.
- Haptics: optional light tap on **Success** only; off by default ages 3–4.

## Accessibility

- WCAG-minded contrast for story text.
- `Semantics` / TalkBack labels in Arabic for all CTAs.
- Do not rely on color alone for recording state (pair icon + label).
- Per-age guidance: **`Child Accessibility.md`**.

---

# Recording Experience

| Phase | UX |
|-------|-----|
| Before **recording start** | `before.*` optional |
| **Recording** | Listening animation; `listen.*` optional |
| **Recording stop** | Prominent `cta.done_reading` |
| **Upload / evaluation** | `loading.*` |

Max duration 120s → auto **recording stop** (`EC-13`).

---

# State-Specific UI

## Success (**Success** outcome)

- `success.*` + `cta.next_page` (**Continue**)

## Retry (**Retry** outcome)

- `retry.*` + **narrator** + `cta.retry`

## Decision 7

- `continue.*` + `cta.continue_reading`

## **Reading Summary**

- `complete.*`, `summary.line_pages`, `summary.line_effort`, `cta.read_another_story`

---

# Error States

Use `network.*`, `mic.*`, `retry.*`; never raw API errors.

---

# Accessibility

- High contrast; large touch targets (min 48dp).
- Screen reader labels in Arabic for CTAs.
- Do not rely on color alone for state.

---

# Responsive Behavior

Tablets and phones; support orientation per Noory app policy.

---

# Noor in the Interface

Visible for guidance; quiet during active reading and **narrator** playback.

---

# Do's / Don'ts

**Do:** celebrate effort; use `11` strings; calm visuals.  
**Don't:** technical errors; shame; English child copy; exam metaphors.

---

# PM Thinking

UI serves the story and **Reading Session** states.

---

# Decision Summary

## Decisions Made
- RTL rules documented.
- State UI aligned with **Success** / **Retry** / **Continue**.

## Open Questions
None.

## Future Enhancements
- Reduced-motion profile; dark mode.
