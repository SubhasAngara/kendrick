"""Test real speech recognition using a synthetic Windows TTS fixture."""
import json
from pathlib import Path
import time
import wave
import av
import httpx

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / 'work/audio-fixture.wav'

def convert(target, codec, format_name):
    with av.open(str(source)) as inp, av.open(str(target), 'w', format=format_name) as out:
        stream = out.add_stream(codec, rate=48000)
        stream.layout = 'mono'
        resampler = av.AudioResampler(format='fltp' if codec == 'aac' else 'flt', layout='mono', rate=48000)
        for frame in inp.decode(audio=0):
            for converted in resampler.resample(frame):
                for packet in stream.encode(converted): out.mux(packet)
        for converted in resampler.resample(None):
            for packet in stream.encode(converted): out.mux(packet)
        for packet in stream.encode(None): out.mux(packet)

if __name__ == '__main__':
    convert(ROOT / 'work/audio-fixture.m4a', 'aac', 'mp4')
    convert(ROOT / 'work/audio-fixture.webm', 'libopus', 'webm')
    silence = ROOT / 'work/silence.wav'
    with wave.open(str(silence), 'wb') as w:
        w.setparams((1, 2, 16000, 0, 'NONE', 'not compressed'))
        w.writeframes(b'\x00\x00' * 16000 * 3)
    code = json.loads((ROOT / 'local-ai/.connection.json').read_text())['code']
    headers = {'Authorization': 'Bearer ' + code}
    results = []
    with httpx.Client(base_url='http://127.0.0.1:8787', headers=headers, timeout=90, trust_env=False) as client:
        for filename, kind in [('audio-fixture.m4a', 'audio/mp4'), ('audio-fixture.webm', 'audio/webm'), ('silence.wav', 'audio/wav')]:
            start = time.monotonic()
            r = client.post('/transcribe', headers={'Content-Type': kind}, content=(ROOT / 'work' / filename).read_bytes())
            result = {'file': filename, 'status': r.status_code, 'result': r.json(), 'seconds': round(time.monotonic() - start, 2)}
            results.append(result); print(json.dumps(result), flush=True)
    (ROOT / 'outputs/audio-check.json').write_text(json.dumps(results, indent=2))
