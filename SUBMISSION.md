# Kendrick — BUILDVERSE submission handoff

## Submission identity

- **Project:** Kendrick
- **Primary track:** AI for Accessibility & Inclusion
- **Secondary principle:** Responsible & Ethical AI
- **Tagline:** Your words. Your meaning. Your moment.
- **One sentence:** Kendrick is a review-first communication companion that turns fragments into a speaker-approved message, asks before making meaning-changing assumptions, and runs locally without a hosted AI provider.

## Copy-ready project description

For many people with nonfluent aphasia, the intended meaning may be present even when a complete sentence is difficult to produce in time for an everyday conversation. General dictation is designed primarily to turn natural speech into polished text. Kendrick starts from a different point: fragments, partial speech, or a few typed words.

Kendrick records or accepts the person's words, keeps the transcript editable, and uses a local Qwen model to make the smallest useful grammatical repair. When a short fragment contains essential ambiguity, Kendrick asks for clarification instead of choosing an interpretation. Every proposed message remains editable and can only be spoken, copied, shared, or saved after the person reviews it.

The prototype consists of an Expo/React Native app paired over trusted local Wi-Fi with an authenticated FastAPI service. Whisper `small.en` performs local speech transcription, and Qwen 2.5 1.5B runs through Ollama for sentence assistance. There is no hosted model API, account service, analytics, or persistent conversation history.

Kendrick is an early accessibility prototype and design hypothesis. It has not been clinically validated or evaluated with intended users, and it is not a replacement for established AAC systems or clinical support.

## Implemented features

- Recorded speech and typed input
- Local Whisper transcription
- Local Ollama/Qwen sentence assistance
- Deterministic clarification for short topic-plus-time fragments
- Meaning-change tripwires for names, numbers, negation, uncertainty, and perspective
- Editable source transcript and editable final message
- Mandatory review before output
- Text-to-speech, copy, share, and device-local saved phrases
- Pairing-code authentication, bounded requests, cancellation, and temporary-audio deletion
- Accessible labels, live status messages, large controls, and typed fallback

## Technology

- React Native, TypeScript, Expo, Expo Audio, Expo Speech
- Python, FastAPI, Pydantic, httpx
- faster-whisper with Whisper `small.en`
- Ollama with Qwen 2.5 1.5B Instruct
- Device AsyncStorage and SecureStore

## Demonstration script — target 2:15

### 0:00–0:20 — The problem

“Imagine knowing exactly what you want to say, but the conversation moves faster than the sentence arrives. For roughly two million people in the United States reported to have aphasia, communication barriers can affect ordinary moments like ordering coffee, refusing help, or changing an appointment.”

### 0:20–0:35 — The distinction

“Wispr Flow helps people turn natural speech into polished writing. Kendrick begins when complete speech is the barrier. It starts with fragments and ends with a message the person explicitly approves.”

### 0:35–1:15 — Clear fragment

1. Show Kendrick connected to Local AI.
2. Type `me tired need sit down`.
3. Tap **Help me make a sentence**.
4. Show `I am tired. I need to sit down.`
5. Point out the original words and editable message.
6. Tap **Speak this message**.

### 1:15–1:45 — Ambiguous fragment

1. Start a new message.
2. Type `Jordan Friday`.
3. Tap **Help me make a sentence**.
4. Show the clarification question.
5. Explain that Kendrick refuses to invent whether the person wants to call, meet, cancel, or reschedule.

### 1:45–2:05 — Local and responsible

“Whisper and Qwen run on this computer through FastAPI and Ollama. Kendrick protects meaning-critical words, treats the speaker's text as content rather than instructions, and never speaks automatically.”

### 2:05–2:15 — Close

“Kendrick is not here to speak for someone. It gives them another way to finish what they started. Your words. Your meaning. Your moment.”

## Links to add

- **Public repository:** `[REPO_URL]`
- **Demo video:** `[VIDEO_URL]`
- **Presentation PDF:** `[PDF_URL_OR_UPLOAD]`
- **Team/contact:** `[TEAM_AND_CONTACT]`

## Final release checklist

- [ ] Replace every placeholder above
- [ ] Repository is visible in a logged-out browser
- [ ] `.connection.json`, `.venv`, `node_modules`, models, runtime binaries, recordings, and caches are not committed
- [ ] README setup instructions render correctly
- [ ] `npm run check:pitch` passes
- [ ] `npm run check:mobile` passes
- [ ] `python -m pytest local-ai/test_server.py -q` passes
- [ ] Demo begins with warmed models
- [ ] Demo video audio is understandable and the app text is legible
- [ ] Pitch PDF contains the final repository, video, team, and contact details
- [ ] No accuracy, clinical-effectiveness, adoption, certification, “first,” or superiority claim appears
- [ ] HackCulture submission opens correctly after submission
