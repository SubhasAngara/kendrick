"""Download official model assets once. Inference itself needs no internet."""
import hashlib
import json
import os
from pathlib import Path
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[1]
MODELS = ROOT / 'work' / 'models'
RUNTIME = ROOT / 'work' / 'runtime'
MODEL_FILE = 'qwen2.5-1.5b-instruct-q4_k_m.gguf'
MODEL_SHA = '6a1a2eb6d15622bf3c96857206351ba97e1af16c30d7a74ee38970e434e9407e'

def download(url, dest, digest=None):
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and (not digest or sha(dest) == digest):
        print(f'Already downloaded: {dest.name}', flush=True)
        return
    partial = dest.with_suffix(dest.suffix + '.part')
    print(f'Downloading {dest.name}…', flush=True)
    request = urllib.request.Request(url, headers={'User-Agent': 'Kendrick-local-setup'})
    with urllib.request.urlopen(request, timeout=120) as response, partial.open('wb') as output:
        while chunk := response.read(1024 * 1024):
            output.write(chunk)
    if digest and sha(partial) != digest:
        partial.unlink()
        raise RuntimeError(f'Checksum mismatch for {dest.name}')
    partial.replace(dest)
    print(f'Verified {dest.name}', flush=True)

def sha(path):
    with path.open('rb') as source:
        return hashlib.file_digest(source, 'sha256').hexdigest()

if __name__ == '__main__':
    RUNTIME.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request('https://api.github.com/repos/ggml-org/llama.cpp/releases/tags/b10819', headers={'User-Agent': 'Kendrick-local-setup'})
    release = json.load(urllib.request.urlopen(request, timeout=30))
    asset = next(a for a in release['assets'] if a['name'].endswith('bin-win-cpu-x64.zip'))
    archive = RUNTIME / asset['name']
    digest = asset.get('digest', '').removeprefix('sha256:')
    if not digest:
        raise RuntimeError('Release is missing its published checksum')
    download(asset['browser_download_url'], archive, digest)
    target = RUNTIME / 'llama'
    target.mkdir(exist_ok=True)
    with zipfile.ZipFile(archive) as z:
        for member in z.infolist():
            if not (target / member.filename).resolve().is_relative_to(target.resolve()):
                raise RuntimeError('Unsafe archive path')
        z.extractall(target)
    download(f'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/{MODEL_FILE}', MODELS / MODEL_FILE, MODEL_SHA)
    os.environ['HF_HUB_DISABLE_SYMLINKS_WARNING'] = '1'
    from huggingface_hub import snapshot_download
    print('Downloading Whisper small.en…', flush=True)
    snapshot_download('Systran/faster-whisper-small.en', local_dir=str(MODELS / 'whisper-small.en'), allow_patterns=['*.json', '*.bin', '*.txt'])
    (MODELS / 'sources.json').write_text(json.dumps({
        'llama_cpp': {'release': release['tag_name'], 'url': asset['browser_download_url'], 'sha256': digest},
        'qwen': {'repo': 'Qwen/Qwen2.5-1.5B-Instruct-GGUF', 'file': MODEL_FILE, 'sha256': MODEL_SHA},
        'whisper': {'repo': 'Systran/faster-whisper-small.en'}
    }, indent=2))
    print('Local models ready. No API key needed.', flush=True)
