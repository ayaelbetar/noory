# Noory Demo - PE Assessment Write-Up

## 1. Research and Failed Trials

- I reviewed the local Noory product docs first. The strongest product rules are: Arabic-first RTL, the child reads before Noor helps, no shaming language, Success/Retry only during pages, narrator only after Retry, and Decision 7 after three Retry outcomes.
- Similar products reviewed:
  - Google Read Along: reading buddy listens and gives real-time help, works with rewards and progress: https://support.google.com/readalong/answer/12279465
  - Microsoft Reading Coach: AI reading practice, immediate fluency feedback, challenge-word practice, progress stats: https://support.microsoft.com/en-us/education/getting-started-with-reading-coach
  - Ello: AI coach listens to the child and adapts support in the moment: https://www.ello.com/
- AI provider notes:
  - Azure Speech has Arabic STT/TTS and pronunciation assessment locales including `ar-EG` and `ar-SA`: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support
  - Google Cloud Speech-to-Text and Text-to-Speech both list Arabic support: https://docs.cloud.google.com/speech-to-text/docs/speech-to-text-supported-languages and https://cloud.google.com/text-to-speech/docs/voices
  - Web Speech API supports browser speech recognition and synthesis, but recognition can be server-backed and browser-dependent: https://developer.mozilla.org/en-US/docs/web/api/web_speech_api/using_the_web_speech_api
- Failed/blocked trials:
  - The workspace had documentation only, no previous app code.
  - No Figma file, sample PDFs, child audio, or narrator audio files were available locally.
  - A production Azure/Google/OpenAI integration would require API keys and a backend, which is outside a fast local POC. I used a pluggable local evaluator with browser STT so the demo stays cost-aware.

## 2. Features and Decisions

- Included:
  - Home, book library, story details, reading session, Retry/narrator path, and final summary.
  - Real microphone recording with local playback.
  - Arabic speech recognition when browser-supported.
  - Arabic normalization for diacritics, alef variants, ta marbuta, punctuation, and whitespace.
  - Success/Retry threshold at `0.70`, matching the product docs.
  - Auto narrator playback after Retry. Real `audioSrc` is supported; browser Arabic TTS is the fallback.
  - Decision 7: after three Retry outcomes, offer Continue without framing the child as failing.
  - Unit tests for core evaluation behavior.
- Left out for the 3-6 hour POC:
  - Hosted backend upload pipeline.
  - Real sample PDFs and professional narrator audio imports.
  - Teacher-score calibration and model fine-tuning.
  - Parent dashboard, profiles, offline cache, and word-level coaching.
  - Full integration/e2e automation across mobile browsers.
- Architecture decision:
  - Keep recording, evaluation, playback, analytics, and book data separated so a real STT/pronunciation provider can replace the browser POC without rewriting the reading flow.

## 3. Measuring Success

- Child learning and UX:
  - Story completion rate.
  - Pages completed per session.
  - Retry-to-success rate after narrator playback.
  - Session exits during Retry or microphone permission states.
  - Re-record counts per page, capped and interpreted as effort signals, not grades.
- AI quality:
  - Agreement with teacher labels on sample child audio.
  - False Success and false Retry rates by age band, dialect, device, and background noise.
  - STT low-confidence rate and latency.
- Business/product:
  - Weekly active readers.
  - Books completed per child per week.
  - Parent-reported confidence and willingness to read again.
  - Cost per evaluated page and p95 evaluation latency.
