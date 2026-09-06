# BUILDVERSE submission answers — Kendrick

Use these fields as-is (or lightly edit). Replace every `[PASTE …]` link before submitting.

---

## Theme *
**Responsible AI & Inclusive Innovation**

---

## Problem Statement *
**AI for Accessibility & Inclusion**

---

## Project Title *
**Kendrick**

---

## Describe your solution and its key features*

Kendrick is an everyday communication assistant for adults with nonfluent aphasia who can contribute a few spoken or typed words and review a suggested message, independently or with support.

**One-line:** Kendrick helps people with aphasia turn a few spoken or typed words into a message they review and choose to speak.

**Tagline:** Your words. Your meaning. Your moment.

After a stroke, some people experience aphasia: difficulty using or understanding language. Someone may know what they want to say and still struggle to form a complete sentence in time for an ordinary moment—ordering coffee, expressing a preference, or making a request.

Kendrick starts from those keywords or fragments and helps compose a draft message. The person stays in control: they can edit, reject, keep their original words, and choose whether the message is spoken aloud, copied, shared, or saved.

**Key features in the current prototype**
- Typed fragment input (primary, reliable demo path)
- Optional speech recording, transcribed locally with Whisper
- Local sentence assistance with Qwen (via Ollama) that drafts a readable message or asks one clarifying question when meaning is unclear
- Editable source words and editable draft
- Mandatory review before speak / copy / share / save
- On-device phrasebook for saved messages
- Pairing between an Expo iPhone/web app and a local FastAPI service over trusted Wi‑Fi (no hosted model API for suggestions)

**Honest scope**
This is an early accessibility prototype. It has not been clinically validated or evaluated with intended users. It does not replace established AAC systems, clinicians, or communication supports. Future ideas (symbol tiles, multiple sentence choices, highlighted AI additions) are not claimed as finished in this submission.

---

## What makes your solution innovative or unique?*

Kendrick’s focus is **review-first communication for keyword-to-message participation**, not faster general dictation.

There is real overlap with tools like Wispr Flow (spoken input → polished writing) and with AAC apps that help people construct and speak messages (including AI-assisted prediction). We do not claim to be the first or only product in this space.

What we optimize for in this prototype:
- A starting point of **a few words**, not necessarily fluent continuous speech
- **Clarification before guessing** when a short fragment is ambiguous (with known limitations)
- **Visible human approval** before anything is spoken or shared
- **Local inference** (Qwen via Ollama; optional Whisper) so message composition does not require a hosted AI provider
- Treating the speaker’s words as **content to preserve**, not instructions for the model to obey
- Conservative meaning-change checks for names, numbers, negation, uncertainty, and perspective

The claim for this hackathon is narrower and stronger: a focused, testable communication prototype for people who can supply keywords and verify the resulting message—designed so the person remains the author of what gets said.

---

## What technologies, AI tools, and frameworks did you use?*

- **App:** React Native, TypeScript, Expo (Expo Audio, Expo Speech, SecureStore, AsyncStorage)
- **Local service:** Python, FastAPI, Pydantic, httpx
- **Speech (optional path):** faster-whisper · Whisper `small.en` (on-device/computer, local files)
- **Language model:** Ollama · Qwen 2.5 1.5B Instruct (local)
- **Auth / privacy posture:** pairing-code bearer auth, request size limits, temporary audio deletion, no analytics / no account service / no hosted suggestion API in this prototype

---

## How does your solution work technically?*

1. The person opens the **Expo app** and pairs it once with a computer running Kendrick’s local service (LAN URL + pairing code).
2. They enter a few words by **typing**, or optionally **record speech**.
3. Optional speech is sent to the local service and transcribed with **Whisper**; the transcript remains editable.
4. On “Help me make a sentence,” the service:
   - may **clarify** short ambiguous fragments (for example, a name + a day) instead of inventing an interpretation;
   - otherwise asks **Qwen via Ollama** for a restrained grammatical draft that preserves meaning-critical content;
   - applies conservative validation tripwires; if meaning appears to change, it asks for more detail instead of returning a risky draft.
5. The app shows the draft for **review**. The person can edit, reject, return to their words, or start over.
6. Only after approval can they **speak** (device TTS), **copy**, **share**, or **save** the message.

Main path for judging: **phone/web UI → local FastAPI → Qwen/Ollama → human review → optional speak.**  
Whisper is an optional input branch, not required for the core demo.

---

## Share your project demo or prototype link*
`[PASTE PUBLIC DEMO OR PROTOTYPE URL]`

Suggested options when ready:
- Public GitHub README with run instructions (acceptable if live hosting is unavailable)
- Or a short public page / recorded walkthrough link if the live phone+LAN demo cannot be shared remotely

---

## Share your GitHub repository link*
`[PASTE PUBLIC GITHUB REPO URL]`

Before pushing, exclude: `.connection.json`, `.venv`, `node_modules`, model weights, Ollama/runtime binaries, recordings, and caches.

---

## What impact can your solution create and what is its future scope?*

**Intended impact (hypothesis, not proven outcome):**  
Give adults with nonfluent aphasia another way to participate in everyday exchanges—requests, preferences, and short conversations—by turning keywords into a message they still author through review.

NIH/NIDCD reports that about **2 million** people in the United States live with aphasia, and roughly **one in three** stroke survivors are affected. Those figures describe the condition’s scale, not Kendrick’s market size or guaranteed users. Our first audience is narrower: people who can contribute a few words and verify a suggested message.

**Near-term scope**
- Co-design and evaluate with people with aphasia and speech-language pathologists
- Measure meaning preservation, edit/reject rates, clarification usefulness, task completion, and perceived control
- Harden ambiguity detection and local pairing UX
- Keep speech recognition of aphasic speech as a research question—not a claimed capability

**Later scope (explicitly not done yet)**
- Symbol-tile input
- Multiple sentence candidates
- Clearer visual distinction of AI-added words
- Broader access methods and clinical partnership pathways

We will not invent accuracy percentages, adoption numbers, or clinical benefit claims until those evaluations exist.

---

## Share project demonstration video drive link. Make sure link is accessible by everyone*
`[PASTE PUBLIC GOOGLE DRIVE / VIDEO URL — ANYONE WITH LINK CAN VIEW]`

**Recommended 2–3 minute video outline**
1. Problem: aphasia / keywords vs full sentence (15–20s)
2. Demo A: type `coffee oat milk no sugar` → draft → Speak
3. Demo B: type `Jordan Friday` → clarification (no guessed story)
4. Note: local Qwen; review required; not clinically validated
5. Close: “Your words. Your meaning. Your moment.”

---

## Quick pre-submit checklist
- [ ] Theme + problem track selected as above
- [ ] Repo is public; opens while logged out
- [ ] Video link is “Anyone with the link”
- [ ] Demo/prototype field filled (repo README OK if needed)
- [ ] No clinical validation / “first” / superiority claims left in the text
- [ ] Team contact added in the form if a separate field appears
