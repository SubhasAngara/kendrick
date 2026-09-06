<p align="center">
  <img src="assets/kendrick-logo-dark.png" alt="Kendrick" width="520" />
</p>

<p align="center">
  <em>Your words. Your meaning. Your moment.</em>
</p>

<p align="center">
  <strong>BUILDVERSE</strong> · AI for Accessibility &amp; Inclusion
</p>

---

# Kendrick

Kendrick is a small communication app for adults with **nonfluent aphasia** who can still get a few words out and check a draft before anything is spoken.

After a stroke, some people live with aphasia. Language can be hard even when the idea is clear. Someone might manage `coffee` and `oat milk` but struggle to finish the sentence at the counter. Kendrick takes those words, suggests a fuller message, and waits for the person to approve it.

> Kendrick helps people with aphasia turn a few spoken or typed words into a message they review and choose to speak.

This is an early prototype for BUILDVERSE. Responsible AI is the design rule here: the person stays the author of what gets said.

## What works today

1. Open the **Expo** app and pair it with a computer on the same trusted Wi‑Fi.
2. Type a few words *(or optionally record speech)*.
3. The computer runs a local **Qwen** model through **Ollama** and returns either a draft sentence or one clarifying question.
4. Edit the draft, throw it away, keep your original words, or tap **Speak**.
5. **Copy**, **Share**, and a simple on-device phrase list are available after review.

Speech recording is optional. If you use it, **Whisper** on the paired computer turns the recording into editable text. Typed input is the path we rely on for demos.

**Important:** This is not a medical product. It has not been tested with people with aphasia in a formal study. It does not replace AAC apps, therapists, or the supports someone already uses.

## Repo map

| Path | What’s in it |
| --- | --- |
| `mobile/` | Expo / React Native app |
| `local-ai/` | FastAPI service on the computer |
| `assets/` | Brand logos |
| `BUILDVERSE-FORM-ANSWERS.md` | Form copy for the hackathon |
| `SUBMISSION.md` | Demo notes |
| `public/kendrick-buildverse-pitch.html` | Optional pitch deck |

Model weights, Ollama binaries, `.venv`, `node_modules`, and the pairing file `local-ai/.connection.json` stay **off** this repo on purpose.

## Run it on Windows

You need a **Python 3.12** virtualenv, the portable Ollama runtime, and the Qwen / Whisper files described in [`local-ai/README.md`](local-ai/README.md). Those downloads stay on your machine.

### 1. Start the computer side

```bat
start-local-ai.bat
```

Keep that window open. It prints a LAN address and a pairing code.

### 2. Start the app

```bat
cd mobile
npm install
npx expo start
```

In **Settings**, paste the address and code, connect, and wait until speech and suggestions show ready.

### Quick typed check

```text
coffee oat milk no sugar  →  Help me make a sentence  →  Speak
Jordan Friday             →  expect a clarifying question
```

## How the stack fits together

```text
Expo app  →  FastAPI on your PC  →  Qwen via Ollama  →  human review  →  optional Speak
                 ↘ optional Whisper (speech → editable text)
```

There is **no hosted suggestion API** in this prototype. Temporary recordings are deleted after transcription. Use a private network; the local link is plain HTTP for now.

## Where we are honest about overlap

**Wispr Flow** is mainly about turning speech into polished writing across apps. **AAC products** already help people build and speak messages, sometimes with prediction. Kendrick sits closer to *a few words in, reviewed everyday message out*. That is a focus, not a claim that we invented communication support.

Next work we care about: try this with people with aphasia and speech-language pathologists, watch whether meaning holds, and see whether review still feels like the person's message. Symbol tiles, multiple sentence picks, and marked AI-added words are later ideas. They are **not** finished here.
