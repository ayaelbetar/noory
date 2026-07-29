# Product Manager Assessment Write-Up — Noory / نوري · Read with Noor / اقرأ مع نور

## 1. Document Information

| Field | Detail |
| --- | --- |
| Main application | **Noory — نوري** |
| Feature | **Read with Noor — اقرأ مع نور** |
| Reading companion | **Noor — نور** |
| Deliverable | Product Manager Assessment Write-Up |
| Product stage | Browser POC / MVP definition |
| Primary users | Arabic-speaking children aged 3–8 |
| Secondary users | Parents and caregivers |
| Assessment date | 28 July 2026 |
| Evidence reviewed | Assessment brief supplied with this task; `Read_with_Noor_MVP_PRD.md`; local source code, tests, READMEs, `POC_WRITEUP.md`; product, QA, architecture, business-rule, edge-case, and research documents |
| Evidence standard | This document distinguishes implemented code, documented intent, and items not verified. It does not treat a requirement as delivered merely because it appears in a PRD. |

## 2. Executive Summary

Read with Noor is an interactive reading feature inside the Noory application, helping children read and understand with Noor as their reading companion. اقرأ مع نور هي ميزة قراءة تفاعلية داخل تطبيق نوري، تساعد الأطفال على القراءة والفهم بمرافقة شخصية نور.

A child chooses a story, reads a displayed page aloud, records their voice, and receives one of two simple outcomes: **Success** or **Try Again**. A Retry automatically triggers narration of that exact page, after which the child can try again. After three evaluated Retry outcomes on one page, the child may continue so that difficulty does not prevent finishing the book. Completing the final page leads to a Reading Summary with a simple book-level score.

The local POC implements a meaningful version of this core loop rather than static screens only: browser microphone capture, optional browser Arabic speech recognition, local Arabic-text similarity evaluation, Retry narration, a three-Retry Continue decision, an end summary, local consent gating, browser-side session guards, and unit tests for core service logic. It is not yet a production AI-evaluation service. The `/evaluate` API, real provider integration, production consent/retention controls, persistent analytics, teacher calibration, and device E2E testing remain unimplemented or unverified.

The product direction is strong because it protects reading confidence: the child reads before assistance, sees binary child-facing feedback instead of technical scores, and receives help without a punitive dead end.

## 3. Problem Statement

| Perspective | Problem |
| --- | --- |
| Child | Reading aloud needs repetition and encouragement, but a child may not always have an adult available to listen or help without making the experience feel like a test. |
| Parent/caregiver | A caregiver needs a simple, safe way for a child to practise independently while retaining access to story narration. |
| Product opportunity | Noory can add guided practice to its story experience through an Arabic, RTL, child-appropriate loop that is supportive before it is corrective. |

## 4. Product Goals

1. Let a child practise reading one story page at a time in Arabic.
2. Keep the page-level outcome simple: Success or Try Again.
3. Provide immediate, page-specific narrator help after a Retry outcome.
4. Preserve motivation by allowing progress after three evaluated Retry outcomes.
5. Finish with a clear, simple summary rather than a technical evaluation screen.
6. Make the experience understandable on a mobile, RTL child interface.
7. Personalise gently through an optional locally stored child name and optional Noor voice feedback.

## 5. Non-Goals

The following are outside the MVP according to `Read_with_Noor_MVP_PRD.md` or are not present in the local POC:

- Continuous, word-by-word correction during reading.
- Child-facing technical confidence scores or a detailed per-page diagnostic.
- Teacher workflows, social features, new account systems, and paid content.
- A production hosted STT/AI backend, model training, or teacher-calibrated scoring.
- A parent dashboard, offline mode, profiles, or full device E2E release readiness.

## 6. Personas

| Persona | Need | Product response |
| --- | --- | --- |
| Child reader, 3–8 | A calm, low-pressure way to practise reading aloud. | Large, simple Arabic UI; brief feedback; narration after a Retry; Continue after repeated difficulty. |
| Parent/caregiver | Confidence that the child can practise independently and that audio support remains available. | Optional child name, separate Noor voice control, and narrator assistance that remains independent of that control. |
| Teacher/quality reviewer (future internal user) | A way to determine whether automated Success/Retry decisions are educationally sound. | Proposed consented, de-identified calibration plan; not implemented in the POC. |

