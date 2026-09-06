import { File } from 'expo-file-system';
import { Platform } from 'react-native';
export type Connection = { url: string; code: string };
export type Health = { speech_ready: boolean; suggestions_ready: boolean };
export type Suggestion = { status: 'draft' | 'clarify'; sentence: string; question: string };

export function normalizeServer(value: string): string {
  const url = new URL(value.trim());
  const host = url.hostname;
  const local = host === 'localhost' || host === '127.0.0.1' || /^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) throw new Error('Use an HTTPS server or your computer’s local Wi-Fi address.');
  if (url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('Enter just the server address, such as http://192.168.1.20:8787.');
  return url.origin;
}
export async function request<T>(connection: Connection, path: string, body?: string | ArrayBuffer | Blob, signal?: AbortSignal, contentType = 'application/json'): Promise<T> {
  const timeout = new AbortController();
  const cancel = () => timeout.abort();
  if (signal?.aborted) timeout.abort();
  signal?.addEventListener('abort', cancel);
  const timer = setTimeout(cancel, path === '/health' ? 8000 : 90000);
  try {
    const response = await fetch(normalizeServer(connection.url) + path, {
      method: body === undefined ? 'GET' : 'POST', body,
      headers: { Authorization: `Bearer ${connection.code.trim()}`, ...(body === undefined ? {} : { 'Content-Type': contentType }) }, signal: timeout.signal,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'That request could not be completed.');
    return data as T;
  } catch (error) {
    if (signal?.aborted) throw new Error('Cancelled. Your words are still here.');
    if (timeout.signal.aborted) throw new Error(path === '/health'
      ? 'Your iPhone could not reach the computer. Check the address, Wi-Fi, and Expo Go’s Local Network permission in iPhone Settings.'
      : 'The computer took too long to respond. Try again, or use your own words.');
    if (error instanceof TypeError) throw new Error('Cannot reach your computer. Check the connection and use the same Wi-Fi.');
    throw error;
  } finally { clearTimeout(timer); signal?.removeEventListener('abort', cancel); }
}
export async function uploadRecording(connection: Connection, uri: string, signal: AbortSignal) {
  if (Platform.OS === 'web') {
    const body = await (await fetch(uri)).blob();
    return request<{ transcript: string }>(connection, '/transcribe', body, signal, body.type || 'audio/webm');
  }
  const body = await new File(uri).arrayBuffer();
  return request<{ transcript: string }>(connection, '/transcribe', body, signal, 'audio/mp4');
}
export function deleteRecording(uri: string | null) {
  if (!uri) return;
  try {
    if (Platform.OS === 'web') URL.revokeObjectURL(uri);
    else { const file = new File(uri); if (file.exists) file.delete(); }
  } catch { /* Cache files may already have been removed by the OS. */ }
}
