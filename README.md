# اقرأ مع نور — Noory Reading POC

Mobile-friendly Arabic reading practice for children. A child opens a book,
records a page, receives supportive content-reading feedback, and hears the
professional narrator for that exact page after **Try Again**.

Repository: [github.com/ayaelbetar/noory](https://github.com/ayaelbetar/noory)

## Included books

- **حرف الباء** — 9 active pages. The book is fully available: its word pages
  use normal reading-content evaluation and are rewarded on confirmed success.
  Only isolated **بَ / بِ / بُ** pages use safe experimental letter practice.
- **ماذا يوجد في المسجد؟** — 10 reading pages.
- **الطفلة التي لم تتوقف عن البكاء** — 28 reading pages.

The active catalog has 3 books and 47 pages. All active pages use local,
repository-relative images and professional narrator audio.

## Child flow

1. Select a book and open its first page.
2. Read the displayed text and record using the microphone.
3. Receive Success or Try Again from the reading-content evaluator.
4. After Try Again, hear the professional narrator audio for that exact page.
5. Retry, continue page by page, and reach a final score.

Confirmed words can glow while reading. Narrator playback and Nouri do not
affect recording, evaluation, glow, attempts, or rewards.

## Evaluation and rewards

- Story, sentence, and word pages use browser Arabic STT plus normalized text
  alignment for experimental reading-content feedback.
- Isolated short-vowel letter pages use a separate conservative evaluator.
  An unverified result never passes, glows, or earns a reward. After three
  unsuccessful attempts the child can continue with `needs-practice`.
- A unique successful page earns 1 star and 5 coins once per session.
  Narrator playback, retries, skips, uncertain results, and `needs-practice`
  earn nothing.
- Final reading score is separate: `successfulPages / totalBookPages`.

كتاب حرف الباء متاح بالكامل، وتُقيَّم صفحات الكلمات بشكل طبيعي. تستخدم صفحات
نطق الحرف المنفرد بالحركات وضعًا تدريبيًا تجريبيًا وآمنًا عند تعذّر التأكد من النطق.

## Run locally

Requirements: Node.js 18+ and a modern Chrome or Microsoft Edge browser.
Microphone capture requires `localhost` or HTTPS.

```powershell
npm.cmd ci
npm.cmd start
```

Open `http://localhost:4173` and grant microphone permission when requested.

## Checks

```powershell
npm.cmd run check
npm.cmd test
npm.cmd run build
```

`build` runs the static syntax check; this POC has no bundling step and no
required environment variables or cloud credentials.

## Nouri voice

Interactive Nouri voice guidance is an optional future enhancement and was
intentionally disabled in the submitted POC. Producing an accurate,
child-friendly Arabic voice experience requires additional voice preparation,
pronunciation review, timing validation, development time and operating cost.
The current POC therefore uses clear on-screen guidance and the provided
professional narrator audio after Try Again.

`NOURI_ENABLED=false`. Nouri remains a visual product character only.

## Validation evidence and limitations

- The fixed pilot used 24 recordings; full-pipeline agreement was 50%.
- The full 922 recordings were not processed through a final trained model.
- Arabic browser STT is experimental and is not validated teacher-level
  pronunciation or fluency assessment.
- Isolated short-vowel assessment remains experimental and does not block
  completion of a book.
- Browser microphone, autoplay, and STT support vary by device; manual
  Chrome/Edge and mobile-device acceptance checks remain separate QA work.

## Privacy

Recordings remain in the browser session and are not uploaded by this static
POC. Child recordings, calibration data, evaluation audio, review notes,
environment files, virtual environments, models, and `node_modules` are
ignored by Git.

## Repository layout

```text
assets/books/                 Active page images and narrator audio
src/app-v2.js                 UI and session flow
src/data/books.js             Explicit book/page manifest
src/features/reading/         Evaluation, glow, guards, rewards
src/features/recording/       Microphone lifecycle
src/features/playback/        Professional narrator playback
tests/                        Node automated tests
docs/                         POC write-up and readiness reports
```

## Future improvements

- Validated Arabic child-speech recognition and pronunciation/fluency scoring.
- Calibrated Arabic phoneme assessment for isolated vowels.
- Human-reviewed controlled evaluation data and mobile E2E checks.
- Interactive Nouri voice after approved audio preparation and review.
