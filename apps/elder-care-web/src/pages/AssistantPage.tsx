import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAssistantSession } from '../context/AssistantSessionContext';
import { useSpeech, toSpeechLang } from '../hooks/useSpeech';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { toSpeakableText } from '../utils/speechText';
import { Button, ConfirmDialog } from '../components/ui';
import { VoiceStage } from '../components/assistant/VoiceStage';
import { ConversationPanel } from '../components/assistant/ConversationPanel';
import { AssistantSettings } from '../components/assistant/AssistantSettings';

const VOICE_OUTPUT_KEY = 'eldercare_voice_output';
const LANG_KEY = 'eldercare_speech_lang';
const AUTO_SEND_SECONDS = 3;

const SUGGESTIONS = [
  'Order my usual medicine.',
  'Book a cab to the clinic.',
  'Tell my son I need help.',
  'What medicines are due today?',
];

/**
 * The agent asks for a "yes" before acting. If its latest reply ends in a yes/no question we offer
 * buttons for it; the reply text stays visible and speaking or typing "yes"/"no" works just the same.
 */
const asksForConfirmation = (reply: string): boolean => {
  const tail = reply.trim().slice(-220);
  if (!tail.endsWith('?')) return false;
  // Open questions ("What time should I book it for?") need an answer, not a yes/no.
  const lastSentence = tail.split(/(?<=[.!?])\s+/).pop() ?? tail;
  if (/^(what|which|when|where|who|whom|how|why)\b/i.test(lastSentence.trim())) return false;
  return /\b(shall i|should i|would you like me to|do you want me to|can i (go ahead|proceed|place|book|send|save|stop)|go ahead|is (that|this|everything) (correct|right|okay|ok)|is that (correct|right)|confirm|ok\?|okay\?|right\?|correct\?)/i.test(
    tail,
  );
};

