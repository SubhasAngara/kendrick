# Kendrick local AI

This folder is the computer-side service. Whisper small.en (faster-whisper, CPU int8) can transcribe audio. Qwen 2.5 1.5B Instruct runs through Ollama for drafts and clarifications. No paid hosted model API is called for suggestions. Once the files are on disk, the models can run offline.

## Start (usual path)

From the repo root on Windows, `start-local-ai.bat` is the easy entry. Or:

```powershell
.\local-ai\.venv\Scripts\python.exe .\local-ai\start.py
```

`start.py` brings up Ollama, loads Qwen, then serves FastAPI on port `8787`. It prints the LAN URL and pairing code. Ctrl+C stops the children. If 11434 or 8787 is already taken, it exits instead of stacking a second copy.

Set `KENDRICK_ASSET_ROOT` if your models live in another folder (for example a sibling project that already downloaded them).

## Fresh Windows setup

Python 3.12, Node for the app side, and a few GB of disk for models:

```powershell
py -3.12 -m venv local-ai/.venv
local-ai/.venv\Scripts\python.exe -m pip install -r local-ai/requirements-lock.txt
local-ai/.venv\Scripts\python.exe local-ai/setup_models.py
local-ai/.venv\Scripts\python.exe local-ai/setup_ollama.py
local-ai/.venv\Scripts\python.exe local-ai/start.py
```

`setup_models.py` pulls Whisper and the Qwen GGUF into ignored `work/models/`. `setup_ollama.py` installs a portable Ollama under `work/runtime/`. Digests and sources land in `work/models/sources.json`. The pairing secret is `local-ai/.connection.json` (ignored). Delete that file while the server is stopped if you want a new code.

## HTTP API

Every route wants `Authorization: Bearer <pairing-code>`.

- `GET /health` - whether Whisper and Qwen look ready
- `POST /transcribe` - raw M4A / WebM / WAV, max 8 MB / 120 seconds, returns a transcript you should review; silence returns an error; temp files are removed
- `POST /compose` - JSON `{"text":"..."}` up to 1800 characters; returns a draft or a clarification; no auto-speak

One inference at a time. Extra requests get a retry-style error. The app can cancel. No accounts, analytics, or message history on the server. LAN traffic is unencrypted; private Wi-Fi only.

## Checks

```powershell
local-ai/.venv\Scripts\python.exe -m pytest local-ai/test_server.py -q
local-ai/.venv\Scripts\python.exe local-ai/evaluate.py
local-ai/.venv\Scripts\python.exe local-ai/check_audio.py
```

`check_audio.py` expects `work/audio-fixture.wav`. Outputs under `outputs/` are development logs, not clinical scores. The phrase eval mixes prompt examples with a few held-out strings, so do not sell it as an independent benchmark.

Known soft spot: a tiny model can still mishandle some ambiguous fragments. Deterministic name-plus-day style checks catch some of those before Qwen. The person on the phone still has the original words and the final say.

## Licenses / sources

- https://github.com/SYSTRAN/faster-whisper (MIT)
- https://huggingface.co/Systran/faster-whisper-small.en
- https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF (Apache 2.0 model)
- https://ollama.com/
- https://github.com/ggml-org/llama.cpp (MIT; used in older notes / tooling around GGUF)

Keep upstream notices if you redistribute their code or weights. `requirements-lock.txt` is the pinned environment from this machine; `requirements.txt` has the direct bounds.