## 7. End-to-End User Journey

| # | User action | System response | Product purpose | Main risk / validation point |
| ---: | --- | --- | --- | --- |
| 1 | Opens Noory. | Home is shown. | Entry to the wider product. | Host integration is not assessed here. |
| 2 | Taps **Read with Noor**. | Meet Noor screen opens. | Reinforce the companion role before the library. | The PRD requires this screen on every feature entry. |
| 3 | First feature visit only: enters or skips a name. | Name is stored locally when saved; blank remains allowed. | Light personalisation without blocking use. | Local persistence is code-present; cross-device persistence is not in scope. |
| 4 | Later visit: opens the feature again. | Meet Noor still appears; name form is skipped. | Preserve the welcome while avoiding repeated onboarding. | Verify on real browser storage. |
| 5 | Taps start. | Book library opens. | Let the child select content. | Demo content only is present locally. |
| 6 | Chooses a book. | Book details/open-book view appears. | Confirm story selection. | Provided assessment assets are not evidenced locally. |
| 7 | Starts reading. | Session state resets to the first page. | Begin a contained reading journey. | No production session persistence. |
| 8 | Sees page text. | Page text and record CTA are shown. | Make the expected reading visible. | RTL/mobile rendering needs device verification. |
| 9 | Taps record and grants microphone access. | Browser recorder starts; level meter and optional transcript begin. | Capture the child reading aloud. | Browser permission and STT availability vary. |
| 10 | Taps Done/stop. | Recording stops and an in-app processing state appears. | Make transition feel deliberate. | Current POC simulates a delay; no upload occurs. |
| 11 | Waits for evaluation. | Local evaluator compares transcript with expected page text. | Choose a child-facing outcome. | This is deterministic local logic, not production AI. |
| 12 | Receives Success. | Encouragement, optional Noor voice, and Next Page are available. | Reward effort without showing a page score. | Validate that voice never overlaps recording. |
| 13 | Receives Try Again. | Supportive copy appears. | Frame difficulty constructively. | Empty transcript currently maps to Retry, not a distinct failure. |
| 14 | Waits after a Retry. | Narrator plays the current page audio when supplied, otherwise browser TTS reads that page. | Model the exact target page. | Professional narrator assets are not locally evidenced. |
| 15 | Tries again. | Returns to recording. | Make practice actionable. | Retry count must only count evaluated Retry outcomes. |
| 16 | Receives a third evaluated Retry on one page. | Continue option is offered after narration. | Avoid blocking story completion. | Unit tested for the local evaluator. |
| 17 | Completes/continues past final page. | Session completes once and opens Reading Summary. | Give closure to the book. | Final-page and duplicate-completion behaviour need E2E verification. |
| 18 | Views the summary. | Shows completed-page information, rewards, and a simple percentage based on Success pages. | Show book-level progress only. | Existing older documentation conflicts with the current score requirement. |

## 8. Core Experience and Product Decisions

| Decision | Product rationale | Evidence / current state |
| --- | --- | --- |
| Child reads before help | Protects agency and avoids teaching before an attempt. | Required in PRD and implemented in session flow. |
| Binary Success / Try Again | Keeps feedback legible for a young child. | Implemented by local evaluator; internal score is not shown per page. |
| Encouragement before correction | Maintains confidence when reading is difficult. | Arabic message library and feedback tests exist. |
| Automatic narrator after Retry | Turns a failed attempt into immediate modelling. | Implemented through `NarratorService`; uses `audioSrc` when present, TTS fallback otherwise. |
| Continue after three Retry outcomes | Avoids turning practice into a blocker. | Local evaluator and unit tests implement it. |
| Technical failures are separate from Retry | A broken network or file should not be treated as reading difficulty. | Documented rule; not fully implemented because the POC has no evaluation network layer. |
| No child-facing per-page score | Avoids an exam-like interaction. | Implemented in page UI; internal evaluator score remains local. |
| Final score after the book | Gives a lightweight completion summary. | Implemented as Success pages divided by total pages. |
| Optional name | Enables warmth without blocking entry. | Local storage flow is implemented. |
| Noor voice toggle | Lets caregivers mute optional Noor guidance. | Implemented with local preference and browser TTS. |
| Narrator is independent | Narration is educational support, not optional encouragement. | Separate services and unit tests; toggle must not mute narration. |
| Avoid technical language | Children should not see API, confidence, or error-code language. | Intended in PRD and child copy; production failure states not implemented. |
| Arabic, mobile, RTL, privacy-aware | Match intended audience and child context. | RTL code is present; production privacy controls and device validation are pending. |

