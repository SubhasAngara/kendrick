"""Install the official portable Ollama runtime into this workspace."""
import json
from pathlib import Path
import zipfile
from setup_models import download

ROOT = Path(__file__).resolve().parents[1]
RUNTIME = ROOT / 'work/runtime'
URL = 'https://github.com/ollama/ollama/releases/download/v0.33.3/ollama-windows-amd64.zip'
SHA = '52cb36a62e7e501f61514f60212dec7117b6c098811357585e02fffe32d2fcd7'

if __name__ == '__main__':
    archive = RUNTIME / 'ollama-windows-amd64-v0.33.3.zip'
    download(URL, archive, SHA)
    target = RUNTIME / 'ollama'
    target.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(archive) as z:
        for member in z.infolist():
            if not (target / member.filename).resolve().is_relative_to(target.resolve()):
                raise RuntimeError('Unsafe archive path')
        z.extractall(target)
    (target / 'source.json').write_text(json.dumps({'url': URL, 'sha256': SHA}, indent=2))
    print('Portable Ollama installed. Qwen will be imported from the existing local GGUF when Kendrick starts.')
