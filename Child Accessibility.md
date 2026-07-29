# Child Accessibility

**Main application:** Noory — نوري · **Feature:** Read with Noor — اقرأ مع نور · **Reading companion:** Noor — نور
**Audience:** UX, engineering, QA, caregivers (via in-app guardian copy where applicable)  
**Age range:** **3–8** (Arabic-speaking children)  
**Version:** 1.0  
**Status:** Final  
**Companion docs:** `09_UI_UX_Guidelines.md`, `Noor Character Bible.md`, `Animation Guidelines.md`, `Audio Design Guidelines.md`

---

## Purpose

Define **developmental expectations and UI adaptations** for each age from **3 through 8**, so the same **Reading Session** stays safe, understandable, and physically usable. This document ties age bands to **touch targets**, layout rules in **`09_UI_UX_Guidelines.md`**, and Noor behavior.

**Design north star:** One flow for all ages in MVP, with **progressive disclosure** and **host-app profile age** (when available) tuning defaults—not separate apps per age.

---

## Cross-age foundations (all ages 3–8)

These apply to every section below and align with **`09_UI_UX_Guidelines.md`**.

| Requirement | Specification |
|-------------|----------------|
| **Touch targets** | Minimum **48×48 dp** (CSS px equivalent on web); primary CTAs (**recording start**, **recording stop**, **Retry**, **Continue**) target **56 dp** where layout allows. |
| **Spacing** | At least **8 dp** between adjacent tappable controls to reduce mis-taps. |
| **Contrast** | High contrast for Arabic story text and CTAs; do not rely on color alone for state. |
| **RTL** | Root `dir="rtl"`; mirrored directional icons; progress copy e.g. «الصفحة 4 من 12». |
| **Audio + visual** | Critical instructions have **audio and/or icon** support—not reading alone. |
| **Anxiety reduction** | No countdown timers, no on-screen scores, no harsh motion or buzzer sounds. |
| **Child Tries First** | Narrator only after first **Retry** on a page (`Noor Character Bible.md`). |
| **Screen readers** | Arabic accessibility labels for all CTAs matching `11_Message_Library.md` strings. |

**Reference:** Accessibility subsection in `09_UI_UX_Guidelines.md` (min 48dp, contrast, Arabic labels).

---

## Age 3

### Reading ability

- Pre-reader or emergent; may **recite memorized chunks**, chant rhythmically, or **describe pictures** rather than decode every word.
- Limited phonemic awareness; **cannot be expected** to read full page text independently.
- **Product expectation:** Still uses **Read with Noor** with caregiver co-reading; evaluation outcomes should be interpreted leniently at platform level—UX must never shame.

### Interaction

- Single primary action per screen; **one big button** (e.g. **recording start** / **Done**).
- Avoid multi-step gestures; **tap only** for child actions.
- **Recording stop** must remain visible and large during capture—do not hide behind menus.

### Attention span

- **~2–4 minutes** focused engagement per stretch; prefer **short stories** or early pages.
- Frequent **visual calm**; Noor animation minimal (`Animation Guidelines.md`).

### Motor skills

- Whole-hand taps; imprecise aim; may **rest palm** on screen—use generous hit areas (**56 dp** primary).
- Hold tablet with two hands; place primary CTAs **bottom center / bottom-start (RTL thumb zone)** per `09`.

### UI adaptations

- Largest typography tier in Noory story reader when age profile = 3.
- **Optional** auto-play of `before.01` (short) once per page; no paragraph-length onboarding.
- Progress indicator simple (e.g. dots or «صفحة X» without dense numerals if caregiver prefers—follow host profile).
- **Decision 7 Continue** surfaced **earlier in caregiver settings** only if Noory adds it later; MVP default remains 3 **Retry** outcomes globally.

### Audio cues

- Soft **recording start** acknowledgment (optional chime—see `Audio Design Guidelines.md`).
- Noor welcome **once** per session; avoid stacking messages.
- **Narrator** volume slightly above Noor so story model is clear when **Retry** path runs.

### Caregiver role

