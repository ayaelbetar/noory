# Read with Noory — Interactive Reading Buddy

Browser proof of concept for Arabic, RTL reading practice for children aged 3–8. A child reads a story page aloud, receives Success or Retry, hears the exact page narrated after Retry, and finishes with a book-level reading summary.

## Overview

Read with Noor makes read-aloud practice supportive rather than exam-like. Noor encourages the child, while narrator help appears only after a genuine Retry. The POC uses browser recording and local Arabic text comparison; it does not connect to a hosted AI evaluation service.

## Demo

No hosted demo URL is currently configured. Run locally with the commands below. The repository includes all POC images, story covers, and page illustrations. Professional narrator audio is not included, so the narrator falls back to browser Arabic speech synthesis.

## Core Features

- Arabic RTL library, story details, reading session, and Reading Summary.
- Meet Noor on every entry; optional first-visit child name and editable feature settings.
- Optional Noor voice feedback; turning it off never disables narrator playback.
- Browser microphone recording, audio-level indicator, and optional Arabic Web Speech transcript.
- Local Arabic normalisation with a `0.70` Success/Retry threshold.
- Exact-page narrator after Retry, Continue after three genuine Retry outcomes, and final score.
- Parent-consent POC gate, local session resume, and technical failures that never increment Retry.
- Client guards for offline recovery, duplicate actions, 120-second recording, 8 MB validation, and 40 evaluations per session.

## Child Flow

```text
Home → Read with Noor → Meet Noor → Book Library → Story Details
     → Parent consent → Read aloud → Record → Evaluate
     → Success → Next Page
     → Retry → Exact-page narrator → Record again
     → Three Retry outcomes → Continue → Reading Summary
```

## Product Decisions

- The child tries before getting narrator help.
- The child sees Success or encouraging Retry, never AI/HTTP/technical language.
- Narrator is educational support and remains independent from **صوت نور**.
- The child name is optional and used selectively.
- Evaluation happens once after Done, which preserves focus and bounds future provider cost.

## Tech Stack

- Plain HTML, CSS, and JavaScript modules.
- Node.js built-in HTTP server for local static serving.
- Browser `MediaRecorder`, `getUserMedia`, Web Audio API, optional Web Speech recognition, and `speechSynthesis`.
- Node.js built-in test runner (`node --test`).

## Project Structure

```text
assets/                       Child-facing illustrations and story covers
src/
  app-v2.js                   Active application shell and session flow
  core/messages.js            Arabic copy and interpolation helper
  data/books.js               Demo story data
  features/                   Recording, evaluation, audio, analytics, guards
tests/                        Node unit tests
Read_with_Noor_MVP_PRD.md     MVP requirements
PRODUCT_MANAGER_ASSESSMENT.md Product assessment and implementation evidence
CODE_REVIEW_AND_GITHUB_READINESS.md
                              GitHub-readiness review and remaining actions
```

## Getting Started

Prerequisite: Node.js 18 or later.

```bash
git clone <repository-url>
cd <project-directory>
npm install
npm start
```

Open [http://localhost:4173](http://localhost:4173). The project has no third-party runtime dependencies today. If PowerShell blocks `npm.ps1`, use `npm.cmd start` and `npm.cmd test`.

Microphone capture requires `localhost` or HTTPS. Arabic speech recognition and browser TTS depend on browser/OS support; Chrome or Edge are the intended local POC targets.

## Environment Variables

The POC has no required environment variables and no API keys. `.env.example` only reserves future server-side integration values; the static client does not read them.

| Variable | Required now | Purpose | Example |
| --- | --- | --- | --- |
| `API_BASE_URL` | No | Future hosted evaluation API | `http://localhost:3000` |
| `ENABLE_MOCK_EVALUATION` | No | Future host mock switch | `true` |
| `STT_API_KEY` | No | Server-side provider key only | `replace_with_your_key` |

Never put real keys in browser code, documentation, or `.env.example`. `.env` is ignored by Git.

## Running in Mock Mode

The POC already runs with no external service. Browser STT, when available, creates a transcript that is normalised and compared locally with expected page text. A score of at least `0.70` is Success; otherwise the local evaluator returns Retry.

For deterministic verification, use the unit tests rather than browser STT.

## Testing the Core Flow

```bash
npm test
```

Tests cover Arabic normalization, Success/Retry mapping, Continue after three retries, narration source/fallback, feedback, Noor voice sequencing, and recording/session guards.

Manual browser checks: Success, Retry+narrator, Continue, final score, microphone denial, offline processing, and the Noor voice toggle. See the PRD and QA Strategy for full acceptance coverage.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Starts the local static server at `http://localhost:4173`. |
| `npm run check` | Runs JavaScript syntax checks for all active runtime modules. |
| `npm test` | Runs the Node unit tests. |

No formatter, linter, type checker, or build script is configured. This static POC has no bundling stage; syntax checks and test results are recorded in the readiness report.

## Architecture

- `src/app-v2.js`: UI rendering and POC session state.
- `src/features/recording`: microphone lifecycle, level metering, optional browser STT.
- `src/features/reading`: Arabic evaluator, feedback mapping, and edge-case guards.
- `src/features/playback`: narrator and optional Noor voice services.
- `src/features/analytics`: local in-memory/console POC events.
- `localStorage`: POC name, voice preference, consent, and session checkpoint only.

## Assessment Coverage

- [MVP PRD](Read_with_Noor_MVP_PRD.md)
- [Product Manager Assessment](PRODUCT_MANAGER_ASSESSMENT.md)
- [GitHub Readiness Review](CODE_REVIEW_AND_GITHUB_READINESS.md)
- [QA Strategy](QA%20Test%20Strategy.md)

## Privacy and Safety

- The POC does not send recordings, transcripts, names, or analytics to a server.
- Temporary recording URLs are released when attempts are reset or abandoned.
- Local consent is a POC gate, not a production legal-consent system.
- Production requires approved consent, secure upload, retention/deletion, and analytics-minimisation controls.

## Known Limitations

- Local transcript similarity is not production audio/AI evaluation.
- Browser STT/TTS and microphone behavior vary across devices.
- No hosted API, authentication, persistent analytics, professional narrator pack, or device E2E suite is included.
- Real HTTP 408/413 and provider-confidence paths require backend contract tests.

## Future Improvements

- Secure hosted evaluator and server-side policy enforcement.
- Production consent and audio-retention controls.
- Professional narrator assets, teacher calibration, persistent analytics, and mobile E2E automation.

## License

License not yet specified.
