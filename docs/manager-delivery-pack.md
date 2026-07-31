# Noory manager delivery pack

**Full delivery index:** [`docs/DELIVERY_INDEX.md`](DELIVERY_INDEX.md)

## Delivery status

The submitted POC is the current implementation truth. Its active entry is
`index.html` → `src/app-v2.js`; its delivery documentation is `README.md` and
the public files in `docs/`.

The repository also retains a frozen specification package at the root. Those
documents describe the 2026-07-28 planning baseline and must not override the
implemented POC where the two differ. See [`docs/POC_SCOPE_ADDENDUM.md`](POC_SCOPE_ADDENDUM.md).

## Submitted scope

- Three visible books and 47 active pages.
- `حرف الباء` is available end to end: six word pages use normal
  reading-content evaluation, while only three isolated short-vowel pages use
  conservative experimental safe practice.
- A non-confirmed isolated letter never passes, glows, or earns rewards; the
  child can continue after the third unsuccessful attempt.
- Professional narrator audio plays for the exact page after Try Again.
- Session rewards use unique successful page IDs: one star and five coins per
  confirmed successful page.
- Story, word, and sentence pages use the submitted POC rule: normalized score
  **> 0.60** plus word completion **>= 80%**. The frozen root specification's
  historical 0.70 references do not override this implemented rule.
- Interactive Nouri voice is deliberately disabled (`NOURI_ENABLED=false`).
  It remains a future enhancement requiring Arabic pronunciation review,
  timing validation, development time, and operating cost.

## Verification

- `npm.cmd run check` validates the active JavaScript modules.
- `npm.cmd test` currently runs 47 passing Node tests.
- `npm.cmd run build` runs the configured static syntax/build verification.
- Local development URL: `http://localhost:4173` after `npm.cmd start`.

## Document map

| Need | Current source |
| --- | --- |
| Ordered manager reading list | `docs/DELIVERY_INDEX.md` |
| Runtime scope, setup, limitations | `README.md` |
| Product requirements | `Read_with_Noor_MVP_PRD.md` |
| POC vs PRD deviations | `docs/POC_SCOPE_ADDENDUM.md` |
| Executive PM assessment | `docs/product-manager-delivery-summary.md` |
| POC product rationale | `docs/poc-write-up.md` |
| Release/readiness audit | `docs/github-readiness-report.md` |
| Requirement-by-requirement implementation audit | `docs/task-compliance-report.md` |
| Leadership one-pager | `99_Product_Bible.md` |
| Manager handoff | This document |
| Frozen 2026-07-28 specifications | Root markdown package, starting at `00_Index.md` |

## Privacy

Child recordings, calibration data, downloaded evaluation material, review
notes, credentials, and local environment files are not part of the submitted
repository and are excluded by `.gitignore`. The static POC does not upload or
persist MediaRecorder blobs, but browser SpeechRecognition may use a browser
or operating-system online recognition service; it is not configured for
local-only recognition.
