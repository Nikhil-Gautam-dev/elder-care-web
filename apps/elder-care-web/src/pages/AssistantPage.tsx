import React, { useEffect, useRef, useState } from 'react';
import { Send, Mic, MicOff, RefreshCw, Bot, User as UserIcon } from 'lucide-react';
import { sendChatMessage, resetChatSession, type ChatMessage } from '../services/agentApi';

export const AssistantPage: React.FC = () => {
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
  const [isListening, setIsListening] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

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

  const handleReset = async () => {
    if (window.confirm('Clear conversation history?')) {
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

        <form onSubmit={handleSend} className="chat-input-bar">
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`btn ${isListening ? 'btn-danger' : 'btn-secondary'}`}
            style={{ borderRadius: '50%', width: '44px', height: '44px', padding: 0 }}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <input
            type="text"
            className="input-field"
            placeholder={
              isListening
                ? 'Listening to your voice...'
                : 'Type a message (e.g., "Book a ride to the clinic")'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />

          <button
            type="submit"
            className="btn btn-primary"
            style={{ borderRadius: 'var(--radius-sm)', padding: '0.75rem 1.25rem' }}
            disabled={loading || !input.trim()}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
