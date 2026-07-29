# Audio Playback Flow

**Version:** 1.0  
**Status:** Production-ready (MVP)  
**Audience:** Product, Design, Flutter/audio engineering, QA  
**Locale:** Child UI Arabic RTL · Documentation English  

---

# Document Purpose

Specify **narrator audio playback only** for **Read with Noor** MVP. This document is authoritative for when audio plays, how controls behave, and how playback interacts with system audio and interruptions.

## Audio Architecture: Independent Voice Systems

| System | Purpose | Controlled by **🔊 صوت نور**? |
|---|---|---|
| **Narrator Voice** | Host-provided professional narration of the current story page after an eligible Retry | **No — always available** |
| **Noor Voice** | Optional short TTS guidance, instructions, encouragement, and completion feedback | **Yes** |

The narrator is a core educational/business capability. Turning **🔊 صوت نور** OFF must mute only Noor's optional TTS; it must never disable, suppress, or alter narrator playback or the Retry learning path.

**Hard rule (MVP):** Narrator plays **ONLY** on the **Retry** path **after** the child’s **first completed attempt** on that page (first **recording stop** → upload → evaluation yielding **Retry** outcome). **No autoplay** before the child reads. **No** narrator on **Idle**, **Success**, **first Recording**, catalog, or Story Details.

**References:** `00_Project_Principles.md` §3a, `05_User_Journey.md`, `11_Message_Library.md` (`narrator.*`), `12_AI_Evaluation_Flow.md` (**Narrator** state), `Recording UX Specification.md`, `Recovery Flows.md`, `07_Acceptance_Criteria.md` (**AC-05-01**).

---

# Scope Boundaries

| In scope (MVP) | Out of scope (MVP) |
|----------------|---------------------|
| Prerecorded page narrator from `narratorAudioUrl` | TTS of page text |
| Playback after **Retry** outcome | Playback after **Failure** codes (unless failure was preceded by Retry — N/A) |
| Single full-page audio asset | Word-level karaoke highlight |
| Pause/resume on interruption | Child recording playback review |
| Ducking Noory background music | Spatial / 3D audio |

---

# When Playback Starts (Decision Tree)

```
Page shown (Idle)
  └─ Child taps Start Reading → Recording → Done → Upload/Process
        ├─ Outcome Success → NO narrator → Next page Idle
        └─ Outcome Retry → Show retry.* → cue narrator.* → PLAYBACK → cta.retry
```

**Guard conditions (all must pass):**

1. `pageRetryCounts[pageId]` incremented for this **Retry** outcome (not merely a transport failure).
2. `narratorAudioUrl` present and non-empty.
3. Not the child’s first attempt before any upload on this page (first attempt cannot trigger playback even if client bug sends early Retry UI).

---

# Playback State Machine

| Phase | Enum | Child-visible |
|-------|------|----------------|
| Pre-roll | `retry` | Noor shows `narrator.01` / `narrator.02` (1–3s) |
| Playing | `narrator` | Listening together visual; optional speaker icon |
| Post-roll | `retry` → handoff | `cta.retry` enabled |
| Interrupted | `narrator` paused | Static «متوقف مؤقتًا» (implementation string in `11` extension or reuse `loading.02`) |
| Skipped | — | **Not MVP** — no skip button |

Transitions:

- `retry` + `narrator_start` → `narrator` playing
- `narrator` + `complete` → `retry` ready + **Re-record** emphasis
- `narrator` + `interrupt` → paused → user returns → `resume` or `restart` (see Interruption)
- `narrator` + `error` → `retry` with `network.02`; **Re-record** still allowed

---

# Screen: Narrator Playback (In-Session)

## Purpose

Let the child hear correct page narration once per **Retry** outcome before attempting again.

## Components

| Component | Behavior |
|-----------|----------|
| Story page | Visible; text not hidden |
| Noor | «Listening together» pose; minimal motion |
| Pre-roll bubble | `narrator.01`, then `narrator.02` |
| Audio engine | Streams or plays cached file |
| Progress | Optional thin bar without time numbers (reduce anxiety) |
| Primary CTA | `cta.retry` disabled until playback completes OR recoverable interrupt |
| Secondary | None MVP |

## States

- **Playing — active:** Audio audible on media channel.
- **Playing — paused:** OS interrupt or route change.
- **Playing — completed:** End of file; short haptic success.
- **Playing — error:** Decode/network for URL; fail open to **Re-record**.

## Loading

- Resolve URL: if >1s, show `loading.01` in Noor bubble; max wait 10s then error path.
- Cached offline file: start within 300ms.

## Empty

- Missing URL: skip playback segment; show `retry.02`; enable `cta.retry` immediately; log `narrator_missing`.

## Error

- HTTP 404 / corrupt file: `network.02`; enable **Re-record**; do not block retry loop.

## Accessibility

- Pre-announce `narrator.02` text (includes instruction to listen then tap Retry).
- If visual progress bar: `accessibilityValue` = «جاري التشغيل» without seconds.
- Respect platform media accessibility APIs.

## Animations

- Gentle sound wave on Noor or page footer; stop when paused.
- Reduce Motion: static icon only.

## Voice