- **Required** for mic consent, story choice, and often **co-reading** (adult reads, child repeats, or child “reads” familiar lines).
- Caregiver sits beside child for **recording stop** if child cannot find **Done**.
- Explain “Noor listens to your voice” in plain language—no AI terminology.

---

## Age 4

### Reading ability

- Emerging **letter awareness**; may read isolated words or repeated refrains in Arabic stories.
- Heavy reliance on **illustrations** and rhyme; partial page coverage is normal.

### Interaction

- Still **one primary CTA**; secondary actions (if any) visually de-emphasized.
- First-time **Read with Noor**: show **one** illustrated hint for mic (host/onboarding), then rely on `before.*`.

### Attention span

- **~4–6 minutes**; may need breaks between pages—allow pause in **Idle** without penalty.

### Motor skills

- Improving tap accuracy; keep **48 dp minimum**, **56 dp** for **Done** and **Retry**.

### UI adaptations

- Story text: **generous line height** and short lines per `09` readability.
- Limit concurrent on-screen messages to **one Noor bubble** + story.
- **Success** feedback: subtle animation only; avoid flashing.

### Audio cues

- Optional quiet `listen.01` mid-long recordings—not before 15s to avoid distraction.
- **Success** chime: single soft tone, low volume.

### Caregiver role

- Nearby for first **2–3 sessions**; helps with **Retry** flow (“listen, then tap حاول مرة أخرى”).
- May need to reposition device so mic captures child voice, not adult.

---

## Age 5

### Reading ability

- Many can **decode simple sentences** in Arabic; still mix guessing from pictures with real reading.
- Beginning to understand **turn-taking**: I read → Noor responds.

### Interaction

- Can manage **recording start → read → recording stop** with minimal help after practice.
- Understands **Retry** if narrator is framed as “listen together” (`narrator.01`).

### Attention span

- **~6–8 minutes** per story segment; suitable for typical picture-book page counts.

### Motor skills

- Finger tap reliable; can use **phone or tablet**; maintain large targets for moving vehicles / walking (discourage—but design defensively).

### UI adaptations

- Standard `09` typography tier.
- Show **page progress** («الصفحة X من Y») to anchor orientation.
- **Loading** states use `loading.*` + calm animation—not spinners that imply “testing.”

### Audio cues

- **Recording** state: optional subtle loop (listening) at low level under voice monitoring UX.
- Distinguish **Noor TTS** (short encouragement) from **narrator** (story)—different timbre or EQ preset (`Audio Design Guidelines.md`).

### Caregiver role

- **Intermittent**—checks in at story end or if child calls for help.
- Guardian consent still required per Noory; caregiver does not need to listen to every page.

---

## Age 6

### Reading ability

- **Early fluent** on familiar texts; attempts new vocabulary with self-correction.
- More sensitive to **tone**—harsh feedback would stick; Noor must stay warm (`Noor Character Bible.md`).

### Interaction

- Comfortable with full **Reading Session** loop including **Reading Summary**.
- Can tap **Continue** after **Success** and **Retry** without re-reading instructions.

### Attention span

- **~8–12 minutes** for engaging stories; tolerate upload/evaluate wait with `loading.*`.

### Motor skills

- Precise taps; **48 dp** still mandatory for accessibility and younger siblings sharing device.

### UI adaptations

- Enable **message rotation** in `11` without repeating same praise twice in a row.
- Optional **delight.*** messages sparingly (Decision 11)—never every page.

### Audio cues

- Success chime can play; child may mute via **host app** volume—never require sound to proceed.
- Haptics **optional** light tap on **Success** if device supports and Noory enables (`Audio Design Guidelines.md`).

### Caregiver role

- **Trust-building**—reads **Reading Summary** with child if desired; no grade interpretation (there is no score).

---

## Age 7

### Reading ability

- Representative persona age (`04_Personas.md`—Omar, 7): reads with growing independence; wants to **finish stories** and feel capable.
- May read quickly or skip pauses—evaluation remains **page-level**, not word drill.

### Interaction

- Full mastery of session states; may explore **another story** from summary CTA (`cta.read_another_story`).
- Understands Decision 7 **Continue** as “keep the adventure going,” not failure.

