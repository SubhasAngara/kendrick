# Kendrick local AI

Whisper small.en (faster-whisper, CPU int8) transcribes audio. Qwen 2.5 1.5B Instruct GGUF (Q4_K_M), served by llama.cpp on loopback, repairs short messages. No OpenAI API or other paid hosted model is called. Both models work without internet once downloaded.

## Existing setup

From the project root:

```powershell
.\local-ai\.venv\Scripts\python.exe .\local-ai\start.py
```

The launcher starts both processes, prints the LAN URL and pairing code, and stops both on Ctrl+C. It refuses to reuse occupied ports. Language model: `127.0.0.1:8099`. Phone API: port `8787`. Nothing is publicly deployed.

## Set up again on Windows

Use Python 3.12, Node 22.13+, and about 3 GB free disk space for dependencies and models:

```powershell
py -3.12 -m venv local-ai/.venv
local-ai/.venv/Scripts/python.exe -m pip install -r local-ai/requirements-lock.txt
local-ai/.venv/Scripts/python.exe local-ai/setup_models.py
local-ai/.venv/Scripts/python.exe local-ai/start.py
```

The setup script downloads official artifacts; the portable llama.cpp archive and Qwen model are checked against published SHA-256 digests. Model assets are in ignored `work/models/`, inference binaries in `work/runtime/`. Provenance is written to `work/models/sources.json`. The pairing credential is in ignored `.connection.json`; do not commit or publish it. Delete that file while the service is stopped to generate a new code next time.

## API

All endpoints require `Authorization: Bearer <pairing-code>`.

- `GET /health`: reports whether each model is ready.
- `POST /transcribe`: raw M4A, WebM, or WAV bytes; max 8 MB / 120 seconds. Returns a reviewable transcript. Silence gets an explicit error. Temporary input is deleted in a finally block.
- `POST /compose`: JSON `{ "text": "speaker's own words" }`, max 1,800 characters. Returns a draft or clarification. There is no numeric confidence or automatic speech/send.

Only one inference runs at a time. Parallel requests get a retry message. The app has cancellation and bounded request timeouts. There is no account service, analytics, persistent message history, or third-party API. Local HTTP traffic is unencrypted; use trusted Wi-Fi only.

## Verification

```powershell
local-ai/.venv/Scripts/python.exe -m pytest local-ai/test_server.py -q
local-ai/.venv/Scripts/python.exe local-ai/evaluate.py
local-ai/.venv/Scripts/python.exe local-ai/check_audio.py
```

The last script expects `work/audio-fixture.wav`, a synthetic Windows TTS recording. It converts that fixture to iPhone-style M4A and WebM and checks silence. Development outputs are written to `outputs/`; they are not clinical accuracy measurements. The phrase evaluation includes prompt examples and a few held-out inputs, so it must not be presented as an independent benchmark.

Current known limitation: the small model can leave an ambiguous fragment such as a name plus a day unchanged instead of asking a useful question. The reviewer still sees the original and controls what is spoken. For production, evaluate larger models and collect consented speech examples from intended users.

Sources and licenses:

- https://github.com/SYSTRAN/faster-whisper (MIT)
- https://huggingface.co/Systran/faster-whisper-small.en
- https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF (Apache 2.0 model)
- https://github.com/ggml-org/llama.cpp (MIT)

Keep upstream notices when redistributing their code or model files. `requirements-lock.txt` captures this machine's Python environment; `requirements.txt` records direct dependency bounds.
