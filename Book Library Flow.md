# Book Library Flow

**Version:** 1.0  
**Status:** Production-ready (MVP)  
**Audience:** Product, Design, Flutter/host engineering, QA  
**Locale:** Child UI Arabic RTL · Documentation English  

---

# Document Purpose

Specify screens and interactions from **story discovery** through **Read with Noor** entry for children **3–8**. Content APIs and catalog ownership sit in the **Noory host app** (`14_Assumptions.md` EA-03); Reading Buddy owns **Read with Noor** session UX once entered.

**References:** `01_Product_Brief.md`, `05_User_Journey.md`, `09_UI_UX_Guidelines.md`, `11_Message_Library.md`, `07_Acceptance_Criteria.md` (AC-01), `Recording UX Specification.md`, `Recovery Flows.md`.

---

# Flow Overview

```
[Story / Library Catalog] → [Story Details] → (consent SP-01) → [Read with Noor → Reading Session / Idle]
         ↑                           │
         └──── read another story ───┘ (from Reading Summary)
```

---

# Global Navigation Rules

| From | Action | To | Notes |
|------|--------|-----|-------|
| Catalog | Tap story card | Story Details | Push (RTL: enter from start edge) |
| Story Details | Back | Catalog | Preserve scroll position where possible |
| Story Details | **Read with Noor** | Reading Session | After consent gate |
| Reading Session | Host back / exit | Story Details or Catalog | Persist Session Store (`EC-06`) |
| Reading Summary | `cta.read_another_story` | Catalog | Clear or archive session per policy |

**Deep links:** Host may open Story Details directly; **Read with Noor** still requires consent check.

**RTL:** All screens `direction: rtl`; grid reads right-to-left, top-to-bottom; chevrons mirrored.

---

# Screen: Story / Library Catalog

## Purpose

Let the child browse available Arabic stories and pick one to open. Primary entry to the reading ecosystem.

## Components

| Component | Description |
|-----------|-------------|
| Screen title | Host catalog title (Arabic), e.g. «القصص» |
| Story grid / list | Cover art, title, optional age band badge (host) |
| Category chips | Optional host filters (not required MVP for Reading Buddy) |
| Empty state panel | When no stories available |
| Offline badge | On cards with fully cached content (see Offline) |
| Host tab bar | If applicable; Reading Buddy does not own tabs |

## States

- **Catalog — loading:** Skeleton cards (3–6 placeholders).
- **Catalog — populated:** Interactive cards.
- **Catalog — empty:** Empty state UX (below).
- **Catalog — offline-degraded:** Show cached subset + banner.
- **Catalog — error:** Host error with retry (host strings).

## Loading

- Skeleton shimmer ≤2s; if longer, show `loading.01`-style host equivalent (Arabic).
- Pull-to-refresh if host supports (optional MVP).

## Empty

**Scenario:** No stories assigned to profile or catalog API returned zero.

- Illustration: friendly empty shelf (Noory illustration system).
- Headline (Arabic, host copy): e.g. «لا توجد قصص بعد».
- Subline: «سنعود بقصص جديدة قريبًا» (or host CMS).
- Primary CTA: none for child — optional «تحديث» for parent-gated refresh.
- Noor optional corner cameo: `welcome.03` only if Reading Buddy module embedded on catalog (host decision).

**Business rule:** Do not show **Read with Noor** on catalog — entry is always via Story Details.

## Error

- Network fail loading catalog: host retry banner; cached list if available.
- Partial load: show successful cards; inline «تعذر تحميل بعض القصص» on failed rows.

## Accessibility

- Each card: label = «{title}، قصة» + offline if cached.
- Grid: logical RTL traversal order.
- Minimum touch target on entire card ≥48dp.

## Animations

- Card press: scale 0.98; release navigate.
- No auto-scrolling carousel without user control (motion sensitivity).

## Voice

- No TTS of entire catalog.
- Optional single Noor welcome on first app open of day (host).

## Business Rules

