# Kendrick

Kendrick is a small communication app for adults with nonfluent aphasia who can still get a few words out and check a draft before anything is spoken.

After a stroke, some people live with aphasia. Language can be hard even when the idea is clear. Someone might manage "coffee" and "oat milk" but struggle to finish the sentence at the counter. Kendrick takes those words, suggests a fuller message, and waits for the person to approve it.

Your words. Your meaning. Your moment.

We built this for BUILDVERSE under AI for Accessibility & Inclusion, with Responsible AI as the design rule rather than a slogan at the end of a slide.

## What works today

Open the Expo app, pair it with a computer on the same trusted Wi‑Fi, then type a few words. The computer runs a local Qwen model through Ollama and returns either a draft sentence or one clarifying question. You can edit the draft, throw it away, keep your original words, or ask the phone to speak the approved message. Copy, share, and a simple on-device phrase list are there too.

Speech recording is optional. If you use it, Whisper on the paired computer turns the recording into editable text. Typed input is the path we rely on for demos.

This is not a medical product. It has not been tested with people with aphasia in a formal study. It does not replace AAC apps, therapists, or the supports someone already uses.

## Repo map

- `mobile/` — Expo / React Native app
- `local-ai/` — FastAPI service on the computer
- `BUILDVERSE-FORM-ANSWERS.md` — form copy for the hackathon
- `SUBMISSION.md` — demo notes
- `public/kendrick-buildverse-pitch.html` — optional pitch deck

Model weights, Ollama binaries, `.venv`, `node_modules`, and the pairing file `local-ai/.connection.json` stay off this repo on purpose.

## Run it on Windows

You need a Python 3.12 virtualenv, the portable Ollama runtime, and the Qwen / Whisper files described in `local-ai/README.md`. Those downloads are local to your machine.

Start the computer side:

```bat
start-local-ai.bat
```

Keep that window open. It prints a LAN address and a pairing code.

Then start the app:

```bat
cd mobile
npm install
npx expo start
```

In Settings, paste the address and code, connect, and wait until speech and suggestions show ready.

Quick typed check:

1. `coffee oat milk no sugar` → Help me make a sentence → Speak
2. `Jordan Friday` → you should get a question instead of a guessed story

## How the stack fits together

Phone or web UI talks to a FastAPI process on the computer. Qwen 2.5 1.5B through Ollama handles the draft or clarify step. Whisper `small.en` is only used when someone records audio. There is no hosted suggestion API in this prototype. Temporary recordings are deleted after transcription. Use a private network; the local link is plain HTTP for now.

## Where we are honest about overlap

Wispr Flow is mainly about turning speech into polished writing across apps. AAC products already help people build and speak messages, sometimes with prediction. Kendrick sits closer to "a few words in, reviewed everyday message out." That is a focus, not a claim that we invented communication support.

Next work we care about: try this with people with aphasia and speech-language pathologists, watch whether meaning holds, and see whether review still feels like the person's message. Symbol tiles, multiple sentence picks, and marked AI-added words are later ideas. They are not finished here.
