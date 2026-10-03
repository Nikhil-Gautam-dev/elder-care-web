import { useCallback, useEffect, useState } from 'react';

const VOICE_URI_KEY = 'eldercare_voice_uri';

/** Maps the saved profile language to a BCP-47 tag (Spanish is not supported; falls back to Indian English). */
export function toSpeechLang(language?: string): string {
  return language === 'hi' ? 'hi-IN' : 'en-IN';
}

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

function voicesFor(lang: string): SpeechSynthesisVoice[] {
  const base = (lang.split('-')[0] ?? lang).toLowerCase();
  return window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith(base));
}

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(VOICE_URI_KEY);
  } catch {}
  const chosen = saved ? voices.find((v) => v.voiceURI === saved) : undefined;
  if (chosen) return chosen;
  const base = (lang.split('-')[0] ?? lang).toLowerCase();
  return (
    voices.find((v) => v.lang.replace('_', '-').toLowerCase() === lang.toLowerCase()) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(base))
  );
}

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceList, setVoiceList] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURIState] = useState<string>(() => {
    try {
      return localStorage.getItem(VOICE_URI_KEY) ?? '';
    } catch {
      return '';
    }
  });

  const setVoiceURI = useCallback((uri: string) => {
    setVoiceURIState(uri);
    try {
      if (uri) localStorage.setItem(VOICE_URI_KEY, uri);
      else localStorage.removeItem(VOICE_URI_KEY);
    } catch {}
  }, []);

  /** Refreshes the list of voices that match the given language. */
  const loadVoices = useCallback((lang: string) => {
    if (supported) setVoiceList(voicesFor(lang));
  }, []);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((text: string, lang: string) => {
    if (!supported || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    const voice = pickVoice(lang);
    if (voice) utterance.voice = voice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    if (!supported) return;
    // Some browsers load voices asynchronously; touching getVoices() primes the list.
    window.speechSynthesis.getVoices();
    window.addEventListener('beforeunload', stop);
    return () => {
      window.removeEventListener('beforeunload', stop);
      window.speechSynthesis.cancel();
    };
  }, [stop]);

  return { speak, stop, isSpeaking, supported, voiceList, loadVoices, voiceURI, setVoiceURI };
}