## 9. Assessment Requirement Traceability

Status vocabulary: **Complete** = directly supported by code and focused tests where applicable; **Partial** = code exists but has an important limitation or missing end-to-end validation; **Mocked** = POC simulation/local substitute; **Not implemented** = no supporting implementation found; **Not verified** = documentation/code exists but no execution evidence for the stated environment.

| Assessment requirement | Status | Evidence and qualification |
| --- | --- | --- |
| Open/select a book | Complete | Local book library and demo book data are implemented. |
| Display page text | Complete | Pages in `src/data/books.js` feed the reading screen. |
| Record reading aloud | Partial | `MediaRecorder` and `getUserMedia` are implemented; real-device/browser recording was not evidenced in this review. |
| Evaluate against expected text | Mocked | `evaluateReading()` compares a browser transcript to expected text locally; it is not hosted AI/STT evaluation. |
| Return Success or Retry | Complete | Local evaluator returns these outcomes and has unit coverage. |
| Narrate exact page on Retry | Partial | Service chooses page audio URL or speaks that page’s text; professional narrator assets and real playback are not verified. |
| Retry/Continue path | Complete | Retry flow and Continue after third Retry are implemented and unit tested. |
| Reading Summary/final score | Complete | Code calculates a book-level Success-page percentage. |
| Mobile-friendly experience | Partial | Responsive web shell and RTL UI exist; device-matrix testing is not evidenced. |
| Use supplied reading materials | Partial | Three local demo books exist; no supplied PDF/audio material was found in the workspace. |
| Teacher recording evaluation | Not implemented | No consented teacher-scored corpus, labels, benchmark, or calibration workflow found. |
| Cost-aware AI decision | Partial | Page-at-Done decision and proposed limits are documented; the POC has no provider cost controls to enforce. |
| Hosted/runnable POC | Partial | Local static Node server and run instructions exist; no deployed URL or hosted environment evidence found. |
| Research/competitor review | Complete | Local research documents and POC write-up record the reviewed products and decisions. |
| Actual failed/blocked trials | Complete | `POC_WRITEUP.md` records unavailable assets and avoided production integration; no additional trial results were found. |
| Metrics and analytics | Partial | Event names are emitted to an in-memory console logger; no persistent analytics pipeline or baseline exists. |

## 10. What Was Built

### Fully implemented in the local POC

- Story selection using three local demo books.
- Arabic page-by-page reading UI and local session progression.
- Local Arabic normalization, similarity scoring, Success/Retry decision, and three-Retry Continue decision.
- Retry narration service selection: supplied page audio first, browser TTS fallback second.
- Final reading summary and simple success-page percentage.
- Meet Noor every entry, optional first-visit name setup, later name editing, and local preference storage.
- Separate Noor voice-feedback and narrator services, with the optional Noor voice preference not controlling narrator playback.
- Unit tests for evaluator outcomes, narration source selection, feedback presentation, and sequential Noor voice prompts.
- Local parent-consent gate, offline/timeout recovery path, safe session checkpoint/resume, and background interruption handling.
- Client-side EC guards: duplicate-action lock, silent/short/unsupported/oversized-audio rejection, 120-second auto-stop, and 40-evaluation session cap.
- Missing-page-text protection and explicit cleanup of abandoned browser recording URLs.

### Partially implemented

- Microphone recording: browser capture and optional speech recognition are coded, but the assessment did not provide a recorded real-device validation result.
- Noor voice: browser `speechSynthesis` is used. The desired warm voice personality is documented, but the actual device voice cannot be guaranteed by code alone.
- Mobile readiness: responsive/RTL implementation exists, without documented device-matrix execution.
- Analytics: events are collected in memory and logged to the console only.

### Designed/documented but not implemented in this POC

