# Animation Guidelines

**Product:** AI Reading Buddy for Noory · **Read with Noor**  
**Audience:** Design, motion, engineering, QA  
**Age range:** Children **3–8**  
**Version:** 1.0  
**Status:** Final  
**Companion docs:** `09_UI_UX_Guidelines.md`, `Noor Character Bible.md`, `Child Accessibility.md`, `20_Design_Principles.md`

---

## Purpose

Define how **Noor**, UI feedback, and session transitions **move** on screen: calm, readable, RTL-safe, performant, and respectful of **reduced motion**. Motion supports reading—it never competes with the story.

**Principle anchor:** `09_UI_UX_Guidelines.md` — no harsh sounds/**animations**; positive visual feedback only. `20_Design_Principles.md` — reading comes first; avoid unnecessary animation.

---

## Global motion principles

1. **Subtle over spectacular** — especially **Success** and **Completion**; confidence beats fireworks.
2. **Purposeful** — every loop maps to a **Reading Session** state in `12_AI_Evaluation_Flow.md`.
3. **No harsh motion** — no shake, flash, slapstick bounce, rapid strobe, or “wrong” wobble on **Retry**.
4. **Story-first** — animations stay in avatar/chrome; **never obscure Arabic page text**.
5. **Predictable** — same state → same motion language every session.
6. **Interruptible** — user tap on CTA stops decorative motion immediately.
7. **Accessible** — full **reduced-motion** path (see below).

---

## No harsh motion (explicit bans)

Do **not** ship in MVP:

| Banned pattern | Why |
|----------------|-----|
| Screen shake on **Retry** or errors | Feels like punishment; spikes anxiety |
| Red flash / full-screen color pulse | Exam / alarm association |
| Fast zoom in/out on Noor face | Overwhelming for ages 3–5 |
| Confetti cannons, particle storms on every **Success** | Desensitizes; distracting |
| Spinning “loading” gears with sharp ticks | Implies test grading |
| Character sad face, tears, thumbs-down | Violates encourage-never-judge |
| Parallax story text | Hurts readability and RTL layout |
| Auto-playing unrelated loops on story text | Breaks focus |

**Retry** animation language: **supportive** (open posture, gentle nod, soft purple/calm accent per brand)—never “error mascot.”

---

## Celebration: subtle by design

### Success (page outcome)

- Duration target: **400–800 ms** total accent + return to idle.
- Allowed: small scale **1.0 → 1.05 → 1.0** on Noor badge; soft glow once; optional single star drift **within avatar bounds**.
- Optional UI: brief highlight on `cta.next_page` (opacity pulse once)—not blinking.
- **Forbidden:** multi-second dances, sound-synced jumps requiring attention away from text.

### Completion / Reading Summary

- Slightly warmer than page **Success** but still **≤ 1.2 s** hero motion.
- Prefer **static celebratory pose** + readable summary text entrance (fade/slide **from bottom**, 200–300 ms).
- Star motif (`10_Noor_Character.md`) — slow twinkle, low amplitude.

### Delight messages (Decision 11)

- If shown, **no extra motion layer** beyond standard Success idle—rotate copy only.

---

## Listening loop (Recording state)

When session state = **Recording** (`recording`):

- **Primary:** Noor **listening loop** — slow breathing blink, ear tilt, or gentle pulse at **≤ 0.5 Hz** (one cycle every 2+ seconds).
- **Amplitude:** ≤ **3%** scale change on avatar; no full-body bounce.
- **Audio sync:** Do not lip-sync to child mic input in MVP (privacy + complexity).
- **Optional:** calm recording indicator (mic icon soft glow)—synced to loop phase, not to live waveform spikes (waveform optional, smoothed heavily if used).

**Exit:** On **recording stop**, loop eases out **150–250 ms** to idle—no snap cut.

**Silence alignment:** If product disables `listen.*` TTS, motion still shows “I’m here”—visual-only listening.

---

## State-to-animation map

| State (`12`) | Motion |
|--------------|--------|
| **Idle** | Soft idle breathe (very subtle) |
| **Preparing** | Neutral attentive; optional mic icon pulse |
| **Recording** | Listening loop (above) |
| **Uploading** / **Evaluating** | Patient idle; optional slow opacity breathe—**no** frantic spinner |
| **Success** | Subtle celebration (above) |
| **Retry** | Supportive gesture; hold calm through `retry.*` |
| **Narrator** | **Still** or near-still Noor; no talking animation |
| **Continue** (Decision 7) | Encouraging nod; same calm tier as **Retry** |
| **Completed** / **Reading Summary** | Closure celebration (subtle) |
| Errors (mic/network) | Calm concern; no shake |

---

## RTL-safe motion

Arabic UI is **RTL** (`09_UI_UX_Guidelines.md`):

- **Directional enters/exits:** Prefer **vertical** (fade up/down) or **center scale** for modals and toasts—avoid hard-coded “slide from left” that fights reading direction.
- **Chevrons / back:** Mirror assets for RTL; motion path follows mirrored icon semantics.
- **Progress:** «الصفحة X من Y» updates without horizontal marquee LTR.
- **Noor placement:** Fixed corner (**bottom-start** in RTL) so motion does not cross story text in reading order.
- **Control bars:** Do not animate controls in LTR-only flex order; test mirrored layouts.

**QA:** Snapshot LTR exception screens (if any internal) separately—child UI remains RTL.

---

## Reduced motion

Honor, in order:

1. **OS** `prefers-reduced-motion: reduce`
2. **Noory host app** accessibility setting (when exposed)

When active:

| Normal | Reduced |
|--------|---------|
| Listening loop | Static “listening” pose |
| Success glow / scale | Instant pose change or 0 ms opacity crossfade ≤ 100 ms |
| Summary entrance slide | Fade only or no animation |
| Loading breathe | Static illustration + text `loading.*` |
| Any decorative particles | **Off** |

**Requirement:** Full functionality without decorative motion; CTAs and state changes remain immediate and clear.

Document flag in engineering handoff so QA can toggle both paths.

---

## Performance

Target **60 fps** on mid-tier tablets from **3 years ago** (align with Noory NFR when published in `15_Technical_Architecture.md`).

### Budgets

- **Noor avatar:** Prefer **single Lottie/Rive/SVG** rig or sprite sheet; GPU-friendly transforms only (`transform`, `opacity`).
- **Concurrent animators:** ≤ **2** (e.g. Noor idle + mic indicator).
- **Blur / shadows:** Static or disabled on low-power mode.
- **Page turn:** If animated, ≤ **300 ms**; prefer instant text swap with tiny fade.

### Loading / evaluating

- Avoid blocking UI thread during **Uploading**; show static Noor + `loading.*`.
- Do not attach heavy animation to network progress bars.

### Battery and thermal

- Pause decorative idle when app backgrounded.
- Stop listening loop when not in **Recording**.

### Testing

- Profile on low-end Android tablet + iPad baseline.
- Verify jank-free **Recording** → **Success** transition under real upload latency.

---

## Layout and layering

- **Z-order:** Story text **above** decorative effects; Noor **beside** or **below** text panel per design—never cover glyphs.
- **Safe areas:** Respect notches; CTAs in thumb zone (`09`).
- **Max motion area:** Confine celebration particles to avatar clip rect.

---

## Integration with audio

- Motion peaks should **not** require loud SFX (`Audio Design Guidelines.md`).
- If **Success** chime plays, animation peak within **±100 ms** of chime attack optional—not mandatory for reduced motion.

---

## Do’s and don’ts

**Do**

- Keep motion slow, small, and state-linked.
- Test ages **3–5** for overstimulation (see `Child Accessibility.md`).
- Mirror RTL; fade vertically.
- Provide reduced-motion parity.

**Don’t**

- Punish **Retry** with harsh motion.
- Cover Arabic text.
- Loop flashy motion during reading.
- Use motion as the only success indicator.

---

## QA checklist

- [ ] **Retry** has no shake/red flash/sad caricature.
- [ ] **Success** celebration ≤ 800 ms accent (excluding optional idle).
- [ ] Listening loop ≤ 0.5 Hz scale change ≤ 3%.
- [ ] **Narrator** state: Noor still.
- [ ] `prefers-reduced-motion` disables loops and particles.
- [ ] RTL layout: no LTR-only slide assumptions.
- [ ] Story text never clipped by Noor animation.
- [ ] 60 fps on reference hardware during **Recording**.

---

## Related documents

- `09_UI_UX_Guidelines.md` — layout, RTL, recording phases  
- `Noor Character Bible.md` — expression table  
- `12_AI_Evaluation_Flow.md` — state enum  
- `01_Product_Brief.md` — subtle completion animation note  

---

## Decision summary

**MVP:** Calm listening loop, subtle **Success**, still **Narrator**, RTL-safe transitions, reduced-motion parity, performance-conscious avatar.

**Future:** Seasonal idle variants; host-app “high motion” delight tier (opt-in only, default off for ages 3–5).
