import React, { useEffect } from 'react';
import { AlertCircle, Mic, MicOff, Square } from 'lucide-react';
import { Button } from '../ui';
import { useTypewriter } from '../../hooks/useTypewriter';
import type { UiMessage } from '../../context/AssistantSessionContext';

const COUNTDOWN_SECONDS = 3;

/** Words fade in as they arrive. Existing words keep their index key, so only new ones animate. */
const Words: React.FC<{ tokens: string[]; animate: boolean }> = ({ tokens, animate }) => (
  <>
    {tokens.map((t, i) =>
      /^\s+$/.test(t) ? (
        t
      ) : (
        <span key={i} className={animate ? 'word-in' : undefined}>
          {t}
        </span>
      ),
    )}
  </>
);

const Reveal: React.FC<{ text: string; animate: boolean; onDone: () => void }> = ({
  text,
  animate,
  onDone,
}) => {
  const { tokens, done, skip } = useTypewriter(text, animate);

  useEffect(() => {
    if (done) onDone();
  }, [done]);

  useEffect(() => {
    if (done) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && skip();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [done, skip]);

  return (
    // The full reply is announced from the live region below; this copy is only the visual effect.
    <p
      className="reply-text"
      aria-hidden="true"
      onClick={skip}
      title={done ? undefined : 'Show all'}
    >
      <Words tokens={tokens} animate={animate} />
    </p>
  );
};

interface Props {
  isListening: boolean;
  micSupported: boolean;
  isSpeaking: boolean;
  loading: boolean;
  /** Seconds left before a spoken request is sent automatically (null when not counting). */
  countdown: number | null;
  countdownRun: number;
  /** What the person is saying right now. */
  liveText: string;
  lastUserText?: string;
  reply?: UiMessage;
  animateReply: boolean;
  revealDone: boolean;
  onRevealDone: () => void;
  showConfirm: boolean;
  voiceError: string;
  onToggleMic: () => void;
  onCancelCountdown: () => void;
  onSendNow: () => void;
  onStopSpeaking: () => void;
  onAnswer: (text: string) => void;
  onRetry: (text: string) => void;
}

export const VoiceStage: React.FC<Props> = (p) => {
  const counting = p.countdown !== null;
  const orbState = p.isListening ? 'listening' : counting ? 'sending' : p.loading ? 'busy' : '';

  let caption = 'Tap to speak';
  if (p.loading) caption = 'Thinking…';
  else if (counting) caption = 'Sending what you said…';
  else if (p.isListening) caption = 'Listening… tap to stop';
  else if (p.isSpeaking) caption = 'Speaking…';
  else if (!p.micSupported) caption = 'Voice isn’t available here. Please type below.';

  const hasConversation = p.loading || !!p.reply || !!p.lastUserText;

  return (
    <section
      className={`stage ${hasConversation && !p.isListening && !counting ? 'compact' : ''}`}
      aria-label="Talk to ElderCare"
    >
      <div className="mic-wrap">
        {counting && (
          <svg
            key={p.countdownRun}
            className="mic-countdown"
            viewBox="0 0 100 100"
            aria-hidden="true"
            style={{ animationDuration: `${COUNTDOWN_SECONDS}s` }}
          >
            <circle cx="50" cy="50" r="46" />
          </svg>
        )}
        <button
          type="button"
          className={`mic-orb ${orbState}`}
          onClick={p.onToggleMic}
          disabled={p.loading}
          aria-pressed={p.isListening}
          aria-label={p.isListening ? 'Stop listening' : 'Start speaking'}
          title="Shortcut: Alt+M"
        >
          {p.isListening ? (
            <MicOff size={52} aria-hidden="true" />
          ) : (
            <Mic size={52} aria-hidden="true" />
          )}
        </button>
      </div>

      <p className="mic-caption" role="status">
        {caption}
      </p>

      <div className="stage-actions">
        {counting && (
          <>
            <Button variant="secondary" size="small" onClick={p.onCancelCountdown}>
              Cancel
            </Button>
            <Button size="small" onClick={p.onSendNow}>
              Send now
            </Button>
          </>
        )}
        {p.isSpeaking && !counting && (
          <Button variant="danger" size="small" onClick={p.onStopSpeaking}>
            <Square size={14} aria-hidden="true" /> Stop speaking
          </Button>
        )}
      </div>

      <div className="stage-text">
        {p.voiceError && (
          <p className="stage-error" role="alert">
            <AlertCircle size={18} aria-hidden="true" /> {p.voiceError}
          </p>
        )}

        {p.isListening || counting ? (
          <p className="live-text" aria-live="off">
            {p.liveText.trim() ? (
              <Words tokens={p.liveText.trim().split(/(\s+)/)} animate />
            ) : (
              <span className="placeholder">Go ahead, I’m listening…</span>
            )}
            <span className="caret" aria-hidden="true" />
          </p>
        ) : p.loading ? (
          <>
            {p.lastUserText && <p className="you-said">You said: “{p.lastUserText}”</p>}
            <p className="thinking" aria-hidden="true">
              <span />
              <span />
              <span />
            </p>
          </>
        ) : p.reply ? (
          <>
            {p.lastUserText && <p className="you-said">You said: “{p.lastUserText}”</p>}
            {/* Full text for assistive technology the moment it arrives. */}
            <div className="sr-only" role="status" aria-live="polite">
              {p.reply.text}
            </div>
            {p.reply.error ? (
              <div className="stage-error-box" role="alert">
                <p>{p.reply.text}</p>
                {p.reply.retryText && (
                  <Button variant="secondary" onClick={() => p.onRetry(p.reply!.retryText!)}>
                    Try again
                  </Button>
                )}
              </div>
            ) : (
              <Reveal
                key={p.reply.id}
                text={p.reply.text}
                animate={p.animateReply}
                onDone={p.onRevealDone}
              />
            )}
            {p.showConfirm && p.revealDone && (
              <div className="confirm-card" role="group" aria-label="Your answer">
                <p>Is that right? Choose an answer, or speak or type your own.</p>
                <div className="actions">
                  <Button onClick={() => p.onAnswer('Yes, go ahead.')}>Yes, go ahead</Button>
                  <Button variant="secondary" onClick={() => p.onAnswer('No, please cancel that.')}>
                    No, cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          !hasConversation &&
          !p.voiceError && (
            <p className="idle-hint">
              Say what you need. I’ll always check with you before I order, book or send anything.
            </p>
          )
        )}
      </div>
    </section>
  );
};
