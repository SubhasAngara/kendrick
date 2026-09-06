# BUILDVERSE form answers - Kendrick

Paste these into the form. Put your public Drive video URL in the last field before you submit.

---

## Theme *

Responsible AI & Inclusive Innovation

---

## Problem Statement *

AI for Accessibility & Inclusion

---

## Project Title *

Kendrick

---

## Describe your solution and its key features*

Kendrick is a communication app for adults with nonfluent aphasia who can contribute a few spoken or typed words and review a suggested message, on their own or with help.

One line: Kendrick helps people with aphasia turn a few spoken or typed words into a message they review and choose to speak.

Tagline: Your words. Your meaning. Your moment.

Aphasia can follow a stroke. Someone may know what they want and still struggle to finish a sentence in time for an ordinary exchange, like ordering coffee or stating a preference. Kendrick starts from those keywords, offers a draft, and keeps the person in charge of edits, rejection, original wording, and whether anything is spoken, copied, shared, or saved.

In the current build you can:
- type fragments (this is the reliable demo path)
- optionally record speech, transcribed on the computer with Whisper
- get a local Qwen draft through Ollama, or one clarifying question when a short fragment is ambiguous
- edit the source words and the draft
- review before speak / copy / share / save
- keep a small phrase list on the device
- pair an Expo app with a FastAPI service on trusted Wi-Fi, with no hosted model API for suggestions

This is early software. It has not been clinically validated. It does not replace AAC systems or clinical care. Symbol tiles, multiple sentence choices, and marked AI-added words are later ideas, not part of what we claim is finished here.

---

## What makes your solution innovative or unique?*

We are aiming at review-first keyword-to-message help for everyday talk, not faster general dictation.

Wispr Flow turns spoken input into polished writing. AAC apps already help people build and speak messages, sometimes with prediction. We do not say we are first, and we do not say nobody else helps people communicate.

What this prototype leans on:
- starting from a few words, not only fluent continuous speech
- asking before guessing when a short fragment is ambiguous (this detector still misses cases)
- requiring a human yes before speak or share
- running Qwen via Ollama locally, with Whisper as an optional path, so suggestions do not need a hosted AI provider
- treating the speaker's text as content to keep, not as instructions for the model
- simple checks around names, numbers, negation, uncertainty, and who is speaking

For the hackathon our claim is modest: a focused prototype worth testing with people who can supply keywords and verify the result, with the person still owning the final message.

---

## What technologies, AI tools, and frameworks did you use?*

- App: React Native, TypeScript, Expo (Expo Audio, Expo Speech, SecureStore, AsyncStorage)
- Local service: Python, FastAPI, Pydantic, httpx
- Optional speech path: faster-whisper, Whisper small.en, files kept on the computer
- Language model: Ollama, Qwen 2.5 1.5B Instruct, local
- Pairing code auth, request size limits, temp audio deletion, no analytics account layer, no hosted suggestion API in this prototype

---

## How does your solution work technically?*

1. Open the Expo app and pair once with the computer (LAN URL + pairing code).
2. Type a few words, or optionally record speech.
3. If there is audio, Whisper on the computer returns an editable transcript.
4. On "Help me make a sentence," the service may ask one clarifying question for short ambiguous fragments (for example a name plus a day). Otherwise it asks Qwen via Ollama for a restrained draft and runs conservative checks; if meaning looks changed, it asks for more detail instead of shipping a bad draft.
5. The app shows the draft for review. Edit, reject, go back to the original words, or start over.
6. Only after approval can the person speak (device TTS), copy, share, or save.

Judge path: app UI -> local FastAPI -> Qwen/Ollama -> human review -> optional Speak. Whisper is optional and not required for the core demo.

---

## Share your project demo or prototype link*

https://github.com/SubhasAngara/kendrick

The prototype is this public repo (Expo app + local AI). Setup notes are in the README.

---

## Share your GitHub repository link*

https://github.com/SubhasAngara/kendrick

Do not commit `.connection.json`, `.venv`, `node_modules`, model weights, Ollama/runtime binaries, recordings, or caches.

---

## What impact can your solution create and what is its future scope?*

Hypothesis, not a proven outcome: give adults with nonfluent aphasia another way to join everyday exchanges by turning keywords into a message they still author through review.

NIH/NIDCD reports about 2 million people in the United States live with aphasia, and about one in three stroke survivors are affected. That is the size of the condition, not our market size or a user forecast. Our first audience is narrower: people who can contribute a few words and verify a suggested message.

Soon we want to co-design with people with aphasia and speech-language pathologists, and look at meaning hold, edits/rejects, whether clarifications help, task completion, and perceived control. Ambiguity detection and pairing UX still need work. Recognition of aphasic speech stays an open research question, not a claimed result.

Not done yet: symbol tiles, multiple sentence candidates, clearer marks for AI-added words, wider access methods, clinical partnerships. We will not invent accuracy percentages, adoption numbers, or clinical benefit claims until real evaluation exists.

---

## Share project demonstration video drive link. Make sure link is accessible by everyone*

[PASTE PUBLIC GOOGLE DRIVE / VIDEO URL - ANYONE WITH THE LINK CAN VIEW]

Suggested 2-3 minute take:
1. Aphasia / keywords vs full sentence (15-20s)
2. Type `coffee oat milk no sugar` -> draft -> Speak
3. Type `Jordan Friday` -> clarification
4. Say Qwen is local, review is required, no clinical validation
5. Close on the tagline

---

## Before you hit submit

- [ ] Theme and problem track match the answers above
- [ ] Repo opens while logged out of GitHub
- [ ] Video is set to "Anyone with the link"
- [ ] Demo/prototype field filled (repo is fine)
- [ ] No clinical validation / "first" / superiority wording left in
- [ ] Team contact filled if the form asks for it
