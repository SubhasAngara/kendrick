@echo off
REM Start Kendrick local AI (Ollama + Qwen + Whisper) for the Expo app.
cd /d "%~dp0"

REM Prefer models already downloaded in the sibling Kendrick project if present.
set "SIBLING=%~dp0..\i-want-otpartcipat-e-in-the"
if exist "%SIBLING%\work\runtime\ollama\ollama.exe" (
  set "KENDRICK_ASSET_ROOT=%SIBLING%"
) else (
  set "KENDRICK_ASSET_ROOT=%~dp0"
)

set "PY=%KENDRICK_ASSET_ROOT%\local-ai\.venv\Scripts\python.exe"
if not exist "%PY%" set "PY=%~dp0local-ai\.venv\Scripts\python.exe"
if not exist "%PY%" (
  echo Missing Python venv. Create local-ai\.venv or use the sibling project venv.
  exit /b 1
)
if not exist "%KENDRICK_ASSET_ROOT%\work\runtime\ollama\ollama.exe" (
  echo Missing Ollama runtime under %KENDRICK_ASSET_ROOT%
  echo Run local-ai\setup_ollama.py and local-ai\setup_models.py first.
  exit /b 1
)

echo Using models from: %KENDRICK_ASSET_ROOT%
"%PY%" "%~dp0local-ai\start.py"
