<p align="center">
  <img src="assets/kendrick-logo-dark.png" alt="Kendrick" width="520" />
</p>

<p align="center"><em>Your words. Your meaning. Your moment.</em></p>

<p align="center">BUILDVERSE · AI for Accessibility &amp; Inclusion</p>

---

# Kendrick

Kendrick is a communication app for adults with nonfluent aphasia who can get a few words out and check a draft before anything is spoken.

Aphasia can follow a stroke. The idea may be there while the sentence stalls. Someone might say `coffee` and `oat milk` and still miss the window at the counter. Kendrick takes those words, offers a fuller message, and waits for a yes.

> Kendrick helps people with aphasia turn a few spoken or typed words into a message they review and choose to speak.

We built this for BUILDVERSE. The person remains the author of what gets said.

## What works today

Open the Expo app and pair it once with a computer on trusted Wi-Fi. Type a few words. The computer runs Qwen through Ollama and returns a draft or one clarifying question. You can edit the draft, scrap it, keep your original wording, or tap Speak. Copy, Share, and a small on-device phrase list sit behind that review step.

Recording is optional. If you record, Whisper on the computer turns audio into editable text. For demos we type.

This is not a medical product. Nobody has run a formal study of this build with people who have aphasia. It does not replace AAC software or a clinician.

## Repo layout

- `mobile/` - Expo / React Native app
- `local-ai/` - FastAPI service on the PC
- `assets/` - brand logos
- `start-local-ai.bat` / `start-app.bat` - Windows helpers

Model weights, Ollama binaries, `.venv`, `node_modules`, and `local-ai/.connection.json` are ignored. Leave them off GitHub.

## Run on Windows

You need Python 3.12, the portable Ollama runtime, and the Qwen/Whisper files described in [local-ai/README.md](local-ai/README.md). Those files stay on disk locally.

Computer side:

```bat
start-local-ai.bat
```

Leave that window open. It prints a LAN address and a pairing code.

App side:

```bat
cd mobile
npm install
npx expo start
```

Or run `start-app.bat` from the repo root.

In Settings, paste the address and code, then connect. Wait until suggestions show ready.

Typed smoke test:

```text
coffee oat milk no sugar  ->  Help me make a sentence  ->  Speak
Jordan Friday             ->  clarifying question, not a guessed story
```

## Stack sketch

```text
Expo app -> FastAPI on your PC -> Qwen via Ollama -> human review -> optional Speak
                \-> optional Whisper (speech to editable text)
```

No hosted suggestion API in this build. Temp audio is deleted after transcription. Traffic on the LAN is plain HTTP, so stick to a private network.

## Overlap, said plainly

Wispr Flow turns speech into polished writing across apps. AAC apps already help people build and speak messages. Kendrick is aimed at a narrower job: a few words in, a reviewed everyday message out. That is our focus for this prototype. We are not claiming we invented assistive communication.

What we want next is work with people who have aphasia and with speech-language pathologists: does the draft keep the intended meaning, and does review still feel like the person's own message? Symbol tiles, multiple sentence options, and marked AI-added words are later. They are not done here.
