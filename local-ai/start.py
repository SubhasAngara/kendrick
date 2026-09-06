"""Start local Ollama/Qwen and Whisper phone API; Ctrl+C stops both."""
import json
import os
from pathlib import Path
import socket
import subprocess
import sys
import time
import httpx

ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = Path(os.environ.get('KENDRICK_ASSET_ROOT', ROOT)).resolve()

if __name__ == '__main__':
    ollama = ASSET_ROOT / 'work/runtime/ollama/ollama.exe'
    model = ASSET_ROOT / 'work/models/qwen2.5-1.5b-instruct-q4_k_m.gguf'
    if not ollama.exists(): sys.exit('Run local-ai/setup_ollama.py first.')
    if not model.exists(): sys.exit('Run local-ai/setup_models.py first.')
    for port in (11434, 8787):
        with socket.socket() as probe:
            if probe.connect_ex(('127.0.0.1', port)) == 0:
                sys.exit(f'Port {port} is already in use. Stop the existing Kendrick server, or inspect that process first.')
    from server import PAIR_CODE, OLLAMA_MODEL
    local_ip = '127.0.0.1'
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as probe:
            probe.connect(('192.0.2.1', 80)); local_ip = probe.getsockname()[0]
    except OSError: pass
    (ROOT / 'local-ai/.connection.json').write_text(json.dumps({'code': PAIR_CODE, 'url': f'http://{local_ip}:8787'}))
    print(f'\nKendrick - Ollama + Qwen, Whisper\nServer: http://{local_ip}:8787\nPairing code: {PAIR_CODE}\nUse the same trusted Wi-Fi on your iPhone.\n', flush=True)
    env = {**os.environ, 'KENDRICK_ASSET_ROOT': str(ASSET_ROOT), 'OLLAMA_HOST': '127.0.0.1:11434', 'OLLAMA_MODELS': str(ASSET_ROOT / 'work/models/ollama'), 'OLLAMA_NO_CLOUD': '1', 'OLLAMA_NUM_PARALLEL': '1', 'OLLAMA_DEBUG': '0'}
    children = []
    log_path = ASSET_ROOT / 'work/runtime/ollama.log'
    try:
        with log_path.open('w') as log, httpx.Client(base_url='http://127.0.0.1:11434', timeout=120, trust_env=False) as client:
            children.append(subprocess.Popen([str(ollama), 'serve'], env=env, cwd=ollama.parent, stdout=log, stderr=log))
            for attempt in range(60):
                if children[0].poll() is not None: sys.exit(f'Ollama did not start. See {log_path}')
                try:
                    if client.get('/api/version', timeout=2).status_code == 200: break
                except httpx.HTTPError: time.sleep(1)
            else: sys.exit('Ollama took too long to start.')
            models = client.get('/api/tags').json().get('models', [])
            if not any(item.get('name') == OLLAMA_MODEL for item in models):
                modelfile = ASSET_ROOT / 'work/runtime/Kendrick.Modelfile'
                modelfile.write_text(f'FROM "{model.as_posix()}"\nPARAMETER num_ctx 4096\nPARAMETER temperature 0\n')
                print('Importing the existing Qwen GGUF into Ollama...', flush=True)
                subprocess.run([str(ollama), 'create', OLLAMA_MODEL, '-f', str(modelfile)], env=env, check=True, stdout=log, stderr=log)
            print('Loading Qwen into memory...', flush=True)
            warm = client.post('/api/generate', json={'model': OLLAMA_MODEL, 'prompt': '', 'stream': False, 'keep_alive': '30m'})
            warm.raise_for_status()
            children.append(subprocess.Popen([sys.executable, '-m', 'uvicorn', 'server:app', '--host', '0.0.0.0', '--port', '8787', '--no-access-log', '--limit-concurrency', '8', '--timeout-keep-alive', '5'], cwd=ROOT / 'local-ai', env=env))
            print('Models ready. Leave this terminal open; Ctrl+C stops Kendrick.', flush=True)
            while all(child.poll() is None for child in children): time.sleep(1)
    except KeyboardInterrupt: pass
    finally:
        for child in reversed(children):
            if child.poll() is None:
                child.terminate(); child.wait(timeout=10)
