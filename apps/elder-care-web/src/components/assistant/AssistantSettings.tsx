import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, Settings, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../ui';

interface Props {
  lang: 'en' | 'hi';
  onLang: (l: 'en' | 'hi') => void;
  ttsSupported: boolean;
  voiceOutput: boolean;
  onToggleVoiceOutput: () => void;
  voices: SpeechSynthesisVoice[];
  voiceURI: string;
  onVoice: (uri: string) => void;
  onNewConversation: () => void;
}

/** Language, voice and reset: out of the way until asked for. */
export const AssistantSettings: React.FC<Props> = (p) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="settings-wrap" ref={wrapRef}>
      <button
        type="button"
        ref={toggleRef}
        className="btn btn-secondary btn-small"
        aria-expanded={open}
        aria-controls="assistant-settings"
        onClick={() => setOpen((o) => !o)}
      >
        <Settings size={18} aria-hidden="true" /> Settings
      </button>

      {open && (
        <div
          id="assistant-settings"
          className="settings-pop"
          role="group"
          aria-label="Voice and language"
        >
          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label" htmlFor="speech-lang">
              Language
            </label>
            <select
              id="speech-lang"
              className="input-field"
              value={p.lang}
              onChange={(e) => p.onLang(e.target.value as 'en' | 'hi')}
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>

          {p.ttsSupported && (
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <Button
                block
                variant={p.voiceOutput ? 'primary' : 'secondary'}
                aria-pressed={p.voiceOutput}
                onClick={p.onToggleVoiceOutput}
              >
                {p.voiceOutput ? (
                  <Volume2 size={18} aria-hidden="true" />
                ) : (
                  <VolumeX size={18} aria-hidden="true" />
                )}
                {p.voiceOutput ? 'Spoken replies: on' : 'Spoken replies: off'}
              </Button>
              {p.voices.length > 0 && (
                <>
                  <label className="sr-only" htmlFor="voice-pick">
                    Assistant voice
                  </label>
                  <select
                    id="voice-pick"
                    className="input-field"
                    style={{ marginTop: 'var(--space-2)' }}
                    value={p.voices.some((v) => v.voiceURI === p.voiceURI) ? p.voiceURI : ''}
                    onChange={(e) => p.onVoice(e.target.value)}
                  >
                    <option value="">Default voice</option>
                    {p.voices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
          )}

          <Button
            block
            variant="secondary"
            onClick={() => {
              setOpen(false);
              p.onNewConversation();
            }}
          >
            <RefreshCw size={18} aria-hidden="true" /> Start a new conversation
          </Button>

          <p className="form-hint" style={{ marginTop: 'var(--space-3)' }}>
            Shortcuts: Alt+M microphone · Alt+S or Ctrl+Enter send · Alt+V spoken replies · Alt+X
            stop speaking · Alt+I type · Alt+R new conversation · Esc cancel
          </p>
        </div>
      )}
    </div>
  );
};