### Attention span

- **~10–15 minutes**; longer chapter-style content possible if Noory catalog supports.

### Motor skills

- Adult-like precision on tablet; orientation changes per host policy—CTAs stay in thumb reach.

### UI adaptations

- Slightly **denser** story text acceptable if Noory content tier allows—still high contrast.
- Noor copy can feel less “preschool,” still **short and kind**—no slang or sarcasm.

### Audio cues

- Prefer **shorter** Noor lines; child may read own pace—avoid long TTS over story text.
- Reduced need for `listen.*` during recording.

### Caregiver role

- **Minimal** during session; values safe independent practice (`04_Personas.md` parent goals).

---

## Age 8

### Reading ability

- **Fluent** on grade-appropriate Arabic; may find very simple praise repetitive—rotate `success.*` / `delight.*`.
- Still benefits from **Retry + narrator** for hard names or diacritics-heavy pages.

### Interaction

- Expects **consistent** rules; violations of **Child Tries First** feel “patronizing.”
- May complete sessions without avatar attention—**story remains focal** (`20_Design_Principles.md`).

### Attention span

- **~15+ minutes** possible; respect exit without guilt—host back navigation, no punitive copy.

### Motor skills

- Same **48 dp** minimum (shared devices, accessibility law alignment, motor variability).

### UI adaptations

- Avoid infantilizing visuals in Noor asset set if Noory offers “older child” theme—character stays friendly, not babyish.
- **Reading Summary**: emphasize effort line (`summary.line_effort`) over page counts if counts could discourage.

### Audio cues

- Lower default UX sound levels; optional haptics off by default for this band if profile flag exists.

### Caregiver role

- Optional; caregiver may only grant mic once per install.

---

## Mapping ages to `09_UI_UX_Guidelines.md`

| `09` rule | How age doc applies it |
|-----------|-------------------------|
| Min **48dp** touch targets | **56dp** primaries for ages 3–5; **48dp** minimum all ages |
| Large Arabic typography | Largest tier 3–4; standard 5–7; content-driven 8 |
| RTL layout & thumb reach | All ages; critical for 3–5 one-handed holding |
| No harsh sound/animation | Stricter calm defaults 3–4; see Animation/Audio guidelines |
| State-specific UI (`Success` / `Retry` / Continue) | Caregiver coaching notes differ by age; UI keys identical |
| Noor quiet during reading/narrator | All ages; especially 3–5 where overlap confuses |

---

## Motor and cognitive accessibility (all ages)

- **Reduced motion:** Honor OS/host flag—static Noor, no parallax (`Animation Guidelines.md`).
- **Hearing:** Visual state for **Recording** (icon + optional waveform calm); never sound-only critical path.
- **Vision:** High contrast; avoid thin Arabic diacritics rendered below readable size—follow Noory content standards.
- **Language / DLL:** MVP Arabic-only; if child mixes dialect, STT leniency is backend—UI stays encouraging regardless.

---

## QA scenarios by age

| Scenario | Ages | Pass criteria |
|----------|------|----------------|
| Tap **Done** without missing | 3–4 | **56dp** target; caregiver assist OK |
| Complete page loop unaided | 5–6 | start → stop → outcome → next |
| **Retry** + narrator + re-record | 5+ | Child understands without English |
| Decision 7 **Continue** | 7–8 | Feels like progress, not punishment |
| RTL thumb reach | All | Primary CTA reachable one-handed portrait |

---

## Related documents

- `09_UI_UX_Guidelines.md` — RTL, recording UX, touch targets, state UI  
- `04_Personas.md` — primary child persona (7)  
- `00_Project_Principles.md` — child-first, accessibility intent  
- `11_Message_Library.md` — all child-facing Arabic copy  
- `Noor Character Bible.md` — when Noor speaks by developmental fit  

---

## Decision summary

**MVP:** Single flow; age table guides typography defaults, target sizing emphasis, caregiver expectations, and audio sparingness—not separate binaries per age.

**Future:** Host-app age profile drives default text size, motion tier, and message pool (`11` age variants).
