"""Generate local delivery files. Never publish the private connection guide."""
import html
import json
from pathlib import Path
import zipfile
import qrcode

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'outputs'
OUT.mkdir(exist_ok=True)
connection = json.loads((ROOT / 'local-ai/.connection.json').read_text())
host = connection['url'].removeprefix('http://').split(':')[0]
launch = f'exp://{host}:8081'
qrcode.make(launch).save(OUT / 'kendrick-iphone-qr.png')

guide = f'''# Open Kendrick on your iPhone

The computer is currently serving Kendrick at `{launch}`.

1. Install **Expo Go** on your iPhone: https://expo.dev/go.
2. Put your iPhone on the same Wi-Fi as this computer.
3. Scan **kendrick-iphone-qr.png** with your Camera and open in Expo Go.
4. In Kendrick, open **Settings** and enter:

   **Computer address:** `{connection['url']}`

   **Pairing code:** `{connection['code']}`

5. Tap **Connect & check**, then **Speak → Listen**.

This is a private local development preview, not an App Store release. Keep the two development servers running. If the computer's Wi-Fi address changes, restart them and generate a new QR code. Use the setup commands in `mobile/README.md` to start them again.

This file contains a local pairing credential. Keep it private. The QR code itself only contains the development-server address.
'''
(OUT / 'OPEN-ON-IPHONE.md').write_text(guide, encoding='utf-8')

# Snapshot the entire website (including generated output), excluding phone code,
# local models, dependencies, credentials, and version-control internals.
singles = ['package.json', 'website-server.mjs', 'README.md', 'ASSET-NOTES.md', 'WEBSITE-FILES.md', '.gitignore', '.openai/hosting.json']
files = [ROOT / path for path in singles if (ROOT / path).is_file()]
for directory in ['scripts', 'public', 'dist']:
    files.extend(p for p in (ROOT / directory).rglob('*') if p.is_file())
with zipfile.ZipFile(OUT / 'kendrick-website-complete.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    for file in files:
        archive.write(file, str(file.relative_to(ROOT)))
print(f'Created website snapshot ({len(files)} files), iPhone QR code, and private setup guide.')
