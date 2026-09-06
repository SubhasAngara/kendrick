import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Keyboard, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Feather from '@expo/vector-icons/Feather';
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder } from 'expo-audio';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as ExpoLinking from 'expo-linking';
import { useFonts } from 'expo-font';
import { InstrumentSerif_400Regular } from '@expo-google-fonts/instrument-serif/400Regular';
import { InstrumentSerif_400Regular_Italic } from '@expo-google-fonts/instrument-serif/400Regular_Italic';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold';
import { Connection, Health, Suggestion, deleteRecording, normalizeServer, request, uploadRecording } from './src/api';
import { Phrase, forgetConnection, loadConnection, loadPhrases, saveConnection, storePhrases } from './src/storage';
import { C, s } from './src/theme';
import { useRecorderStatus } from './src/useRecorderStatus';

type Tab = 'speak' | 'phrases' | 'settings';
type Stage = 'idle' | 'preparing' | 'recording' | 'transcribing' | 'words' | 'composing' | 'review';
type Icon = React.ComponentProps<typeof Feather>['name'];
const QUICK = ['Please give me a moment.', 'Could you say that again?', 'I’d like to tell you something.'];
const tick = () => { if (Platform.OS !== 'web') void Haptics.selectionAsync().catch(() => {}); };
const errorText = (e: unknown) => e instanceof Error ? e.message : 'Something went wrong. Your words are still here.';
function Button({ title, icon, onPress, disabled = false, secondary = false }: { title: string; icon?: Icon; onPress: () => void; disabled?: boolean; secondary?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} onPress={onPress} disabled={disabled} style={({ pressed }) => [s.button, secondary && s.secondaryButton, disabled && s.disabled, pressed && s.pressed]}>
    {icon && <Feather name={icon} size={19} color={secondary ? C.ink : C.paper} />}<Text style={[s.buttonText, secondary && { color: C.ink }]}>{title}</Text>
  </Pressable>;
}
function Action({ title, icon, onPress, disabled }: { title: string; icon: Icon; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} disabled={disabled} onPress={onPress} style={({ pressed }) => [s.smallAction, disabled && s.disabled, pressed && s.pressed]}><Feather name={icon} size={20} color={C.ink} /><Text style={s.smallActionText}>{title}</Text></Pressable>;
}
export default function App() {
  const [loaded, fontError] = useFonts({ InstrumentSerif_400Regular, InstrumentSerif_400Regular_Italic, DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold });
  if (!loaded && !fontError) return <View style={[s.fill, s.loading]}><ActivityIndicator color={C.ink} /></View>;
  return <SafeAreaProvider><Kendrick /></SafeAreaProvider>;
}