- Hosted `/evaluate` API, provider STT/AI, and server-side timeout/failure-taxonomy enforcement.
- Consent version propagation, host ownership/audit, and production data retention controls.
- Server-side enforcement and contract validation for duration, size, and session-volume guards.
- Production audio retention/deletion controls and a privacy-reviewed data pipeline.
- Teacher scoring workflow, calibration dataset, benchmark, and model tuning.
- Full QA execution for EC-01 through EC-13.

### Not verified

- Professional narrator recordings for every page.
- Production deployment, monitoring, or secure backend operation.
- End-to-end flows on Android/iOS and with a child reader.

## 11. Product Value Added Beyond the Basic Assessment Loop

- A recurring Meet Noor introduction makes the companion visible each time the feature is entered.
- Child name personalisation is optional, locally persisted, editable later, and intentionally not used in every message.
- Noor voice is separately controllable from narration; turning it off leaves text and narrator support intact.
- Retry automatically moves into assistance, avoiding an unnecessary post-recording audio-player decision screen.
- Supportive Arabic feedback and a non-overlapping voice queue reinforce the child-safe tone.
- A comprehension question/reward layer is present in the POC. This is an implementation addition and should be reconciled with the PRD’s non-gamification direction before production scope is approved.

## 12. Research and Competitive Review

Only documented research is reported here; this review did not independently re-run competitor studies.

| Source | Documented learning | Product implication |
| --- | --- | --- |
| Noory product documents | Arabic-first, child-first story context is a product asset. | Keep the experience native to Noory and RTL. |
| Google Read Along | Read-aloud practice and supportive feedback establish a relevant interaction pattern. | Use guided practice, while preserving Noor’s Arabic character and page narration. |
| Duolingo ABC | Small steps and positive reinforcement help children continue. | Keep page outcomes short and encouraging. |
| Little Story | Story-led engagement is central to the reading context. | Place practice within stories rather than detached drills. |
| Microsoft Reading Coach / Ello (noted in `POC_WRITEUP.md`/PRD) | Reading feedback and adaptive support are relevant references. | Retain the simple Success/Retry loop for the child rather than expose detailed diagnostics. |

No validated user interviews, usability sessions, market sizing, conversion data, or live competitor feature tests were found in the project evidence. Those must not be inferred from the documents above.

## 13. Actual Failed or Blocked Trials and Learnings

`POC_WRITEUP.md` records the following constraints. They are documented limitations, not evidence of unsuccessful child tests.

| Blocked/left-out item | Documented reason | Learning |
| --- | --- | --- |
| Production vendor STT/TTS and backend | API keys and backend work were outside the POC scope. | Keep the local evaluator explicitly labelled as a POC substitute. |
| Sample PDFs, professional narrator audio, consented child audio | Assets were not present locally. | Content and voice assets are release dependencies, not cosmetic follow-ups. |
| Teacher-score calibration and fine-tuning | No labelled, consented dataset was available. | Do not make quality claims about the evaluator without a benchmark. |
| Hosted deployment and device E2E | Not evidenced in the workspace. | Treat browser/device behaviour as a release-validation task. |

No additional failed experiment, A/B test, child study, or measured trial is verified by the repository.

## 14. AI Evaluation Approach

### Current POC approach

1. Browser speech recognition may produce an Arabic transcript; when it is unavailable, the POC can use an assisted transcript input.
2. `evaluateReading()` normalizes Arabic variants and removes diacritics/punctuation.
3. It combines character similarity, expected-token coverage, and length similarity.
4. A score of at least `0.70` maps to Success; otherwise it maps to Retry.
5. On the third evaluated Retry outcome, it offers Continue.

This is local deterministic similarity logic. It does not validate the recording audio itself, return a provider confidence value, detect corrupted audio, or represent a trained speech model.

### Product/production approach described in documentation

The PRD and architecture specify one evaluation after Done, with expected page text and audio sent to a hosted evaluator. The child receives only Success or supportive Retry; technical failures remain separate. That production contract is not connected to the current static server.

### Product decision

Evaluate one complete page after Done rather than continuously or word-by-word. This lowers interruption, preserves child flow, and bounds future provider calls. It should be retained unless calibration evidence demonstrates a material learning or safety issue.

## 15. Teacher-Scored Audio Evaluation Plan

This is a proposed assessment plan, not work completed in the POC.