- **Narrator track:** prerecorded human or studio narrator (host content).
- **Noor TTS:** pre/post cues only (`narrator.*`), not full page during play.

## Business Rules

- Max one concurrent narrator stream.
- Do not record mic during playback.
- Volume: use media volume; respect silent switch per platform policy (iOS: honor silent unless host category `playback` — **Confirmed:** use `playback` category so child hears in silent mode when headphones connected; without headphones follow Noory global policy).
- After third **Retry** on page, playback still runs for third Retry unless **Continue** UI supersedes (`EC-11`).

## Acceptance Criteria

- **AC-AUD-01:** Given **Idle** first visit to page, narrator never autoplays.
- **AC-AUD-02:** Given **Retry** outcome, narrator plays after `retry.*` message.
- **AC-AUD-03:** Given playback complete, `cta.retry` enabled.
- **AC-AUD-04:** Given **Success** outcome, narrator does not play.

## Edge Cases

- Child taps **Retry** before playback ends: stop audio; enter **Recording** (**Re-record**).
- Second **Retry** on same page: full playback repeats (no “only once per page” cap).

---

# Playback Controls (MVP)

| Control | MVP | Notes |
|---------|-----|-------|
| Play | Auto after pre-roll | No separate play button |
| Pause | System-only | Incoming call, background |
| Resume | Auto on foreground if paused <5min | Else **Idle** + tap **Retry** to replay |
| Stop | Implicit on complete | |
| Seek/scrub | No | |
| Speed | No | |
| Skip | No | Encourages full listen |

**Child-initiated stop:** Only by leaving session (host back) or tapping `cta.retry` (cancels remainder).

---

# Ducking & Mixing

## Noory Background Music

- When narrator starts: duck BGM to **20%** of baseline over 300ms.
- When narrator ends: restore BGM over 500ms.
- If BGM disabled in host settings: no change.

## Other App Audio

- Do not stop third-party audio; duck narrator if host policy requires sidechain — **MVP default:** narrator takes focus (Android `AUDIOFOCUS_GAIN_TRANSIENT`; iOS interrupt other audio politely).

## Recording Exclusivity

- Mic capture MUST NOT overlap narrator. State machine enforces mutual exclusion.

---

# Headphones & Audio Routes

| Route | Behavior |
|-------|----------|
| Wired headphones | Route narrator to headphones; show small headphone icon optional |
| Bluetooth A2DP | Same; handle delay 100–300ms pre-roll extension optional |
| Speaker | Default; remind parent in onboarding (host) about quiet environments |
| Unplug during play | Pause immediately; show «أعد توصيل السماعات أو اضغط للمتابعة» (host key) — tap resumes on speaker if parent confirms |
| Bluetooth disconnect | Pause; same as unplug |

**Acceptance Criteria**

- **AC-AUD-HP-01:** Unplug mid-playback pauses within 500ms.

---

# Interruption Handling (Playback-Specific)

| Event | Action | Recovery navigation |
|-------|--------|---------------------|
| Phone call | Pause | Resume or restart per `Recovery Flows.md` RF-CALL |
| App background | Pause | Foreground resume if <5min |
| Alarm / Siri | Pause | User returns to app |
| Second Retry UI stacked | Impossible | Debounce outcomes |
| Airplane mode mid-stream (URL stream) | Stop; error | **Re-record** without replay unless cached |

---

# Synchronization with UI States

Engineering enum `narrator` must align with UX **Playback** in `Recording UX Specification.md`.

Sequence timing:

1. Enter **Retry** UI (0ms).
2. Display `retry.*` (500–1500ms).
3. Display `narrator.01` (1000ms).
4. Start audio (do not overlap Noor speech — wait for bubble dismiss or 1.5s max).
5. On complete: enable `cta.retry`; optional short `retry.03`.

**No overlap rule:** Noor spoken cues finish before narrator audio starts (prevent dual-audio confusion for ages 3–8).

---

# Content & Caching

- Source: `narratorAudioUrl` from host (`EA-03`).
- Format: AAC/MP3 per `15` allowed MIME; client validates before play.
- Offline: use cached file if Details prefetch completed (`Book Library Flow.md`).
- Prefetch next page narrator **not** played until that page’s Retry — prefetch only for latency.

---

# Analytics (Reference)

Fire when implementing per `15`:

- `narrator_playback_started` — `{ storyId, pageId, pageIndex, attemptSequence }`
- `narrator_playback_completed`
- `narrator_playback_interrupted` — `{ reason: call | background | route_change | error }`

Do not expose analytics to child.

---

# Forbidden Patterns (QA Negative Tests)

1. Autoplay narrator on page open.
2. Autoplay after **Success**.
3. Narrator before first **Done** on page.
4. Play narrator while mic recording active.
5. English UI during playback errors.
6. Skip button visible.

---

# Related Documents

| Topic | Document |
|-------|----------|
| Retry UX | `Recording UX Specification.md` |
| Recovery | `Recovery Flows.md` |
| Copy keys | `11_Message_Library.md` |
| Outcomes | `12_AI_Evaluation_Flow.md` |

---

# Revision History

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-07-27 | Initial narrator-only playback spec |