export const AssistantPage: React.FC = () => {
  const { user } = useAuth();
  const { messages, loading, send, reset } = useAssistantSession();
  const [searchParams, setSearchParams] = useSearchParams();

  const [lang, setLang] = useState<'en' | 'hi'>(() => {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'en' || saved === 'hi') return saved;
    return user?.preferences?.language === 'hi' ? 'hi' : 'en';
  });
  const speechLang = toSpeechLang(lang);

  const {
    speak,
    stop,
    isSpeaking,
    supported: ttsSupported,
    voiceList,
    loadVoices,
    voiceURI,
    setVoiceURI,
  } = useSpeech();
  const [voiceOutput, setVoiceOutput] = useState<boolean>(() => {
    const saved = localStorage.getItem(VOICE_OUTPUT_KEY);
    return saved !== null ? saved === 'true' : (user?.accessibility?.voiceEnabled ?? true);
  });

  const [input, setInput] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [countdownRun, setCountdownRun] = useState(0);
  const [voiceError, setVoiceError] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  /** Only a reply that arrived while this page was open is revealed word by word. */
  const [animateId, setAnimateId] = useState<string | null>(null);
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelToggleRef = useRef<HTMLButtonElement>(null);
  const pendingTextRef = useRef('');

  // "Book a ride" etc. from Home: prefill the box (never auto-send) and let the user review it.
  useEffect(() => {
    const ask = searchParams.get('ask');
    if (!ask) return;
    setInput(ask);
    inputRef.current?.focus();
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const {
    isListening,
    start: startListening,
    stop: stopListening,
    cancel: cancelListening,
    supported: micSupported,
  } = useVoiceInput({
    lang: speechLang,
    onText: setInput,
    onSilence: (text) => {
      pendingTextRef.current = text;
      setCountdownRun((n) => n + 1);
      setCountdown(AUTO_SEND_SECONDS);
    },
    onError: (m) => setVoiceError(`${m} You can type your request instead.`),
  });

  const cancelCountdown = () => setCountdown(null);

  const handleSend = async (e?: React.FormEvent, override?: string) => {
    if (e) e.preventDefault();
    const text = (override ?? input).trim();
    if (!text || loading) return;

    stop();
    stopListening();
    cancelCountdown();
    setVoiceError('');
    setInput('');

    const result = await send(text);
    if (result && !result.error) {
      setAnimateId(result.id);
      if (voiceOutput) speak(toSpeakableText(result.text), speechLang);
    }
  };

  const toggleVoiceInput = () => {
    if (!micSupported) {
      setVoiceError(
        'Voice input is not supported in this browser. Please try Chrome or Edge, or type your request.',
      );
      return;
    }
    setVoiceError('');
    if (isListening) {
      cancelListening();
      cancelCountdown();
    } else {
      stop();
      cancelCountdown();
      startListening(input);
    }
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      setCountdown(null);
      void handleSend(undefined, pendingTextRef.current);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    if (!ttsSupported) return;
    loadVoices(speechLang);
    // Voices often load asynchronously after the first render.
    const refresh = () => loadVoices(speechLang);
    window.speechSynthesis.addEventListener('voiceschanged', refresh);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', refresh);
  }, [ttsSupported, speechLang, loadVoices]);

  const handleVoiceChange = (uri: string) => {
    setVoiceURI(uri);
    // Wait a tick so speak() reads the newly saved voice from localStorage.
    setTimeout(() => speak('Hello, this is how I sound.', speechLang), 0);
  };

  const toggleVoiceOutput = () => {
    const next = !voiceOutput;
    setVoiceOutput(next);
    localStorage.setItem(VOICE_OUTPUT_KEY, String(next));
    if (!next) stop();
  };

  const changeLang = (next: 'en' | 'hi') => {
    stopListening();
    stop();
    setLang(next);
    localStorage.setItem(LANG_KEY, next);
  };

  const doReset = async () => {
    setConfirmReset(false);
    stop();
    stopListening();
    cancelCountdown();
    setInput('');
    setVoiceError('');
    setAnimateId(null);
    setPanelOpen(false);
    await reset();
  };

  const closePanel = () => {
    setPanelOpen(false);
    panelToggleRef.current?.focus();
  };

  // Keyboard shortcuts. The ref always holds the latest handlers so the listener is bound once.
  const shortcutsRef = useRef<(e: KeyboardEvent) => void>(() => {});
  shortcutsRef.current = (e) => {
    if (confirmReset || panelOpen) return;
    if (e.key === 'Escape') {
      if (countdown !== null) cancelCountdown();
      else if (isListening) cancelListening();
      else if (isSpeaking) stop();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      cancelCountdown();
      void handleSend(undefined, countdown !== null ? pendingTextRef.current : undefined);
      return;
    }
    if (!e.altKey || e.ctrlKey || e.metaKey) return;
    // e.code is layout/modifier independent (Alt+letter types special chars on macOS).
    switch (e.code) {
      case 'KeyM':
        if (!loading) toggleVoiceInput();
        break;
      case 'KeyS':
        cancelCountdown();
        void handleSend(undefined, countdown !== null ? pendingTextRef.current : undefined);
        break;
      case 'KeyV':
        if (ttsSupported) toggleVoiceOutput();
        break;
      case 'KeyX':
        stop();
        break;
      case 'KeyI':
        inputRef.current?.focus();
        break;
      case 'KeyR':
        setConfirmReset(true);
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => shortcutsRef.current(e);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const last = messages[messages.length - 1];
  const reply = last?.sender === 'assistant' ? last : undefined;
  const lastUserText = [...messages].reverse().find((m) => m.sender === 'user')?.text;
  const animateReply = !!reply && reply.id === animateId;
  const revealDone = !animateReply || revealedId === reply?.id;
  const showConfirm = !!reply && !reply.error && !loading && asksForConfirmation(reply.text);
  const showSuggestions = messages.length === 0 && !loading && !isListening && countdown === null;

  return (
    <div className="voice-page">
      <div className="voice-header">
        <h1>Talk to ElderCare</h1>
        <div className="voice-tools">
          <button
            type="button"
            ref={panelToggleRef}
            className="btn btn-secondary btn-small"
            aria-haspopup="dialog"
            onClick={() => setPanelOpen(true)}
          >
            <MessageSquare size={18} aria-hidden="true" /> Conversation
            {messages.length > 0 && <span className="count-pill">{messages.length}</span>}
          </button>
          <AssistantSettings
            lang={lang}
            onLang={changeLang}
            ttsSupported={ttsSupported}
            voiceOutput={voiceOutput}
            onToggleVoiceOutput={toggleVoiceOutput}
            voices={voiceList}
            voiceURI={voiceURI}
            onVoice={handleVoiceChange}
            onNewConversation={() => setConfirmReset(true)}
          />
        </div>
      </div>

      <VoiceStage
        isListening={isListening}
        micSupported={micSupported}
        isSpeaking={isSpeaking}
        loading={loading}
        countdown={countdown}
        countdownRun={countdownRun}
        liveText={input}
        lastUserText={lastUserText}
        reply={reply}
        animateReply={animateReply}
        revealDone={revealDone}
        onRevealDone={() => reply && setRevealedId(reply.id)}
        showConfirm={showConfirm}
        voiceError={voiceError}
        onToggleMic={toggleVoiceInput}
        onCancelCountdown={cancelCountdown}
        onSendNow={() => {
          cancelCountdown();
          void handleSend(undefined, pendingTextRef.current);
        }}
        onStopSpeaking={stop}
        onAnswer={(t) => void handleSend(undefined, t)}
        onRetry={(t) => void handleSend(undefined, t)}
      />

      <form onSubmit={handleSend} className="type-bar">
        <label htmlFor="assistant-input" className="sr-only">
          Type your request
        </label>
        <input
          id="assistant-input"
          type="text"
          ref={inputRef}
          className="input-field"
          placeholder="Or type here, e.g. “Book a cab to the clinic”"
          value={input}
          onChange={(e) => {
            cancelCountdown();
            setInput(e.target.value);
          }}
          disabled={loading}
          autoComplete="off"
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          <Send size={18} aria-hidden="true" /> Send
        </Button>
      </form>

      {showSuggestions && (
        <div className="suggestions" aria-label="Things you can ask">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className="suggestion"
              onClick={() => void handleSend(undefined, s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <ConversationPanel
        open={panelOpen}
        messages={messages}
        loading={loading}
        canListen={ttsSupported}
        onClose={closePanel}
        onListen={(t) => speak(toSpeakableText(t), speechLang)}
        onRetry={(t) => {
          closePanel();
          void handleSend(undefined, t);
        }}
      />

      <ConfirmDialog
        open={confirmReset}
        title="Start a new conversation?"
        confirmLabel="Start new"
        onConfirm={() => void doReset()}
        onCancel={() => setConfirmReset(false)}
      >
        The messages on this screen will be cleared and ElderCare will forget what we just talked
        about. Anything already ordered, booked or sent is not affected.
      </ConfirmDialog>
    </div>
  );
};
