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
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        sessionRef.current = text;
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

  return { isListening, start, stop, supported: !!Recognition };
}
