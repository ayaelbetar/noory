# Noory Demo POC Architecture Plan

## What I Understood

- Noory is an Arabic-first reading experience for children ages 3-8.
- Noor is a companion, not a grader. The child always tries first.
- Page outcomes are Success or Retry. Continue is offered only after three Retry outcomes on the same page.
- Child UI must be RTL, short, warm, and free from technical or exam language.
- Narrator playback happens only after Retry, never before the first child attempt.

## What I Will Build

- A static mobile web POC with a home screen, book selection, story details, reading session, recording controls, AI-style feedback, narrator playback, retry loop, Continue decision, and final summary.
- A cost-aware client-side evaluation adapter that can later be swapped for Azure Speech Pronunciation Assessment, Google STT/TTS, or a custom backend.

## What I Will Build First

1. Static app shell and feature folders.
2. Arabic book data and message constants.
3. Recording and playback services.
4. Evaluation service and tests.
5. Reading flow UI and final summary.

## Navigation Map

Home -> Library -> Story Details -> Reading Session -> Reading Summary -> Library

## Screen Flow

- Home: Noor entry point.
- Library: child selects a story.
- Story Details: confirms story and starts Read with Noor.
- Reading Session:
  - Idle -> Recording -> Recorded -> Processing
  - Success -> next page
  - Retry -> narrator -> retry
  - Third Retry -> narrator -> Continue
- Summary: pages completed, strong pages, effort praise.

## Component Tree

- App
  - HomeScreen
  - CatalogScreen
  - StoryDetailsScreen
  - ReadingSessionScreen
    - Progress
    - PageText
    - NoorBubble
    - RecordingControls
    - PlaybackControls
    - OutcomeControls
  - SummaryScreen

## Data Flow

Book page text -> recording/transcript -> evaluator -> outcome -> retry counter -> UI state -> analytics event.

## State Management Plan

- Single lightweight session state object in `src/app.js` for the POC.
- Feature services stay stateless or self-contained.
- Production should move to a reducer/state machine matching `12_AI_Evaluation_Flow.md`.

## AI Integration Plan

- POC: browser Arabic STT + local similarity evaluator.
- Production recommendation: backend adapter for Azure Speech Pronunciation Assessment because it supports scripted pronunciation assessment and Arabic locales. Keep Google Cloud as a TTS/STT alternative where voice quality or price is better.
- Provider interface: `transcribe(audio, locale)`, `assess(transcript, referenceText)`, `synthesize(text, voice)`.

## Audio Pipeline

Microphone permission -> MediaRecorder blob -> local playback -> transcript -> evaluate -> narrator audio/TTS after Retry.

## Speech Recognition Pipeline

Browser SpeechRecognition in `ar-SA` -> transcript -> Arabic normalization -> token/character similarity -> Success/Retry.

## Reading Evaluation Pipeline

Normalize expected and heard text -> token coverage -> character similarity -> length confidence -> weighted score -> threshold `0.70`.

## Testing Strategy

- Unit tests for Arabic normalization and evaluation thresholds.
- Manual tests for mic permission, recording stop, playback, Retry narrator, Continue after third Retry, and final summary.
- Future: Playwright mobile viewport checks and backend contract tests for `/evaluate`.

## Risks

- Browser SpeechRecognition support varies and may require Chrome/Edge.
- Browser TTS is not a replacement for the provided professional narrator audio.
- Child speech recognition quality needs validation against teacher-scored sample audio.
- Real privacy and retention controls need backend implementation.

## Needs Clarification

- Final Figma screens and assets.
- Actual sample books, page text, PDFs, and narrator audio paths.
- Target Arabic locale or dialect for first pilot.
- Whether the assessment wants child-visible numeric scores despite Noory docs forbidding score percentages.
