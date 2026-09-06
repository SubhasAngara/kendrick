import { useEffect, useRef, useState } from 'react';
import type { AudioRecorder, RecorderState } from 'expo-audio';

const IDLE: RecorderState = { canRecord: false, isRecording: false, durationMillis: 0, mediaServicesDidReset: false, url: null };

// Native shared objects can be released during reload/unmount. Never read a
// native getter during render, and poll only while a recording is active.
export function useRecorderStatus(recorder: AudioRecorder, active: boolean, onUnavailable: () => void) {
  const [state, setState] = useState<RecorderState>(IDLE);
  const handler = useRef(onUnavailable);
  handler.current = onUnavailable;
  useEffect(() => {
    if (!active) { setState(IDLE); return; }
    let disposed = false;
    const interval = setInterval(() => {
      if (disposed) return;
      try { setState(recorder.getStatus()); }
      catch {
        disposed = true; clearInterval(interval); handler.current();
      }
    }, 150);
    return () => { disposed = true; clearInterval(interval); };
  }, [recorder, active]);
  return state;
}