| Step | Plan |
| --- | --- |
| Consent and minimisation | Collect only consented, de-identified samples required for evaluation; do not use child names in the dataset. |
| Human label | Ask qualified teachers to score each reading sample on the assessment scale. For this assessment mapping: **teacher score > 6 = Success; teacher score ≤ 6 = Retry**. |
| Adjudication | Use multiple raters or a defined adjudication process for disagreements before treating the label as ground truth. |
| Comparison | Compare the evaluator’s Success/Retry outcome with the adjudicated label. |
| Measures | Agreement, false Success, false Retry, low-confidence rate, and results by age band, dialect, device, and background condition. |
| Decision gate | Do not promote a production threshold/model until an agreed quality bar is set after a representative baseline. |

No teacher recordings, scores, agreement rate, or accuracy figure is available. Therefore no accuracy claim or calibration outcome is made in this document.

## 16. AI Cost Awareness and Decision

| Cost driver | Current handling | Gap / control needed for production |
| --- | --- | --- |
| Number of evaluations | Local POC evaluates once when Done is submitted. | Enforce idempotency and one server evaluation per Done. |
| Audio duration | POC auto-stops at 120 seconds. | Enforce the same rule server-side. |
| Audio size | POC pre-validates the 8 MB limit. | Enforce server limit and recover from real HTTP 413. |
| Session volume | POC stops after 40 completed local evaluations. | Enforce and audit server-side per session. |
| Continuous streaming | Not used. | Keep page-complete evaluation as the default cost/UX choice. |
| Provider billing/latency | No provider is connected. | Instrument cost per evaluated page and p95 evaluation latency before release. |

The cost decision is product-led: one bounded evaluation at the end of a page is preferable to continuous listening for this MVP because it is simpler for children and easier to cost-control. It is a design rationale, not a statement of measured savings.

## 17. Safety, Privacy, and Trust

| Area | Documented requirement | POC evidence / status |
| --- | --- | --- |
| Parent consent | Consent before Read with Noor, microphone, and evaluation. | Locally stored POC consent gate; production consent service/versioning remains absent. |
| Child voice retention | Retention/deletion must be defined and limited. | POC creates local browser object URLs; no production retention policy is implemented. |
| No training on child audio | MVP policy is not to train on child voice. | Documented requirement; no production data pipeline to verify. |
| Analytics minimisation | Do not put raw audio or transcript in analytics. | In-memory events use story/page/retry style metadata; production analytics not implemented. |
| Child language | Encouraging, non-shaming, no technical failure wording. | Message library and feedback tests support this for implemented states. |
| Narrator versus Noor voice | Narrator remains available regardless of the Noor voice setting. | Separate services and tests support the intended separation. |

## 18. Edge Cases and Recovery Readiness

The official EC catalogue is documented in `08_Edge_Cases.md`. The table below reports POC readiness, not desired behaviour.

| Case | Expected product behaviour | POC readiness |
| --- | --- | --- |
| EC-01 No internet during upload | Recoverable network message; no incorrect Retry count. | Partial: browser offline check/handler returns to Idle and records `page_failure`; local POC has no real upload. |
| EC-02 Connection loss during evaluation | Return safely to Idle; child re-submits. | Partial: offline event cancels the active POC processing token and returns to Idle; no real HTTP request exists. |
| EC-03 Microphone denied | Explain and offer recovery. | Partial: mic exceptions return to Idle with child-safe copy; device permission behaviour needs E2E validation. |
| EC-04 Empty/no voice | Re-record path; do not count as reading failure. | Partial: short/empty/silent local recordings map to `EMPTY_AUDIO` and `page_failure`, not Retry; audio-level threshold needs device calibration. |
| EC-05 Low confidence/noise | Distinguish low confidence where applicable. | Partial: saturated audio is handled as `LOW_CONFIDENCE`; real STT confidence requires the production evaluator. |
| EC-06 Background/kill/call | Restore session safely. | Partial: session snapshot is persisted; background cancels recording/processing or narrator safely; OS kill/call behaviour requires device validation. |
| EC-07 Repeat taps | Debounce/idempotency. | Partial: recording, stop, submission, completion, and evaluation-cap guards are implemented; browser E2E remains required. |
| EC-08 AI timeout | Show recoverable timeout; no automatic re-upload. | Partial: timeout failure path exists and returns to Idle without resubmission; a real backend timeout is not present in the POC. |
| EC-09 Last page | Open Reading Summary once. | Partial: one-time completion guard and summary path are implemented; E2E test absent. |
| EC-10 Unsupported/corrupt audio | Recoverable validation error. | Partial: client-side duration/blob/MIME validation maps to child-safe failure; production server validation remains needed. |
| EC-11 Three Retry outcomes | Offer Continue; technical failures do not count. | Complete for the local evaluator: Retry threshold is unit tested and technical failures bypass retry increment. |
| EC-12 Consent missing | Block session/evaluation. | Complete for the local POC: locally saved parent consent gates session and microphone start. |
| EC-13 120 seconds / payload size | Auto-Done then handle over-size response. | Partial: 120-second auto-stop and 8 MB pre-validation are implemented; real HTTP 413 remains a backend integration test. |

