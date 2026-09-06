# Kendrick

Everyday communication assistant for adults with nonfluent aphasia who can contribute a few spoken or typed words and review a suggested message.

**Tagline:** Your words. Your meaning. Your moment.

**One line:** Kendrick helps people with aphasia turn a few spoken or typed words into a message they review and choose to speak.

Built for BUILDVERSE — AI for Accessibility & Inclusion / Responsible AI & Inclusive Innovation.

## What it does

1. Enter a few words (type, or optionally record speech)
2. Local Qwen (via Ollama) drafts a sentence or asks one clarifying question
3. Review and edit
4. Speak, copy, share, or save — only after approval

This is an early prototype. It is **not** clinically validated and does **not** replace AAC systems or clinical care.

## Repo layout

- `mobile/` — Expo / React Native app
- `local-ai/` — FastAPI service (Whisper optional, Qwen via Ollama)
- `public/kendrick-buildverse-pitch.html` — pitch deck (optional)
- `BUILDVERSE-FORM-ANSWERS.md` — submission copy
- `SUBMISSION.md` — demo script and handoff notes

## Quick start (Windows)

### 1. Local AI

Requires Python 3.12 venv, Ollama runtime, and model files (not committed; see `local-ai/README.md`).

```bat
start-local-ai.bat
```

Leave that terminal open. It prints a LAN URL and pairing code.

### 2. App

```bat
cd mobile
npm install
npx expo start
```

In the app **Settings**, enter the computer address and pairing code, then connect.

### Demo path (no microphone required)

1. Connect to Local AI
2. Type: `coffee oat milk no sugar` → Help me make a sentence → Speak
3. Type: `Jordan Friday` → expect a clarification question

## Privacy notes

- No hosted model API for suggestions in this prototype
- Pairing-code auth on the local service
- Temporary audio deleted after transcription
- Do not commit `.connection.json`, `.venv`, models, or runtime binaries

## Disclaimer

Kendrick makes no claim of clinical validation, measured accuracy, adoption, or demonstrated outcomes. Product scenarios in the pitch are illustrative.