- Stories displayed must include `storyId`, cover URL, title, page count metadata for Reading Summary.
- Cached stories remain tappable offline if payload complete (pages + narrator URLs + text).
- Reading Buddy does not implement catalog CMS.

## Acceptance Criteria

- **AC-LIB-CAT-01:** Given stories exist, when catalog loads, then at least one card is tappable and opens Story Details.
- **AC-LIB-CAT-02:** Given zero stories, when catalog loads, then empty state shows without crash.
- **AC-LIB-CAT-03:** Given offline with cache, when catalog opens, then cached stories visible with offline indicator.

## Edge Cases

- Stale cache vs server: prefer fresh metadata when online; merge by `storyId`.
- Very long titles: ellipsis at 2 lines; full title on Details.
- Child rapid taps multiple cards: single navigation (debounce).

---

# Screen: Story Details

## Purpose

Present one story’s cover, description, and metadata; primary gateway to **Read with Noor** (`cta.read_with_noor`).

## Components

| Component | Description |
|-----------|-------------|
| Hero cover | Large cover art, top or start-aligned (RTL) |
| Title & description | Arabic; description max 4 lines collapsed |
| Meta row | Page count, estimated read time (host), age band |
| Primary CTA | `cta.read_with_noor` — prominent, sticky bottom |
| Secondary | Favorite/share — host scope (optional) |
| Back control | RTL-mirrored chevron to Catalog |
| Offline pill | «متاح بدون اتصال» if fully cached |

## States

- **Details — loading:** Skeleton hero + CTA disabled.
- **Details — ready online:** CTA enabled if consent OK.
- **Details — ready offline cached:** CTA enabled if story package local.
- **Details — ready offline not cached:** CTA disabled + `network.01`.
- **Details — consent pending:** CTA opens parent consent (SP-01).
- **Details — resume session:** If Session Store matches `storyId` and incomplete, show «متابعة القراءة» (host key) → resume page index.

## Loading

- Skeleton until `storyId` payload loaded.
- Prefetch narrator assets for page 1 after Details load (background, no child spinner) — optional optimization.

## Empty

- Missing story (404): friendly «لم نجد هذه القصة» + back to Catalog.
- Missing pages array: block **Read with Noor**; log content defect.

## Error

- Load fail: `network.01` + retry button (host).
- Consent denied: block with parent-facing explanation (host); child sees simplified «نحتاج موافقة ولي الأمر» (host).

## Accessibility

- Screen title = story title.
- **Read with Noor** button: exact `cta.read_with_noor` Arabic label.
- Description readable by screen reader in full (expand if truncated visually).

## Animations

- Cover parallax on scroll (optional); disable with Reduce Motion.
- CTA entrance: slide up once when content ready.

## Voice

- On first Details view in session: optional `welcome.02` in Noor chip (host overlay) — not required MVP.

## Business Rules

- **Read with Noor** MUST NOT start without SP-01 consent (`AC-01-02`).
- Passing to Reading Session: `storyId`, `totalPages`, page content, `narratorAudioUrl` per page, `clientSessionId` new or resumed.
- **Noor never reads story text on Details screen** (no preview narration MVP).

## Acceptance Criteria

- **AC-LIB-DET-01:** Given consent satisfied, when child taps `cta.read_with_noor`, then Reading Session opens with `welcome.*` (`AC-01-01`).
- **AC-LIB-DET-02:** Given consent not satisfied, when tap CTA, then consent flow — no session.
- **AC-LIB-DET-03:** Given offline uncached story, when tap CTA, then blocked with network message.

## Edge Cases

- **EC-12:** Consent revoked while on Details — disable CTA until re-approved.
- Resume vs start over: if session exists, host modal «متابعة من الصفحة {n}» vs «من البداية» (host copy); default continue.

---

# Screen: Entry to Read with Noor (Reading Session Bootstrap)

## Purpose

Transition from Story Details into first **Reading Session** page (**Idle**). Not a separate long-lived screen — a controlled bootstrap sequence.

## Components

- Full-screen RTL reader chrome (see `Recording UX Specification.md`).
- Noor welcome: `welcome.01` (or rotated `welcome.*`).
- Page 1 content visible before **Start Reading**.
- Progress «الصفحة 1 من {Y}».
- Optional one-time session tips: `before.03` (first session only — flag in Session Store).

