import React, { useEffect, useRef, useState } from 'react';
import {
  Send,
  Mic,
  MicOff,
  RefreshCw,
  Bot,
  User as UserIcon,
  Volume2,
  VolumeX,
  Square,
} from 'lucide-react';
import { sendChatMessage, resetChatSession, type ChatMessage } from '../services/agentApi';
import { useAuth } from '../context/AuthContext';
import { useSpeech, toSpeechLang } from '../hooks/useSpeech';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { toSpeakableText } from '../utils/speechText';

const VOICE_OUTPUT_KEY = 'eldercare_voice_output';

export const AssistantPage: React.FC = () => {
  const { user } = useAuth();
  const speechLang = toSpeechLang(user?.preferences?.language);
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

  const [sessionId] = useState<string>(() => {
    const existing = localStorage.getItem('eldercare_chat_session');
    if (existing) return existing;
    const newId = `web_session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    localStorage.setItem('eldercare_chat_session', newId);
    return newId;
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am your ElderCare AI Assistant. How can I help you today? You can ask me to book a ride, check your medicine orders, or contact family.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [voiceError, setVoiceError] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const AUTO_SEND_SECONDS = 3;
  const pendingTextRef = useRef<string>('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const {
    isListening,
    start: startListening,
    stop: stopListening,
    supported: micSupported,
  } = useVoiceInput({
    lang: speechLang,
    onText: setInput,
    onSilence: (text) => {
      pendingTextRef.current = text;
      setCountdown(AUTO_SEND_SECONDS);
    },
    onError: setVoiceError,
  });

  const cancelCountdown = () => setCountdown(null);

  const toggleVoiceInput = () => {
    if (!micSupported) {
      setVoiceError('Voice input is not supported in this browser. Please try Chrome or Edge.');
      return;
    }
    setVoiceError('');
    if (isListening) {
      stopListening();
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

  const handleSend = async (e?: React.FormEvent, override?: string) => {
    if (e) e.preventDefault();
    const text = (override ?? input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    stop();
    stopListening();
    cancelCountdown();
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(text, sessionId);
      const assistantMsg: ChatMessage = {
        id: `reply_${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (voiceOutput) speak(toSpeakableText(res.reply), speechLang);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: `Sorry, I encountered an error: ${err.message || 'Unable to connect to AI Agent service.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

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

  // Keyboard shortcuts. The ref always holds the latest handlers so the listener is bound once.
  const shortcutsRef = useRef<(e: KeyboardEvent) => void>(() => {});
  shortcutsRef.current = (e) => {
    if (e.key === 'Escape') {
      if (countdown !== null) cancelCountdown();
      else if (isListening) stopListening();
      else if (isSpeaking) stop();
      return;
    }
    const isSendCombo = (e.ctrlKey || e.metaKey) && e.key === 'Enter';
    if (isSendCombo) {
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
        void handleReset();
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

  const handleReset = async () => {
    if (window.confirm('Clear conversation history?')) {
      stop();
      stopListening();
      cancelCountdown();
      try {
        await resetChatSession(sessionId);
      } catch {}
      setMessages([
        {
          id: 'welcome_reset',
          sender: 'assistant',
          text: 'Session reset. How can I help you now?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>AI Care Assistant</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Speak or type to book rides, order medicine, or get assistance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {ttsSupported && (
            <>
              {isSpeaking && (
                <button
                  onClick={stop}
                  className="btn btn-danger"
                  type="button"
                  title="Stop speaking"
                >
                  <Square size={16} />
                  <span>Stop</span>
                </button>
              )}
              {voiceList.length > 0 && (
                <select
                  className="input-field"
                  style={{ width: 'auto', maxWidth: '200px' }}
                  value={voiceList.some((v) => v.voiceURI === voiceURI) ? voiceURI : ''}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  aria-label="Assistant voice"
                  title="Choose assistant voice"
                >
                  <option value="">Default voice</option>
                  {voiceList.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={toggleVoiceOutput}
                className={`btn ${voiceOutput ? 'btn-primary' : 'btn-secondary'}`}
                type="button"
                aria-pressed={voiceOutput}
                title={voiceOutput ? 'Spoken replies on' : 'Spoken replies off'}
              >
                {voiceOutput ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span>{voiceOutput ? 'Voice on' : 'Voice off'}</span>
              </button>
            </>
          )}
          <button
            onClick={handleReset}
            className="btn btn-secondary"
            type="button"
            title="Reset Session"
          >
            <RefreshCw size={16} />
            <span>Reset Chat</span>
          </button>
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-bubble ${msg.sender}`}
              style={{ display: 'flex', gap: '0.75rem' }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background:
                    msg.sender === 'assistant' ? 'var(--primary-light)' : 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {msg.sender === 'assistant' ? (
                  <Bot size={16} style={{ color: 'var(--primary)' }} />
                ) : (
                  <UserIcon size={16} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    opacity: 0.7,
                    textAlign: msg.sender === 'user' ? 'right' : 'left',
                    marginTop: '0.25rem',
                  }}
                >
                  {msg.timestamp}
                  {msg.sender === 'assistant' && ttsSupported && (
                    <button
                      type="button"
                      className="chat-listen-btn"
                      onClick={() => speak(toSpeakableText(msg.text), speechLang)}
                      title="Listen to this message"
                    >
                      <Volume2 size={14} /> Listen
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-bubble assistant">
              <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                Assistant is thinking...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {(countdown !== null || voiceError) && (
          <div className="chat-voice-banner" role="status">
            {countdown !== null ? (
              <>
                <span>Sending in {countdown}…</span>
                <button type="button" className="btn btn-secondary" onClick={cancelCountdown}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    cancelCountdown();
                    void handleSend(undefined, pendingTextRef.current);
                  }}
                >
                  Send now
                </button>
              </>
            ) : (
              <span>{voiceError}</span>
            )}
          </div>
        )}

        <form onSubmit={handleSend} className="chat-input-bar">
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`btn ${isListening ? 'btn-danger mic-listening' : 'btn-secondary'}`}
            disabled={loading}
            style={{ borderRadius: '50%', width: '44px', height: '44px', padding: 0 }}
            title={isListening ? 'Stop listening (Alt+M)' : 'Start voice input (Alt+M)'}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <input
            type="text"
            ref={inputRef}
            className="input-field"
            placeholder={
              isListening
                ? 'Listening… pause for a moment to send'
                : 'Type a message (e.g., "Book a ride to the clinic")'
            }
            value={input}
            onChange={(e) => {
              cancelCountdown();
              setInput(e.target.value);
            }}
            disabled={loading}
          />

          <button
            type="submit"
            className="btn btn-primary"
            style={{ borderRadius: 'var(--radius-sm)', padding: '0.75rem 1.25rem' }}
            disabled={loading || !input.trim()}
            title="Send (Enter or Alt+S)"
          >
            <Send size={18} />
          </button>
        </form>
        <div
          style={{
            padding: '0.4rem 1rem',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
          }}
        >
          Shortcuts: Alt+M mic · Alt+S / Ctrl+Enter send · Alt+V spoken replies · Alt+X stop
          speaking · Alt+I focus input · Alt+R reset · Esc cancel
        </div>
      </div>
    </div>
  );
};