function Kendrick() {
  const [tab, setTab] = useState<Tab>('speak');
  const [stage, setStage] = useState<Stage>('idle');
  const [words, setWords] = useState('');
  const [draft, setDraft] = useState('');
  const [clarification, setClarification] = useState('');
  const [connection, setConnection] = useState<Connection>({ url: '', code: '' });
  const [serverInput, setServerInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [health, setHealth] = useState<Health | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [phraseInput, setPhraseInput] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [levels, setLevels] = useState<number[]>(Array(29).fill(3));
  const activeRequest = useRef<AbortController | null>(null);
  const stageRef = useRef(stage);
  const wordsValue = useRef(words);
  const recordingBusy = useRef(false);
  const connectionBusy = useRef(false);
  const phraseBusy = useRef(false);
  const recordingURI = useRef<string | null>(null);
  const mounted = useRef(true);
  const wordsRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
  const audio = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, numberOfChannels: 1, isMeteringEnabled: true });
  const audioLifetime = useRef<typeof audio | null>(audio);
  const audioState = useRecorderStatus(audio, stage === 'recording', () => {
    setStage(wordsValue.current.trim() ? 'words' : 'idle');
    setError('The microphone session was interrupted. Tap Listen to start a new recording.');
  });
  const busy = ['preparing', 'recording', 'transcribing', 'composing'].includes(stage);
  stageRef.current = stage; wordsValue.current = words;

  useLayoutEffect(() => {
    audioLifetime.current = audio;
    return () => {
      audioLifetime.current = null;
      // Layout cleanup runs before Expo releases its native recorder. No native
      // getters are used here or after stop settles.
      const uri = recordingURI.current;
      if (stageRef.current === 'recording' || stageRef.current === 'preparing') {
        try { void audio.stop().catch(() => {}).finally(() => deleteRecording(uri)); }
        catch { deleteRecording(uri); }
      }
    };
  }, [audio]);

  useEffect(() => {
    mounted.current = true;
    Promise.all([loadConnection(), loadPhrases()]).then(([saved, savedPhrases]) => {
      if (!mounted.current) return;
      setConnection(saved); setServerInput(saved.url); setCodeInput(saved.code); setPhrases(savedPhrases);
      if (saved.url && saved.code) request<Health>(saved, '/health').then(h => mounted.current && setHealth(h)).catch(() => {});
    }).catch(() => setNotice('Your saved settings could not be loaded. You can still type a message.'));
    const handleURL = ({ url }: { url: string }) => {
      const parsed = ExpoLinking.parse(url);
      if ((parsed.path === 'listen' || parsed.hostname === 'listen') && !['recording', 'preparing'].includes(stageRef.current)) setTab('speak');
    };
    ExpoLinking.getInitialURL().then(url => { if (url) handleURL({ url }); });
    const links = ExpoLinking.addEventListener('url', handleURL);
    const states = AppState.addEventListener('change', state => {
      if (state !== 'active' && stageRef.current === 'recording') void interruptRecording();
      if (state !== 'active') { void Speech.stop(); setSpeaking(false); }
    });
    return () => { mounted.current = false; activeRequest.current?.abort(); links.remove(); states.remove(); void Speech.stop().catch(() => {}); deleteRecording(recordingURI.current); };
  }, []);
  useEffect(() => {
    if (stage !== 'recording') return;
    if (audioState.url) recordingURI.current = audioState.url;
    const meter = audioState.metering;
    if (meter !== undefined) setLevels(old => [...old.slice(1), Math.max(3, Math.min(54, (meter + 60) * 0.9))]);
    if (audioState.durationMillis >= 119000) void finishRecording();
    if (audioState.mediaServicesDidReset) void interruptRecording();
  }, [audioState.durationMillis, audioState.metering, audioState.mediaServicesDidReset, stage]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 5000); return () => clearTimeout(timer); }, [notice]);
  useEffect(() => { scrollRef.current?.scrollTo({ y: 0, animated: false }); }, [tab, stage]);

  async function speak(text: string) {
    if (!text.trim()) return;
    try {
      await Speech.stop(); await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }); setSpeaking(true);
      Speech.speak(text, { language: 'en-US', rate: 0.9, useApplicationAudioSession: false,
        onDone: () => setSpeaking(false), onStopped: () => setSpeaking(false),
        onError: () => { setSpeaking(false); setError('Speech playback is unavailable. You can copy or share your message.'); } });
    } catch (e) { setSpeaking(false); setError(errorText(e)); }
  }
  async function stopSpeech() { await Speech.stop(); setSpeaking(false); }
  function cancelRequest() { activeRequest.current?.abort(); activeRequest.current = null; setStage(words.trim() ? 'words' : 'idle'); setError(''); }
  function startOver() { cancelRequest(); void stopSpeech(); setWords(''); setDraft(''); setClarification(''); setStage('idle'); setError(''); }
  function typeInstead() { setStage('words'); setError(''); setTimeout(() => wordsRef.current?.focus(), 100); }
  async function ensureMicPermission() {
    const current = await AudioModule.getRecordingPermissionsAsync();
    if (current.granted) return true;
    const asked = await AudioModule.requestRecordingPermissionsAsync();
    if (asked.granted) return true;
    if (Platform.OS === 'web') {
      throw new Error('Browser microphone is blocked or missing. Allow mic access for this site, or plug in a headset. You can still type.');
    }
    throw new Error('OPEN_MIC_SETTINGS');
  }
  async function openMicSettings() {
    setError('');
    try { await Linking.openSettings(); }
    catch { setNotice('Open iPhone Settings → Expo Go → Microphone, turn it on, then return here.'); }
  }
  async function startRecording() {
    if (recordingBusy.current || busy) return;
    if (!connection.url || !connection.code) { setTab('settings'); setNotice('Connect your computer once to start listening.'); return; }
    recordingBusy.current = true; setStage('preparing'); setError(''); Keyboard.dismiss();
    try {
      await stopSpeech();
      await ensureMicPermission();
      if (!mounted.current || audioLifetime.current !== audio) return;
      if (AppState.currentState !== 'active') throw new Error('Return to Kendrick and tap Listen to begin.');
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true, allowsBackgroundRecording: false });
      if (!mounted.current || audioLifetime.current !== audio) return;
      await audio.prepareToRecordAsync();
      if (!mounted.current || audioLifetime.current !== audio) return;
      recordingURI.current = audio.uri;
      if (AppState.currentState !== 'active') { await audio.stop(); deleteRecording(audio.uri); throw new Error('Return to Kendrick and tap Listen to begin.'); }
      audio.record({ forDuration: 120 });
      setLevels(Array(29).fill(3)); setStage('recording'); tick();
    } catch (e) {
      void setAudioModeAsync({ allowsRecording: false });
      const message = errorText(e);
      setError(message === 'OPEN_MIC_SETTINGS'
        ? 'Microphone is off for Expo Go. Tap Open Settings, enable Microphone, then come back and tap Listen.'
        : message);
      setStage(words.trim() ? 'words' : 'idle');
    }
    finally { recordingBusy.current = false; }
  }
  async function interruptRecording() {
    if (recordingBusy.current) return;
    recordingBusy.current = true;
    try { await audio.stop(); deleteRecording(audio.uri); } catch {}
    finally {
      recordingBusy.current = false; void setAudioModeAsync({ allowsRecording: false });
      if (mounted.current) { setStage(wordsValue.current.trim() ? 'words' : 'idle'); setNotice('Recording stopped when Kendrick was interrupted. Tap Listen to try again.'); }
    }
  }
  async function cancelRecording() { await interruptRecording(); setNotice('Recording discarded.'); }
  async function finishRecording() {
    if (recordingBusy.current || stageRef.current !== 'recording') return;
    recordingBusy.current = true;
    const controller = new AbortController(); activeRequest.current = controller; setStage('transcribing'); tick();
    try {
      await audio.stop();
      if (!mounted.current || audioLifetime.current !== audio) return;
      await setAudioModeAsync({ allowsRecording: false });
      if (!mounted.current || audioLifetime.current !== audio) return;
      const uri = audio.uri; recordingURI.current = uri;
      if (!uri) throw new Error('No recording was captured. Try again or type your words.');
      const result = await uploadRecording(connection, uri, controller.signal);
      if (activeRequest.current !== controller || !mounted.current) return;
      setWords(result.transcript); setDraft(''); setClarification(''); setStage('words'); setNotice('Check what was heard before making a sentence.');
    } catch (e) {
      if (activeRequest.current === controller && mounted.current) { setError(errorText(e)); setStage(words.trim() ? 'words' : 'idle'); }
    } finally {
      deleteRecording(recordingURI.current); recordingURI.current = null; recordingBusy.current = false;
      if (activeRequest.current === controller) activeRequest.current = null;
    }
  }
  async function compose() {
    if (!words.trim() || busy || activeRequest.current) return;
    if (!connection.url || !connection.code) { setTab('settings'); setNotice('Connect your computer for suggestions. You can use your own words anytime.'); return; }
    const controller = new AbortController(); activeRequest.current = controller;
    setError(''); setClarification(''); setDraft(''); setStage('composing'); Keyboard.dismiss();
    try {
      const result = await request<Suggestion>(connection, '/compose', JSON.stringify({ text: words }), controller.signal);
      if (activeRequest.current !== controller || !mounted.current) return;
      if (result.status === 'clarify') { setClarification(result.question); setStage('words'); }
      else if (result.status === 'draft' && result.sentence.trim()) { setDraft(result.sentence); setStage('review'); }
      else throw new Error('No usable sentence was returned. You can edit and use your own words.');
    } catch (e) {
      if (activeRequest.current === controller && mounted.current) { setError(errorText(e)); setStage('words'); }
    } finally { if (activeRequest.current === controller) activeRequest.current = null; }
  }
  async function connect() {
    if (connectionBusy.current) return;
    connectionBusy.current = true; setConnecting(true); setError('');
    try {
      const next = { url: normalizeServer(serverInput), code: codeInput.trim() };
      if (!next.code) throw new Error('Enter the pairing code shown on your computer.');
      const result = await request<Health>(next, '/health'); await saveConnection(next); setConnection(next); setHealth(result);
      setNotice(result.speech_ready && result.suggestions_ready ? 'Connected. Kendrick is ready to listen.' : 'Connected. The computer is still starting its models.');
    } catch (e) { setHealth(null); setError(errorText(e)); }
    finally { connectionBusy.current = false; setConnecting(false); }
  }
  async function addPhrase(text: string) {
    if (!text.trim() || phraseBusy.current) return;
    if (phrases.length >= 100) { setError('Your phrasebook is full. Remove a phrase before adding another.'); return; }
    if (phrases.some(p => p.text === text.trim())) { setNotice('Already in your phrasebook.'); return; }
    phraseBusy.current = true;
    try { const next = [{ id: String(Date.now()), text: text.trim() }, ...phrases]; await storePhrases(next); setPhrases(next); setPhraseInput(''); setNotice('Saved to your phrasebook.'); }
    catch { setError('Could not save this phrase. Your message is still here.'); }
    finally { phraseBusy.current = false; }
  }
  async function removePhrase(id: string) {
    if (phraseBusy.current) return; phraseBusy.current = true;
    try { const next = phrases.filter(p => p.id !== id); await storePhrases(next); setPhrases(next); setNotice('Phrase removed.'); }
    catch { setError('Could not remove that phrase. Please try again.'); }
    finally { phraseBusy.current = false; }
  }
  function review(text: string) { setWords(text); setDraft(text); setStage('review'); setTab('speak'); setClarification(''); setError(''); Keyboard.dismiss(); }
  const secs = Math.floor(audioState.durationMillis / 1000);
  const quickRows = (items: string[]) => items.map(phrase => <Pressable accessibilityRole="button" key={phrase} onPress={() => review(phrase)} style={s.quickRow}><Text style={s.quickText}>{phrase}</Text><Feather name="arrow-up-right" size={19} color={C.ink} /></Pressable>);

  return <SafeAreaView style={s.fill} edges={['top', 'bottom']}><StatusBar style="dark" />
    <KeyboardAvoidingView style={s.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><View style={s.shell}>
      <View style={s.header}><Text style={s.wordmark}>Kendrick</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Connection settings" disabled={busy} onPress={() => { setTab('settings'); setError(''); }} style={s.status}><View style={[s.dot, { backgroundColor: health?.speech_ready && health?.suggestions_ready ? C.green : C.muted }]} /><Text style={s.statusText}>{health?.speech_ready && health?.suggestions_ready ? 'Local AI' : 'Set up'}</Text></Pressable>
      </View>
      <ScrollView ref={scrollRef} style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {notice ? <View style={s.notice}><Text accessibilityLiveRegion="polite" style={s.noticeText}>{notice}</Text></View> : null}
        {error ? <View style={s.error}>
          <Text accessibilityRole="alert" style={s.errorText}>{error}</Text>
          <View style={{ flexDirection: 'row', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
            {error.includes('Microphone is off for Expo Go') ? (
              <Pressable accessibilityRole="button" onPress={() => void openMicSettings()} style={s.dismiss}><Text style={s.link}>Open Settings</Text></Pressable>
            ) : null}
            <Pressable accessibilityRole="button" onPress={() => setError('')} style={s.dismiss}><Text style={s.link}>Dismiss</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={typeInstead} style={s.dismiss}><Text style={s.link}>Type instead</Text></Pressable>
          </View>
        </View> : null}
        {tab === 'speak' && <>
          {stage === 'idle' && <>
            <Text style={s.eyebrow}>YOUR VOICE. YOUR PACE.</Text><Text accessibilityRole="header" style={s.hero}>Make room for{'\n'}<Text style={s.italic}>your words.</Text></Text><Text style={s.subtitle}>A thought, a few words, a little time.{'\n'}Start wherever you are.</Text>
            <View style={s.listenArea}><Pressable accessibilityRole="button" accessibilityLabel="Listen" accessibilityHint="Starts a recording after asking for microphone permission" onPress={startRecording} style={({ pressed }) => [s.micOuter, pressed && s.pressed]}><View style={s.micCircle}><Feather name="mic" size={34} color={C.paper} /></View></Pressable><Text style={s.listenLabel}>Tap to listen</Text><Text style={[s.caption, s.center]}>Pause as long as you need. Tap Done when ready.</Text></View>
            <Button title="I’d rather type" icon="edit-3" onPress={typeInstead} secondary /><View style={s.sectionHeader}><Text style={s.eyebrow}>A FEW WORDS TO START</Text><Feather name="corner-down-right" size={16} color={C.muted} /></View>{quickRows(QUICK.slice(0, 2))}
          </>}
          {stage === 'recording' && <>
            <Text style={s.eyebrow}>THE FLOOR IS YOURS</Text><Text accessibilityRole="header" style={s.hero}>I’m listening.</Text><Text style={s.subtitle}>Take your time. There’s no need to rush.</Text>
            <View style={s.recordingCard}><View style={s.recordingBadge}><View style={s.recordingDot} /><Text style={s.inverseSmall}>MICROPHONE ON</Text></View><View style={s.wave} accessible accessibilityLabel="Recording audio"><View style={s.waveInner}>{levels.map((level, i) => <View key={i} style={[s.bar, { height: level }]} />)}</View></View><Text style={s.timer}>{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</Text><Text style={s.inverseCaption}>Up to 2 minutes per message</Text></View>
            <Button title="Done listening" icon="square" onPress={finishRecording} /><Button title="Discard recording" onPress={cancelRecording} secondary />
          </>}
          {['preparing', 'transcribing', 'composing'].includes(stage) && <View style={s.processing}><ActivityIndicator color={C.ink} size="large" /><Text style={s.processingTitle}>{stage === 'preparing' ? 'One moment.' : stage === 'transcribing' ? 'Finding your words.' : 'A little clarity.'}</Text><Text style={[s.subtitle, s.center]}>{stage === 'preparing' ? 'Getting your microphone ready.' : stage === 'transcribing' ? 'Your computer is transcribing the recording.' : 'Your computer is shaping a suggestion. You’ll have the final say.'}</Text>{stage !== 'preparing' && <Button title="Cancel" onPress={cancelRequest} secondary />}</View>}
          {stage === 'words' && <>
            <Text style={s.eyebrow}>01 / YOUR WORDS</Text><Text accessibilityRole="header" style={s.pageTitle}>What would you{'\n'}like to say?</Text><Text style={s.subtitle}>Check these words first. Change anything that doesn’t sound like you.</Text>
            {clarification ? <View style={s.clarification}><Feather name="help-circle" size={21} color={C.ink} /><View style={s.flex}><Text style={s.clarifyTitle}>A little more context</Text><Text accessibilityLiveRegion="polite" style={s.body}>{clarification}</Text><Text style={s.caption}>Add that detail to your words below.</Text></View></View> : null}
            <TextInput ref={wordsRef} accessibilityLabel="Your words" multiline maxLength={1800} placeholder="A sentence, a few words, a thought…" placeholderTextColor={C.muted} value={words} onChangeText={value => { setWords(value); setDraft(''); setClarification(''); }} style={s.editor} textAlignVertical="top" /><Text style={s.fieldHint}>Keep names, numbers, and words like “not” exactly right.</Text>
            <Button title="Help me make a sentence" icon="arrow-right" onPress={compose} disabled={!words.trim()} /><Button title="Use my words as they are" onPress={() => review(words.trim())} disabled={!words.trim()} secondary />
            <View style={s.actions}><Action title="Listen again" icon="mic" onPress={startRecording} /><Action title="Start over" icon="rotate-ccw" onPress={startOver} /></View>
          </>}
          {stage === 'review' && <>
            <Text style={s.eyebrow}>02 / YOUR SAY</Text><Text accessibilityRole="header" style={s.pageTitle}>Does this{'\n'}sound like you?</Text><Text style={s.subtitle}>Every word is yours to change.</Text>
            <View style={s.draftCard}><Text style={s.eyebrow}>YOUR MESSAGE</Text><TextInput accessibilityLabel="Your message" value={draft} onChangeText={value => { void stopSpeech(); setDraft(value); }} multiline maxLength={2200} textAlignVertical="top" style={s.draftEditor} /></View>
            {words !== draft && <View style={s.original}><Text style={s.eyebrow}>YOUR ORIGINAL WORDS</Text><Text selectable style={s.body}>{words}</Text></View>}<Text style={s.fieldHint}>Check the meaning before speaking or sharing.</Text>
            <Button title={speaking ? 'Stop speaking' : 'Speak this message'} icon={speaking ? 'square' : 'volume-2'} onPress={() => speaking ? void stopSpeech() : void speak(draft)} disabled={!draft.trim()} />
            <View style={s.actions}><Action title="Copy" icon="copy" disabled={!draft.trim()} onPress={() => { Clipboard.setStringAsync(draft).then(() => setNotice('Message copied.')).catch(() => setError('Could not copy your message.')); }} /><Action title="Share" icon="share" disabled={!draft.trim()} onPress={() => { Share.share({ message: draft }).catch(() => setError('Sharing is unavailable. Try copying your message.')); }} /><Action title="Save" icon="bookmark" disabled={!draft.trim()} onPress={() => void addPhrase(draft)} /></View>
            <View style={s.reviewFooter}><Pressable accessibilityRole="button" onPress={() => { void stopSpeech(); setStage('words'); }} style={s.textButton}><Text style={s.link}>Back to my words</Text></Pressable><Pressable accessibilityRole="button" onPress={startOver} style={s.textButton}><Text style={s.link}>New message →</Text></Pressable></View>
          </>}
        </>}
        {tab === 'phrases' && <>
          <Text style={s.eyebrow}>ALWAYS WITH YOU</Text><Text accessibilityRole="header" style={s.pageTitle}>Your phrasebook.</Text><Text style={s.subtitle}>For the things you say again and again.{'\n'}Saved on this device, ready when you need them.</Text>
          <TextInput accessibilityLabel="New phrase" placeholder="Add your own phrase…" placeholderTextColor={C.muted} value={phraseInput} onChangeText={setPhraseInput} multiline maxLength={1800} style={[s.input, s.phraseInput]} /><Button title="Save phrase" icon="plus" onPress={() => void addPhrase(phraseInput)} disabled={!phraseInput.trim()} secondary />
          <View style={s.sectionHeader}><Text style={s.eyebrow}>YOUR SAVED PHRASES</Text><Text style={s.caption}>{phrases.length}</Text></View>{phrases.length === 0 && <Text style={s.empty}>A familiar phrase is one less thing to find.{'\n'}Save your first one above.</Text>}
          {phrases.map(phrase => <View key={phrase.id} style={s.phraseRow}><Pressable accessibilityRole="button" accessibilityLabel={`Review phrase: ${phrase.text}`} onPress={() => review(phrase.text)} style={s.phraseMain}><Text style={s.phraseText}>{phrase.text}</Text><Text style={s.caption}>Tap to review, speak, or share</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Delete phrase: ${phrase.text}`} onPress={() => void removePhrase(phrase.id)} style={s.deleteButton}><Feather name="x" size={20} color={C.muted} /></Pressable></View>)}
          <View style={s.sectionHeader}><Text style={s.eyebrow}>START WITH THESE</Text></View>{quickRows(QUICK)}
        </>}
        {tab === 'settings' && <>
          <Text style={s.eyebrow}>MADE TO BE YOURS</Text><Text accessibilityRole="header" style={s.pageTitle}>A quiet connection.</Text><Text style={s.subtitle}>Your phone listens. Your computer helps with the words. No paid AI account needed.</Text>
          <View style={s.connectionCard}><View style={s.connectionIcons}><Feather name="smartphone" size={26} color={C.ink} /><View style={s.connectionLine} /><Feather name="monitor" size={26} color={C.ink} /></View><Text style={s.connectionTitle}>{health?.speech_ready && health?.suggestions_ready ? 'Your local AI is ready.' : 'Connect to your computer.'}</Text><Text style={s.body}>Keep both devices on the same trusted Wi-Fi and leave the Kendrick server running.</Text></View>
          <Text style={s.label}>Computer address</Text><TextInput accessibilityLabel="Computer address" value={serverInput} onChangeText={setServerInput} placeholder="http://192.168.1.20:8787" placeholderTextColor={C.muted} autoCapitalize="none" autoCorrect={false} keyboardType="url" style={s.input} />
          <Text style={s.label}>Pairing code</Text><TextInput accessibilityLabel="Pairing code" value={codeInput} onChangeText={setCodeInput} placeholder="Shown on your computer" placeholderTextColor={C.muted} autoCapitalize="none" autoCorrect={false} secureTextEntry style={s.input} /><Button title={connecting ? 'Connecting…' : 'Connect & check'} icon="link" onPress={connect} disabled={connecting || !serverInput.trim() || !codeInput.trim()} />
          {health && <View style={s.healthRow}><Text style={s.caption}>Speech: {health.speech_ready ? 'ready' : 'starting'}</Text><Text style={s.caption}>Suggestions: {health.suggestions_ready ? 'ready' : 'starting'}</Text></View>}
          {connection.code ? <Pressable accessibilityRole="button" style={s.textButton} onPress={() => { forgetConnection().then(() => { setConnection({ url: '', code: '' }); setCodeInput(''); setHealth(null); setNotice('Computer disconnected.'); }).catch(() => setError('Could not clear the connection.')); }}><Text style={s.link}>Disconnect this computer</Text></Pressable> : null}
          <View style={s.settingsSection}><Feather name="shield" size={22} /><Text style={s.settingTitle}>Your words stay in your hands.</Text><Text style={s.body}>Audio is sent to your computer for transcription, then deleted from both devices. Messages stay on screen only, unless you save a phrase, copy, or share them.</Text><Text style={s.caption}>This local prototype uses unencrypted Wi-Fi traffic. Use a trusted private network. Speech recognition can miss words; always review the transcript and suggestion.</Text></View>
          <View style={s.settingsSection}><Feather name="zap" size={22} /><Text style={s.settingTitle}>Get to Listen faster.</Text><Text style={s.body}>For this preview, open Kendrick from Expo Go. The standalone build supports a shortcut to kendrick://listen. Opening it brings you here; tap Listen to turn on the microphone.</Text><Text style={s.caption}>The iOS keyboard extension and direct Action Button recording are planned next.</Text></View>
          <Pressable accessibilityRole="link" style={s.textButton} onPress={() => Linking.openSettings()}><Text style={s.link}>Open device permissions ↗</Text></Pressable><Text style={s.buildNote}>Kendrick · iPhone prototype 0.1{'\n'}Whisper + Qwen · running on your computer</Text>
        </>}
      </ScrollView>
      {speaking && stage !== 'review' && <Button title="Stop speaking" icon="square" onPress={() => void stopSpeech()} />}
      <View style={s.nav} accessibilityRole="tablist">{([{ key: 'speak', icon: 'mic', label: 'Speak' }, { key: 'phrases', icon: 'bookmark', label: 'Phrases' }, { key: 'settings', icon: 'sliders', label: 'Settings' }] as const).map(item => <Pressable key={item.key} accessibilityRole="tab" accessibilityState={{ selected: tab === item.key, disabled: busy }} disabled={busy} onPress={() => { setTab(item.key); setError(''); tick(); Keyboard.dismiss(); }} style={s.navItem}><Feather name={item.icon} size={21} color={tab === item.key ? C.ink : C.muted} /><Text style={[s.navLabel, tab === item.key && s.navSelected]}>{item.label}</Text><View style={[s.navDot, { opacity: tab === item.key ? 1 : 0 }]} /></Pressable>)}</View>
    </View></KeyboardAvoidingView>
  </SafeAreaView>;
}
