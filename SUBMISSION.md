# BUILDVERSE handoff - Kendrick

## Identity

- Project: Kendrick
- Track: AI for Accessibility & Inclusion
- Design rule: Responsible AI
- Tagline: Your words. Your meaning. Your moment.
- One sentence: Kendrick turns a few words into a message the speaker reviews and can choose to speak, with local Qwen and optional Whisper, and no hosted suggestion API in this prototype.

## Short description (form / judges)

For some adults with nonfluent aphasia, the meaning is there while a full sentence is hard to finish in an everyday exchange. Dictation tools mostly turn fluent speech into polished writing. Kendrick starts from fragments or a few typed words.

The app keeps those words editable. A local Qwen model through Ollama makes a small grammatical draft or asks one clarifying question when a short fragment is ambiguous. Nothing is spoken, copied, shared, or saved until the person reviews it.

Hardware path: Expo app on phone or web, paired over trusted Wi-Fi to a FastAPI service on a computer. Whisper small.en handles optional transcription. Qwen 2.5 1.5B runs in Ollama. No account service, analytics, or conversation history store in this build.

Early prototype. Not clinically validated. Not a stand-in for AAC systems or clinical support.

## What is implemented

- typed input and optional recorded speech
- local Whisper transcription
- local Ollama / Qwen drafts
- clarification for some short topic-plus-time fragments
- checks aimed at names, numbers, negation, uncertainty, and speaker perspective
- editable source and editable final message
- review before output
- speak, copy, share, saved phrases on device
- pairing code, request limits, cancel, temp audio deletion
- large controls, status text, typed fallback when speech is unavailable

## Tech list

- React Native, TypeScript, Expo, Expo Audio, Expo Speech
- Python, FastAPI, Pydantic, httpx
- faster-whisper / Whisper small.en
- Ollama / Qwen 2.5 1.5B Instruct
- AsyncStorage, SecureStore

## Demo script (~2:15)

0:00-0:20 problem

"You know what you mean, but the sentence is late. NIH/NIDCD reports about two million people in the U.S. living with aphasia. Ordinary moments - coffee, a preference, an appointment - can hang on that gap."

0:20-0:35 distinction

"Wispr Flow is strong at turning speech into polished writing. Kendrick is built around a few words and a message the person has to approve before it is spoken."

0:35-1:15 clear fragment

1. Show Local AI connected.
2. Type `me tired need sit down`.
3. Tap Help me make a sentence.
4. Show `I am tired. I need to sit down.`
5. Point at original words and the editable draft.
6. Tap Speak this message.

1:15-1:45 ambiguous fragment

1. New message.
2. Type `Jordan Friday`.
3. Tap Help me make a sentence.
4. Show the clarifying question.
5. Say we do not invent call vs meet vs cancel.

1:45-2:05 local / control

"Whisper and Qwen run on this computer. Meaning-sensitive words are guarded where we can. Speaker text is treated as content, not as orders for the model. Nothing speaks on its own."

2:05-2:15 close

"Kendrick is not here to speak for someone. It gives another way to finish what they started. Your words. Your meaning. Your moment."

## Links

- Public repo: https://github.com/SubhasAngara/kendrick
- Demo video: [VIDEO_URL]
- Team / contact: [TEAM_AND_CONTACT]

## Checklist

- [ ] Video link is public ("Anyone with the link")
- [ ] Repo opens logged out
- [ ] No `.connection.json`, `.venv`, `node_modules`, models, or runtimes in git
- [ ] README run steps still accurate
- [ ] Models warmed before recording
- [ ] Video text readable, audio clear enough
- [ ] No accuracy, clinical benefit, adoption, certification, "first," or superiority claims
- [ ] Form confirmation saved after submit