## States

- **Bootstrap — initializing:** Load page 1 assets (<1s target).
- **Bootstrap — ready Idle:** Show `cta.start_reading`.
- **Bootstrap — failed content:** Return to Details with error.

## Loading

- If page 1 not cached and offline: fail back to Details (`network.01`).
- Spinner only if >800ms; else paint content immediately.

## Empty

- Invalid page 1 text: abort session; host error.

## Error

- Mic pre-check not run here (runs at **Permission Request** on **Start Reading**).

## Accessibility

- On enter, announce «بدء القراءة مع نور» + story title.

## Animations

- Soft fade from Details hero to reader (300ms).

## Voice

- `welcome.*` once; no page narration.

## Business Rules

- First page follows **child tries first** — no autoplay narrator on bootstrap.
- Analytics: `reading_session_started` with `storyId`, `totalPages`.

## Acceptance Criteria

- **AC-LIB-ENTRY-01:** Matches **AC-01-01** RTL layout.
- **AC-LIB-ENTRY-02:** No narrator audio on entry.

## Edge Cases

- Kill app during bootstrap: relaunch → Details or resume per Session Store (`Recovery Flows.md` RF-KILL).

---

# Offline & Cached Stories

## Purpose

Degrade gracefully when connectivity is poor while keeping reading possible for **cached** content.

## Behavior Matrix

| Capability | Online | Offline (cached story) | Offline (not cached) |
|------------|--------|-------------------------|----------------------|
| Browse catalog | Full | Cached titles only | Cached titles only |
| Story Details | Full | Full for cached | Block or skeleton |
| **Read with Noor** | Yes | Yes | No |
| Upload / evaluate | Yes | Queued/fails → `network.01` | Same |
| Narrator playback | Stream or cache | Local file if prefetched | Local if cached |

## Cache Requirements (Host)

For offline **Read with Noor**, cache per story:

- All page Arabic text and illustrations.
- `narratorAudioUrl` assets (or bundled equivalents).
- Metadata: `storyId`, page ids, order.

## UX Indicators

- Catalog card: small cloud-off icon «متاح بدون اتصال».
- Details: offline pill.
- During session offline: after **Done**, show `network.01`; remain **Idle** with Session Store (`EC-01`).

## Acceptance Criteria

- **AC-LIB-OFF-01:** Cached story can open Reading Session offline.
- **AC-LIB-OFF-02:** Evaluation requires network; child sees friendly Arabic, not retry loop spam.

---

# RTL Layout Specification (Catalog & Details)

| Element | RTL rule |
|---------|----------|
| Screen flow | Push/pop animations mirror (iOS/Android per Noory) |
| Story grid | Item 1 at top-start (upper right in RTL) |
| Back button | Top-start corner |
| Primary CTA | Bottom full-width; label centered |
| Text alignment | Title/description `text-align: start` (right in RTL) |
| Icons | Directional icons flipped |

---

# Integration Contract (Host → Reading Buddy)

Minimum payload when opening **Read with Noor**:

```json
{
  "storyId": "string",
  "title": "Arabic string",
  "totalPages": 12,
  "pages": [
    {
      "pageId": "string",
      "pageIndex": 0,
      "text": "Arabic UTF-8",
      "imageUrl": "https://...",
      "narratorAudioUrl": "https://..."
    }
  ],
  "consentGranted": true,
  "childProfileId": "string",
  "locale": "ar"
}
```

Reading Buddy returns on exit: updated Session Store for resume (`currentPageIndex`, retry maps, `continuedWithoutSuccessPageIds`).

---

# Related Documents

| Topic | Document |
|-------|----------|
| Recording states | `Recording UX Specification.md` |
| Network recovery | `Recovery Flows.md` |
| Narrator | `Audio Playback Flow.md` |
| Consent | `14_Assumptions.md` SP-01 |

---

# Revision History

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-07-27 | Initial library → Read with Noor flow |