## 19. Measuring Product Success

No live baseline, numerical target, or observed product metric is available. Targets should be set only after instrumenting a pilot and collecting a baseline.

### Proposed North Star

**Completed supported reading sessions**: the count of sessions in which a child reaches Reading Summary after reading or using the permitted Continue path.

### Proposed metric definitions

| Metric | Definition | Data source required | Interpretation |
| --- | --- | --- | --- |
| Session completion rate | `sessions reaching summary / sessions started` | Persistent session events | Indicates whether the loop is finishable. |
| Recording-start success | `recordings started / recording attempts` | Permission and recording events | Identifies microphone/browser friction. |
| Evaluation completion | `evaluations with outcome / submitted recordings` | Backend outcome/failure events | Separates technical loss from learning outcomes. |
| Narrator help effectiveness | `pages reaching Success after narrator / narrator-started pages` | Page sequence events | Indicates whether narration helps; interpret by segment. |
| Continue rate | `pages continued after three Retry outcomes / evaluated pages` | Retry and Continue events | A high rate may indicate content, STT, or UX difficulty. |
| False Success/Retry | Evaluator outcome compared with adjudicated teacher label | Consent-based benchmark dataset | Quality/safety measure, not a child-facing metric. |
| Latency | p50/p95 time from Done to outcome | Backend timing events | Protects child attention. |
| Evaluation cost | Provider cost divided by evaluated pages | Billing plus backend events | Validates the page-level cost decision. |

## 20. Analytics Event Plan

The POC already emits the following local, in-memory console events: `reading_session_preparing`, `page_recording_started`, `page_recording_stopped`, `page_upload_started`, `page_upload_completed`, `page_outcome_success`, `page_outcome_retry`, `page_continue_offered`, `page_continue_accepted`, `narrator_started`, and `reading_session_completed`.

| Event group | Current state | Production requirement |
| --- | --- | --- |
| Session/page progression | Event names exist locally. | Send through approved persistent analytics with schema/versioning. |
| Evaluation failures | No real failure events because no backend exists. | Add failure code, recoverable state, and retry-count separation. |
| Voice preference | Local setting exists. | Record preference change only if privacy review approves. |
| Quality benchmark | Absent. | Store only de-identified benchmark identifiers and adjudicated labels. |
| Privacy | No raw audio/transcript is sent by the current logger. | Explicitly prohibit child name, raw audio, transcript, and unnecessary PII in analytics. |

## 21. MVP Acceptance Criteria

| Given | When | Then | Current status |
| --- | --- | --- | --- |
| A child enters Read with Noor | They open the feature | Meet Noor appears. | Complete in code. |
| A first-time child enters | They enter or skip a name | They can continue; a saved name persists locally. | Complete in code. |
| A returning child enters | They open the feature | Meet Noor appears without repeating name onboarding. | Complete in code; browser persistence not E2E verified. |
| A child is on a page | They record and submit readable speech | The local POC returns Success or Retry. | Complete for local evaluator; Mocked as AI. |
| The evaluator returns Retry | The result is displayed | Narration of the current page starts before re-recording. | Partial: source-selection tests pass; real audio assets/browser playback unverified. |
| A page has three evaluated Retry outcomes | The child reaches the post-narrator state | Continue is offered. | Complete in evaluator unit test. |
| A child completes the last page by Success or Continue | Completion is triggered | Reading Summary appears once with book-level score. | Partial: code present; no full integration test. |
| Noor voice is off | A Noor guidance moment occurs | Text remains; Noor TTS is silent. | Complete in code intent; setting-specific UI automation absent. |
| Noor voice is off | A Retry occurs | Narrator remains available. | Complete by separate services/architecture; runtime E2E verification pending. |
| Consent is unavailable | Child attempts to enter/read | No microphone/evaluate request is allowed. | Not implemented. |

