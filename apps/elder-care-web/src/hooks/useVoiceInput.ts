import { useCallback, useEffect, useRef, useState } from 'react';

const SILENCE_MS = 2500;
const FATAL_ERRORS = [
  'not-allowed',
  'service-not-allowed',
  'audio-capture',
  'language-not-supported',
];

interface Options {
  lang: string;
  /** Called with the full text (typed + spoken) every time it changes. */
  onText: (text: string) => void;
  /** Called once when the user has stopped talking for a while. */
  onSilence: (text: string) => void;
  onError: (message: string) => void;
}

const join = (a: string, b: string) => [a.trim(), b.trim()].filter(Boolean).join(' ');

/**
 * Builds the text of one recognition session from its result list.
 * Desktop browsers give one entry per phrase, but Android Chrome/Brave give a new entry for every
 * partial result, each already holding the whole phrase so far ("I", "I want", "I want to"...).
 * Joining those naively repeats every word, so an entry that merely extends the previous one
 * replaces it.
 */
export function assembleTranscript(results: ArrayLike<ArrayLike<{ transcript: string }>>): string {
  const parts: string[] = [];
  for (let i = 0; i < results.length; i++) {
    const text = (results[i]?.[0]?.transcript ?? '').trim();
    if (!text) continue;
    const prev = parts[parts.length - 1];
    if (prev !== undefined && text.toLowerCase().startsWith(prev.toLowerCase())) {
      parts[parts.length - 1] = text;
    } else {
      parts.push(text);
    }
  }
  return parts.join(' ');
}

const Recognition: any =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : undefined;

/**
 * Continuous speech-to-text. The browser ends a recognition session at every pause,
 * so we restart it while the user still wants to listen and keep our own text buffer.
 */
export function useVoiceInput(options: Options) {
  const [isListening, setIsListening] = useState(false);
  const opts = useRef(options);
  opts.current = options;

  const recognitionRef = useRef<any>(null);
  const wantListening = useRef(false);
  const baseRef = useRef(''); // text already in the field when the mic started
  const committedRef = useRef(''); // speech from earlier recognition sessions
  const sessionRef = useRef(''); // speech (final + interim) of the current session
  const silenceTimer = useRef<ReturnType<typeof setTimeout>>();

  const fullText = () => join(join(baseRef.current, committedRef.current), sessionRef.current);

  const clearTimer = () => {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    silenceTimer.current = undefined;
  };

  const stop = useCallback(() => {
    wantListening.current = false;
    clearTimer();
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  /** Manual stop: end listening and drop what was dictated, keeping only the text typed before. */
  const cancel = useCallback(() => {
    stop();
    committedRef.current = '';
    sessionRef.current = '';
    opts.current.onText(baseRef.current);
  }, [stop]);

  const start = useCallback(
    (baseText: string) => {
      if (!Recognition) return;
      baseRef.current = baseText;
      committedRef.current = '';
      sessionRef.current = '';
      wantListening.current = true;

      const recognition = new Recognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = opts.current.lang;

      recognition.onresult = (event: any) => {
        // Late results can still arrive after stop(); they must not re-arm the silence timer.
        if (!wantListening.current) return;
        sessionRef.current = assembleTranscript(event.results);
        opts.current.onText(fullText());

        clearTimer();
        silenceTimer.current = setTimeout(() => {
          const finalText = fullText();
          stop();
          if (finalText.trim()) opts.current.onSilence(finalText);
        }, SILENCE_MS);
      };

      recognition.onerror = (event: any) => {
        if (!FATAL_ERRORS.includes(event.error)) return; // no-speech / aborted: just restart in onend
        wantListening.current = false;
        clearTimer();
        setIsListening(false);
        opts.current.onError(
          event.error === 'not-allowed' || event.error === 'service-not-allowed'
            ? 'Microphone access is blocked. Please allow it in your browser settings.'
            : 'Voice input is not available right now.',
        );
      };

      recognition.onend = () => {
        committedRef.current = join(committedRef.current, sessionRef.current);
        sessionRef.current = '';
        if (wantListening.current) {
          try {
            recognition.start(); // the browser ended the session on a pause; keep listening
          } catch {
            wantListening.current = false;
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
        setIsListening(true);
      } catch {
        wantListening.current = false;
      }
    },
    [stop],
  );

  useEffect(
    () => () => {
      wantListening.current = false;
      clearTimer();
      recognitionRef.current?.abort();
    },
    [],
  );

  return { isListening, start, stop, cancel, supported: !!Recognition };
}
