# Noory ÔÇö ┘å┘êÏ▒┘è | Read with Noor ÔÇö Ïº┘éÏ▒Ïú ┘àÏ╣ ┘å┘êÏ▒ POC

Read with Noor is an interactive reading feature inside the Noory application, with Noor as the reading companion character.

Mobile-friendly web POC for the PE assessment: a child opens an Arabic book, reads each page aloud, records their voice, gets immediate Success or Retry feedback, hears page narration after Retry, and sees a final reading summary.

## Run Locally

```powershell
npm.cmd test
npm.cmd start
```

Open `http://localhost:4173`.

If PowerShell blocks `npm.ps1`, use the `.cmd` commands above or run `npm.cmd test` or `node --test tests/evaluator.test.js tests/narrator.test.js`, then `node server.js` directly.

Microphone recording requires `localhost` or HTTPS. Arabic speech recognition depends on browser support; Chrome/Edge are the best local POC targets. If the browser records audio but does not return Arabic speech recognition text, the app shows a small assisted input so the assessment flow can still be tested.

## POC Scope

- Static web app, no build step and no paid API key.
- Uses `MediaRecorder` for real audio capture and playback.
- Uses browser `SpeechRecognition` when available for Arabic STT.
- Uses local Arabic normalization and similarity scoring with the documented `0.70` Success threshold.
- Uses narrator audio URLs when a book page has `audioSrc`; because no sample narrator files were present, the demo falls back to `speechSynthesis` reading the exact page.
- Child UI is Arabic and RTL. Internal details stay in docs/tests.

## Files

- `index.html`, `styles.css` - mobile app shell and visual system.
- `src/app.js` - session state, navigation, and UI rendering.
- `src/features/recording/recorder.js` - mic recording and speech recognition.
- `src/features/reading/evaluator.js` - Arabic text normalization and Success/Retry decision.
- `src/features/playback/narrator.js` - narrator audio or browser TTS fallback.
- `src/data/books.js` - three demo books.
- `tests/evaluator.test.js` - unit tests for evaluation logic.
- `POC_WRITEUP.md` - short assessment write-up.