## 22. Risks and Mitigations

| Risk | Why it matters | Mitigation / next action |
| --- | --- | --- |
| Local transcript is inaccurate or unavailable | A child may be incorrectly asked to retry. | Use controlled provider evaluation and calibrate against teacher labels. |
| False Success | The child may progress without useful practice. | Measure against adjudicated labels; set a quality gate. |
| False Retry | The experience can feel discouraging. | Keep supportive language, auto-narrate, and audit false-Retry segments. |
| Browser support varies | Recording/STT/TTS can differ across devices. | Run the QA device matrix and define fallbacks. |
| Missing narrator assets | TTS fallback may not meet the desired voice quality. | Supply/approve narrator audio per page before release. |
| Child-audio privacy | Audio is sensitive child data. | Implement consent, data minimisation, retention/deletion, and security review. |
| Cost/latency creep | Provider use may become slow or expensive. | Enforce duration/size/session limits and monitor latency/cost. |
| Documentation drift | PRD, older write-ups, and POC differ on scores/gamification/backend. | Establish one release source of truth and reconcile before implementation handoff. |

## 23. Known Limitations

- The static `server.js` only serves files; it does not expose `/evaluate` or any authentication/consent service.
- The POC’s 2.4-second processing wait is a UI simulation, not upload or AI processing.
- Audio-level handling for silence/noise is a browser-side guard, not STT confidence analysis.
- 120-second, 8 MB, and 40-evaluation guards are client-side POC controls; production API enforcement remains required.
- No professional narrator-audio assets were found in local demo page data; browser TTS is the fallback.
- The actual warmth/personality of browser TTS depends on installed device voices and is not guaranteed by the configured rate/pitch alone.
- Events are non-persistent and not suitable for product measurement.
- Consent is a local POC gate; no production consent/retention service or real-device E2E result was found.
- The POC includes stars, coins, and comprehension questions; these need a scope decision because some product documents state a non-gamified MVP.
- Older project documentation says there should be no exam-style final percentage, whereas the current PRD and POC include a simple final score. This must be resolved in the release source of truth.

## 24. Recommended Roadmap

| Priority | Work | Release rationale |
| --- | --- | --- |
| P0 | Reconcile scope conflicts (final score, gamification, narrator asset requirement) and appoint the current PRD as release source of truth. | Prevents building against contradictory requirements. |
| P0 | Implement secure hosted evaluation contract, server-side failure taxonomy/guard enforcement, production consent ownership, and data retention controls. | Required for safe production use of child audio. |
| P0 | Execute core device E2E: record, Success, Retry/narrator, Continue, final summary, voice-toggle separation. | Validates the actual child loop beyond unit tests. |
| P1 | Add professional narrator audio for every release page and validate exact-page playback. | Improves educational quality and voice consistency. |
| P1 | Instrument persistent privacy-reviewed analytics and establish a baseline. | Enables evidence-based success and cost decisions. |
| P1 | Run consented teacher-score calibration and set evaluator quality gates. | Needed before claiming AI reading quality. |
| P2 | Parent-facing progress/review, profiles, offline support, richer adaptive assistance. | Valuable extensions after the core loop is proven. |

## 25. Final PM Assessment

**Classification: Partially ready as a POC; not ready for production launch.**

The POC demonstrates the intended core product loop in executable browser code and is supported by focused unit tests. It also includes browser-side coverage for all EC-01 to EC-13 paths, with explicit safeguards that keep technical failures out of the learning Retry count. It is therefore stronger than a visual prototype or a PRD alone. However, it should not be presented as a completed production AI reading product: the evaluation is local and transcript-based, not a hosted AI service; production consent/data controls and server enforcement are absent; narrator assets are not evidenced; and there is no teacher-calibration, production analytics, or device E2E evidence.

The appropriate next decision is to preserve the current child-first interaction model, validate it on target devices with approved content and narrator audio, then add the privacy, evaluation, measurement, and calibration foundations required for a safe release.
