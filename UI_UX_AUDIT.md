# Read with Noor — UI/UX Audit

Audit date: 2026-07-29  
Scope: Read with Noor POC; child (3–8) and parent/guardian journeys.  
Method: local running application review at mobile and desktop widths, source/style inspection, and automated test suite. This audit preserves all current product flows and business rules.

## Executive Summary

Overall quality: **good mobile-first POC, with safe incremental refinements applied.** The strongest part is the warm, child-focused reading loop: the primary CTA, immediate feedback, narrator assistance after a Retry, and gentle visual identity are consistent across the live mobile screens reviewed.

The largest UX risk is that live Success, Retry, narrator playback, recovery after an interrupted app, and a real microphone recording require verification on real Android and iOS hardware. Headless Chrome correctly exposed the microphone-permission recovery state, but cannot validate audio capture or operating-system interruptions.

Readiness level: **ready for a controlled POC review; not yet ready to claim production accessibility or device-recovery sign-off.** No core feature, screen, flow, content, animation, or business rule was removed.

## Verification Scope

### Visually inspected in the running application

| Viewport | Screens/states reviewed | Result |
| --- | --- | --- |
| 320 × 700 | Home responsive composition | No document-level horizontal overflow; category rail is intentionally horizontally scrollable. |
| 390 × 844 | Home, Meet Noor/name/consent, Book Library, Book Details, Reading idle, microphone denial recovery | Primary actions visible; no clipped primary CTA in inspected states. |
| 430 × 932 | Home responsive capture | Mobile layout remains single-column. |
| 1440 × 900 | Home desktop capture | Application remains intentionally centered/mobile-width; no overlap observed. |

### Verified from code and tests; still needs real-device validation

Recording, processing, Success, Retry, narrator playback, Continue after three genuine Retries, timeout/network recovery, background/kill/call recovery, and the final summary. Headless Chrome has no usable microphone, so live audio journeys were not fabricated for this audit.

## Screen-by-Screen Audit

| Screen or state | Finding | Severity | Recommendation | Implementation status |
| --- | --- | --- | --- | --- |
| Home / Discover | Clear Read with Noor feature card and strong visual identity. | Low | Keep the feature card as the visual primary entry. | Not applicable |
| Home at 320 px | The category rail crops items by design but the document itself does not horizontally scroll. | Low | Retain the rail; validate swipe affordance with children. | Documented only |
| Meet Noor | Welcome hierarchy, two bottom actions, optional name, voice toggle, and consent were visually clear. | Low | Keep consent text parent-facing; test it with a guardian for comprehension. | Not applicable |
| Optional child name | Optional field, hint, and save path are clear in the inspected first-visit state. | Low | Test a 30-character Arabic name on a physical device. | Documented only |
| Feature settings | Name and Noor Voice are available through the existing settings route. | Low | Keep narrator and Noor Voice wording visibly distinct. | Not applicable |
| Book Library | Covers, level badges, and selected reading feature are easy to scan. | Low | Preserve two-column mobile cards; test with additional future titles. | Not applicable |
| Book Details | The reading CTA stays reachable at the bottom of the mobile viewport. | Low | Reduce unused vertical space only if future content needs it. | Documented only |
| Consent gate | Existing consent gate prevents session/evaluation until accepted. | Critical | Preserve this gate and validate against the API on integration builds. | Not applicable |
| Reading page — idle | Illustration fills the reading surface; page text, recording action, and CTA are visually distinct. | Medium | Continue real-device testing with long page text and all supplied illustrations. | Partially fixed |
| Recording state | Icon, timer, and Noor message are visually co-located; timer now has a high-contrast independent pill. | Medium | Verify microphone recording and timer accuracy on Android/iOS. | Partially fixed |
| Processing state | Existing thinking/message state prevents an apparently frozen transition. | Medium | Verify network delay and screen-reader announcement with a real service response. | Documented only |
| Success state | Existing celebration and next-page path remain unchanged. | Low | Confirm the animation remains non-blocking with a child test. | Documented only |
| Retry state | Narrator remains help after a real attempt; the retry UI is supportive rather than punitive. | Low | Test missing-word presentation with longer Arabic words. | Documented only |
| Narrator playback | Narrator is independent from Noor Voice by existing business rule. | High | Validate supplied professional audio and browser TTS fallback on real devices. | Documented only |
| Continue after 3 Retry outcomes | Existing Continue decision remains supportive and preserved. | Medium | Verify technical failures never increment the Retry counter in integration. | Documented only |
| Technical failure/recovery | Headless visual review confirmed microphone denial returns a clear recovery message and CTA. | Medium | Manually validate offline, timeout, background, kill, and call cases. | Partially fixed |
| Reading Summary | Existing encouraging completion language avoids an academic grade tone. | Low | Test summary layout with maximum page count and large text settings. | Documented only |

## User-Flow Findings

| Journey | Finding | Status |
| --- | --- | --- |
| First-time | Visual path Home → Meet Noor → optional name/consent → Library → Details is coherent. | Verified visually through Details. |
| Success | Evaluation and next-page business flow is covered by existing unit tests; live microphone path requires device validation. | Partially verified. |
| Retry | Existing implementation plays narrator after genuine Retry and retains one clear retry action. | Unit-tested/code reviewed; real audio pending. |
| Repeated Retry | The evaluator test confirms Continue appears only on the third Retry outcome. | Verified by test. |
| Technical failure | Mic permission denial visual path reviewed; other failure codes mapped in session guards and message library. | Partially verified. |
| Returning user | Saved name, Noor Voice preference, consent, and session snapshot are present in source. | Code reviewed; persistence/recovery on hardware pending. |

