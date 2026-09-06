import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Connection } from './api';
export type Phrase = { id: string; text: string };
let webCode = '';
export async function loadConnection(): Promise<Connection> {
  const url = await AsyncStorage.getItem('kendrick.server') || '';
  const code = Platform.OS === 'web' ? webCode : await SecureStore.getItemAsync('kendrick.pairing') || '';
  return { url, code };
}
export async function saveConnection(connection: Connection) {
  if (Platform.OS === 'web') webCode = connection.code;
  else await SecureStore.setItemAsync('kendrick.pairing', connection.code);
  await AsyncStorage.setItem('kendrick.server', connection.url);
}
export async function forgetConnection() {
  if (Platform.OS === 'web') webCode = '';
  else await SecureStore.deleteItemAsync('kendrick.pairing');
  await AsyncStorage.removeItem('kendrick.server');
}
export async function loadPhrases(): Promise<Phrase[]> {
  try {
    const data: unknown = JSON.parse(await AsyncStorage.getItem('kendrick.phrases.v1') || '[]');
    if (!Array.isArray(data)) return [];
    return data.filter((p): p is Phrase => !!p && typeof p.id === 'string' && typeof p.text === 'string').slice(0, 100);
  } catch { return []; }
}
export async function storePhrases(phrases: Phrase[]) { await AsyncStorage.setItem('kendrick.phrases.v1', JSON.stringify(phrases)); }
