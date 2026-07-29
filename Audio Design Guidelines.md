# Audio Design Guidelines

**Main application:** Noory — نوري · **Feature:** Read with Noor — اقرأ مع نور · **Reading companion:** Noor — نور
**Audience:** Sound design, engineering, UX, QA  
**Age range:** Children **3–8**  
**Version:** 1.0  
**Status:** Final  
**Companion docs:** `09_UI_UX_Guidelines.md`, `Noor Character Bible.md`, `Child Accessibility.md`, `Animation Guidelines.md`, `11_Message_Library.md`

---

## Purpose

Define **UX sounds**, **voice roles**, **levels**, and optional **haptics** for **Read with Noor**. Audio should feel warm and safe—never like a quiz buzzer or arcade failure.

**Principle anchor:** `09_UI_UX_Guidelines.md` — no harsh sounds; reduce anxiety. `01_Product_Brief.md` — brief success tone only if Noory standard allows.

---

## Audio philosophy

1. **Support, don’t startle** — especially ages **3–5** (`Child Accessibility.md`).
2. **Positive-only feedback sounds** — no “wrong answer” buzzers, klaxons, or sad trombones on **Retry**.
3. **Voice hierarchy** — child reading > **narrator** (story) > **Noor** (companion) > UX chimes.
4. **Silent paths remain valid** — child can succeed with device muted; visuals and copy carry state.
5. **Arabic-first** — spoken UI is Arabic from `11`; English only in dev reference.

---

## Recording UX sounds

Sounds apply to **Recording start**, active **Recording**, **Recording stop**, and optional capture feedback—not to evaluation outcomes as punishment.

### Recording start

- **Optional** soft cue when mic opens (after consent): single tone, **warm** timbre (marimba, soft bell, gentle pluck).
- Duration: **≤ 150 ms**; attack soft (no click).
- **Do not** play if it overlaps Noor `welcome.*` or `before.*` TTS—sequencing: message finishes → optional start cue → mic live.

### During Recording

- **Default:** No looping UX bed under child voice—mic capture is sacred.
- **Optional:** Very quiet “listening” pad at **≥ 24 dB below** child speech peak (usually **off** in MVP unless user research requests).
- **Avoid:** Beeps on voice activity, metronome ticks, or countdown beeps.

### Recording stop

- **Optional** confirm blip when child taps **Done** (`cta.done_reading`)—same family as start cue, slightly lower pitch or softer.
- Must **never** sound like “submit exam.”

### Max duration (120 s auto stop)

- **No alarm siren.** Optional single gentle chime + calm transition to upload; Noor `loading.*` if shown.
- Copy stays neutral (`loading.01`)—not “time’s up, you failed.”

### Mic permission / errors

- Use Noor spoken lines `mic.01`, `mic.02` as primary feedback.
- Optional subtle attention tone **once** when permission dialog returns denied—still not a buzzer.

---

## Success chimes (soft)

For outcome **Success** only:

| Property | Guideline |
|----------|-----------|
| **When** | After evaluation → **Success** UI; may coincide with subtle animation (`Animation Guidelines.md`) |
| **Timbre** | Bell, harp gliss (short), soft synth ping—**major** or neutral bright interval |
| **Duration** | **200–400 ms** total; fast decay |
| **Level** | **−18 to −14 LUFS** integrated short sfx (tune per device QA); below narrator/Noor speech |
| **Rate limit** | Max **one** success chime per page outcome—no stacking on message TTS unless mixed quietly |

**Retry path:** **No failure chime.** Optional tiny neutral “transition” only when entering **Narrator**—or silence preferred.

---

## No buzzer failures (explicit bans)

Never play for **Retry**, STT low confidence, network errors, or Decision 7:

- Game-show **wrong** buzzer
- Horn, siren, alarm, error beep (PC BIOS style)
- Descending “wah-wah” sad cue
- Voice clip saying “incorrect” in any language
- Loud silence gap implying judgment

**Retry audio =** Noor `retry.*` (TTS or VO) → **narrator** track. That is the help—not a penalty sound.

---

## Narrator vs Noor TTS

Two distinct voice roles—child must learn who is “story” vs “friend.”

### Narrator (story content)

- Source: **`narratorAudioUrl`** from Noory content service (`15_Technical_Architecture.md`, `14` EA-03).
- **When:** Only on **Retry** path **after** child’s first attempt on that page (**Child Tries First**).
- **Role:** Model pronunciation and pacing for **page text**—clear, neutral storytelling, **not** Noor character voice.
- **Mix:** Full level for learning; duck **Noor TTS** to **−12 dB** or pause Noor while narrator plays.
- **UI:** Noor **silent** (`Noor Character Bible.md`); no overlapping `narrator.02` after narrator ends without gap.

### Noor (companion)