No dead end, automatic navigation, or feature removal was introduced by this audit. Duplicate in-session messages had already been consolidated in prior work and were preserved as one child-facing message at a time.

## Accessibility Findings

### Verified fixes

| Finding | Improvement | Status |
| --- | --- | --- |
| Motion sensitivity | Added `prefers-reduced-motion` handling to suppress nonessential animation/transition duration. | Fixed |
| Dynamic reading feedback | Noor’s message bubble now has `role="status"`, polite live announcement, and atomic updates. | Fixed |
| Story-text contrast | Story text receives a light fill, dark outline, and shadow when placed over varied artwork. | Fixed |
| Overlay-text contrast | Retry hint and optional audio playback use high-contrast frosted cards over artwork. | Fixed |
| Icon accessibility | Interactive recording control keeps an Arabic `aria-label`; passive visual state is hidden from assistive technology. | Fixed |
| Touch controls | Primary controls and icon controls are approximately 44 px or larger in reviewed CSS. | Partially fixed |

### Remaining recommendations

- Test keyboard focus order and visible focus indicators in Chrome, Safari, and Firefox with a keyboard.
- Test 200% browser zoom and system text scaling on Android/iOS; no automated visual regression runner is configured.
- Test screen-reader wording with Arabic VoiceOver and TalkBack, particularly timer, processing, narrator start/end, and error recovery.
- Review color contrast with final production artwork because dynamic illustrations can vary.

## Responsive Findings

- 320 px: no document horizontal overflow measured (`scrollWidth === clientWidth === 320`). The category rail remains intentionally scrollable.
- 390 px: all visually inspected primary CTAs remained reachable; the Meet Noor bottom actions fit in the viewport.
- 430 px: single-column mobile composition retained.
- 1440 px: content remains centered in the product’s mobile-width shell; this is coherent for a mobile-first POC but leaves substantial desktop whitespace.
- Small-height phones: existing compact rules reduce session spacing. Real landscape and on-screen keyboard behavior still require device testing.

## Design-System Inventory

The existing product identity was retained; no new design system or dependency was introduced.

| Area | Existing pattern |
| --- | --- |
| Color | Purple/pink primary gradients, soft lavender/paper backgrounds, yellow rewards, teal/mint accents. |
| Typography | Large bold Arabic headings, high-weight child-facing CTAs, readable rounded cards. |
| Spacing | 8/10/12/14/16/18/20 px rhythm, larger 28–32 px cards. |
| Radius | Pills for primary actions and controls; 20–30 px for cards and story surfaces. |
| Shadows | Soft purple shadows for cards; stronger elevation for primary CTAs. |
| Buttons | Primary pink–purple gradient; secondary white outlined control; icon buttons with accessible labels. |
| Feedback | Noor bubble, optional reward popup, supportive Retry/Narrator presentation, high-contrast recovery surfaces. |
| Breakpoints | 320/360 px compact rules, small-height rules, and mobile-shell handling above 520 px. |
| Motion | Small speaking/recording/celebration animations; reduced-motion override now supported. |

## Copy Review

No approved Arabic product message was rewritten in this audit. Existing child-facing copy remains short, supportive, and does not surface AI/STT/HTTP/confidence terminology. The current microphone recovery wording is clear enough for the POC and keeps the technical cause out of the child’s message.

## Before and After

| Previous issue | Change made | User benefit | Files affected |
| --- | --- | --- | --- |
| Story artwork could be obscured by a large purple text block. | Reading text is now directly over artwork with a high-contrast outline/shadow. | The child sees the illustration while reading. | `styles-v2.css` |
| Recording/message placement could shift between states. | Recording and feedback group uses phase-aware lower placement. | More predictable location for the child’s attention. | `styles-v2.css` |
| Timer could disappear against some illustrations. | Added an independent high-contrast timer pill. | Recording state remains unmistakable without changing the recording icon. | `styles-v2.css` |
| Some supplemental text sat directly on variable artwork. | Retry hint and audio playback use high-contrast frosted surfaces. | Better readability across stories. | `styles-v2.css` |
| Dynamic Noor feedback relied on the broad app live region. | Added a dedicated polite status role to the Noor bubble. | Clearer screen-reader updates. | `src/app-v2.js` |
| Motion was always enabled. | Added reduced-motion CSS override. | Better comfort for motion-sensitive users. | `styles-v2.css` |

## Remaining Risks and Required Inputs

1. **Real-device validation required:** microphone permission, live recording, narrator audio, Android/iOS background/kill/call recovery, keyboard behavior, and accessibility readers.
2. **Desktop product decision:** the app deliberately retains a narrow mobile shell on desktop. Confirm whether a wider desktop/tablet layout is a product goal before changing the composition.
3. **Artwork review:** contrast needs rechecking whenever a new illustration is added, even with the current text outline and frosted cards.
4. **Usability testing:** observe at least a few children aged 3–8 performing the first recording and Retry path; observe a guardian completing consent.

## Verification

- Local application started successfully at `http://localhost:4173/`.
- Visual captures reviewed for the viewports and states listed above.
- `npm run check`: passed.
- `npm test`: passed — 18 tests, 0 failures.
- No lint, type-check, or production-build scripts are defined in `package.json`; therefore those commands cannot be truthfully reported as passed.
- No existing feature, consent rule, reading outcome, narrator rule, scoring rule, retry rule, or recovery business rule was removed or changed.
