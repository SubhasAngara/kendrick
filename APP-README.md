# Kendrick — functional prototype

Review-first communication companion for BUILDVERSE (AI for Accessibility & Inclusion).

## What it does

1. Speak or type fragments
2. Local Whisper transcribes speech
3. Local Qwen (via Ollama) drafts a sentence or asks one clarifying question
4. You review and approve
5. Speak, copy, share, or save

No hosted AI API. No accounts. No analytics.

## Run (Windows)

### 1. Local AI

```bat
start-local-ai.bat
```

Leave that terminal open. It prints a LAN URL and pairing code.

### 2. iPhone app

```bat
start-app.bat
```

Open in Expo Go, go to **Settings**, enter the computer address and pairing code, then **Connect**.

### Demo script

1. Type: `me need water please` → draft → Speak
2. Type: `Jordan Friday` → clarification question
3. Add detail → draft → Speak

## Pitch

Open `http://127.0.0.1:4174/kendrick-buildverse-pitch.html` (after `npm start` in the project root) or open `public/kendrick-buildverse-pitch.html`. Export PDF with the on-slide **PDF** button.

## Stack

Expo / React Native · FastAPI · faster-whisper · Ollama · Qwen 2.5 1.5B
