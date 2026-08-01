# GitHub readiness report

Date: 2026-07-31

## Status

**READY FOR GITHUB WITH LIMITATIONS**

The repository is safe to stage for GitHub: no child recordings, calibration audio, evaluation audio, local reports, local paths, environment files, virtual environments, or source PDFs are included by Git's candidate-file list. This report records the pre-release audit; release status is recorded by Git history.

## Runtime review

- Story and word evaluation remains isolated in `evaluateChildReading` / `evaluateReading`; tests cover exact reading, partial reading, empty transcript, retries, and teacher-score boundary behaviour.
- The isolated-letter evaluator is separate and conservative. The `baa` book is fully available: word pages use normal reading-content evaluation, while only isolated short-vowel pages use the experimental flow. Their third unsuccessful attempt is `needs-practice`, `passed: false`, with continuation only.
- `RecordingController` owns one microphone stream; `startRecording` guards against a second recorder and `stopRecording` uses a stop lock.
- Narrator playback is a separate service. It receives the exact current-page URL only after a non-success result; it is not supplied to transcript alignment, scoring, glow, or rewards.
- Interactive Nouri voice code and its unused prompt/TTS files were removed. `NOURI_ENABLED = false` remains documented as the deliberate deferred-scope flag; Noor stays only as on-screen guidance.
- Session rewards are derived from unique confirmed successful page IDs: 1 star and 5 coins per page. Retry, skip, narrator playback, uncertain, and needs-practice do not award rewards.

## Git hygiene

Verified ignored by `.gitignore`:

- `.env`, `node_modules/`, `.venv*/`, `venv/`, `env/`, `.tools/`, `__pycache__/`.
- `data/evaluation/`, `data/letter-calibration/`, recordings and temporary audio containers.
- Private pilot/teacher reports and human-review playback script.
- Supplied raw material and source PDFs.
- Common local ML-model formats: `.onnx`, `.pt`, `.pth`, `.safetensors`.

The Git candidate set contains the required runtime WebP/MP3 assets only. The 3 visible books contain 47 configured pages; the reading books (`mosque`, `girl`) contain 38 pages and the asset audit found 0 missing page images or narrator files.

## Security and privacy scan

- No API key, bearer credential, private-key marker, or absolute user-local path was found in the Git candidate source set.
- `.env.example` contains no values or tokens.
- Historical architecture documents may mention placeholder authentication concepts, but contain no credential values and are not loaded by the app.

## Validation run

| Check | Result |
| --- | --- |
| `npm.cmd run check` | PASS |
| `npm.cmd test` | PASS — 47 tests, 0 failures |
| `npm.cmd run build` | PASS — static POC syntax/build verification |
| `npm.cmd start` README smoke test | PASS — `http://localhost:4173/` returned HTTP 200 |
| `git diff --check` | PASS |
| Visible-book asset audit | PARTIAL — 3 books, 49 pages; page 29 of `girl` requires the missing narrator file `33.mp3` |

### Test-count reconciliation

Earlier working notes recorded 42 tests before the removed Nouri voice-feedback
test was deleted, then 41 tests after that removal. The current suite contains
47 tests because `tests/books.test.js` adds six Baa-book configuration and
safe-practice checks. The current command in `package.json` is authoritative.

## Remaining limitations

- This is a browser-STT content-reading POC, not a validated Arabic pronunciation or fluency assessment.
- Isolated letter-sound vowel assessment remains experimental; it never blocks book completion or awards an unverified success.
- Manual Chrome/Edge microphone and mobile-viewport sign-off remains a release QA task; it is not a GitHub hygiene blocker.
