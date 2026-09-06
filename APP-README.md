# Kendrick app notes

Small BUILDVERSE prototype. Accessibility track. Local models.

## Flow

Type or speak a few words. Whisper can turn speech into text on the computer. Qwen through Ollama returns a draft or a clarifying question. You review, then speak, copy, share, or save. No hosted suggestion API, no accounts, no analytics in this build.

## Windows run

Computer:

```bat
start-local-ai.bat
```

Leave it open for the LAN URL and pairing code.

App:

```bat
start-app.bat
```

Expo Go -> Settings -> paste address and code -> Connect.

## Demo lines

1. `me need water please` -> draft -> Speak
2. `Jordan Friday` -> clarifying question
3. Add detail -> draft -> Speak

## Pitch file

With `npm start` at the repo root, open `http://127.0.0.1:4174/kendrick-buildverse-pitch.html`, or open `public/kendrick-buildverse-pitch.html` directly. Use the on-page PDF button if you want a printout.

## Pieces

Expo / React Native, FastAPI, faster-whisper, Ollama, Qwen 2.5 1.5B.