- **When:** Welcome, optional before record, outcomes (`success.*`, `retry.*`), loading, continue, complete, summary, mic/network (`11`).
- **Implementation options (MVP):**
  - **Pre-recorded Arabic VO** per `message_key` (preferred for warmth/consistency), or
  - **TTS** with approved Noory voice profile—must match tone rules in `Noor Character Bible.md`.
- **Must not:** Read full page text before first attempt; replace narrator; speak English to child.

### Sequencing cheat sheet

```
Welcome (Noor) → optional before.* (Noor) → [optional record-start sfx]
→ Recording (child speech; Noor silent or rare listen.*)
→ stop [optional stop sfx] → loading.* (Noor optional)
→ Success: success.* (Noor) + optional soft chime → next page
→ Retry: retry.* (Noor) → narrator track (Narrator) → idle → Retry record
```

---

## Levels and mixing

### Hierarchy (peak targeting during session)

1. **Child live voice** — unprocessed monitor **off** by default in MVP (avoid latency echo); if monitor exists, **−6 dB** below dry risk of feedback.
2. **Narrator** — reference **−16 LUFS** short-term; consistent across stories via content pipeline.
3. **Noor speech** — **−18 LUFS**; slightly softer than narrator so help feels gentle.
4. **UX chimes** — **−20 LUFS** or lower; success chime ≤ narrator −6 dB.

### Ducking rules

- When Noor speaks over idle UI: duck optional background music (Noory host) **−12 dB**.
- When **narrator** plays: duck music further; **mute** Noor TTS except pre-roll `narrator.01` before track starts.
- During **Recording**: duck all non-essential audio to zero.

### Device realities

- Respect **hardware volume**; no auto-raise above system level.
- Normalize SFX pack once in asset pipeline; avoid per-device maxing that hurts **3–5** year olds wearing headphones.

### Headphones

- Same curves; success chime still soft—no piercing highs > **8 kHz** emphasis.

---

## Haptics (optional)

Haptics are **never required** for comprehension.

| Event | Haptic | Default |
|-------|--------|---------|
| **Recording start** | Light impact | Off MVP / profile off |
| **Recording stop** | Light impact | Off |
| **Success** | Soft success tap (iOS `.success` / Android `CONFIRM`) | **Optional**; off for ages 3–4 unless host enables |
| **Retry** | **None** | Off |
| Errors | **None** | Off |

If enabled: one pulse per event; no repeated vibration on **Retry** loops.

Sync with optional success chime within **±50 ms** when both on.

---

## Loading, upload, and evaluate

- Spoken: rotate `loading.01`–`03`—no “checking your answer.”
- **No** ticking clock SFX.
- Optional ambient **silence** + visual `Animation Guidelines.md` patient idle is acceptable.

---

## Network and offline

- Spoken `network.01`, `network.02`; optional single soft notification tone—**not** error buzzer.
- Retry actions remain tap-based; no audio-only recovery path.

---

## Accessibility

- **Deaf / hard of hearing:** All states visible via copy, icons, and Noor expression; see `09` (don’t rely on color alone).
- **Sound-sensitive:** Host mute suppresses chimes; TTS respect mute or show subtitles if Noory provides Arabic captions for Noor lines (future)—MVP minimum is visible `message_key` text in UI where messages display.
- **Reduced motion:** Audio unchanged unless product pairs “calm mode” — then disable non-essential chimes, keep optional Noor VO.

---

## Asset production notes

- Format: **AAC/OGG** or platform default; short SFX **mono**; narrator/story **stereo** as content delivers.
- Sample rate: **48 kHz** production; deliver **44.1/48** per platform.
- Naming: `sfx_noor_record_start_v1`, `sfx_noor_success_soft_v1` — versioned.
- Loudness: batch-limit SFX; narrators mastered in content pipeline.

---

## QA checklist

- [ ] **Retry** never triggers buzzer/failure SFX.
- [ ] **Success** chime ≤ 400 ms, soft timbre.
- [ ] Narrator only after first **Retry** on page; Noor silent during narrator.
- [ ] Noor does not read page before first attempt.
- [ ] Recording path has no countdown beeps.
- [ ] Muted device: full session completable.
- [ ] Levels: narrator ≥ Noor ≥ chimes in perceived loudness.
- [ ] 120 s auto-stop: no alarm.
- [ ] Haptics off by default or age-gated; none on **Retry**.

---

## Related documents

- `11_Message_Library.md` — all spoken Arabic lines  
- `09_UI_UX_Guidelines.md` — recording phases, no harsh sounds  
- `Noor Character Bible.md` — speaking timing  
- `12_AI_Evaluation_Flow.md` — states  
- `03_Product_Decisions.md` — narrator on **Retry**, Decision 7  

---

## Decision summary

**MVP:** Soft optional record/success UX sounds; narrator vs Noor voice split; no failure buzzers; ducking and level hierarchy documented; haptics optional and off by default for youngest users.

**Future:** User “calm sounds” toggle; pre-recorded Noor VO library per `message_key`; caption track for Noor TTS.
