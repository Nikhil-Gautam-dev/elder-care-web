import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './Controls';

function useEscape(onClose: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
}

interface DrawerProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ title, subtitle, onClose, footer, children }) => {
  useEscape(onClose);
  return (
    <>
      <div className="overlay" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true">
        <div className="drawer-head">
          <div className="grow">
            <h2>{title}</h2>
            {subtitle && <div className="muted">{subtitle}</div>}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="drawer-body">{children}</div>
        {footer && <div className="drawer-foot">{footer}</div>}
      </aside>
    </>
  );
};

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, onClose, children, footer }) => {
  useEscape(onClose);
  return (
    <div className="modal-wrap" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <h2>{title}</h2>
        {children}
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          {footer}
        </div>
      </div>
    </div>
  );
};

interface ReasonModalProps {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

/** Replaces window.prompt: asks for a required free-text reason. */
export const ReasonModal: React.FC<ReasonModalProps> = ({
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
}) => {
  const [reason, setReason] = useState('');
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Back
          </Button>
          <Button
            variant="danger"
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason.trim())}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="muted">{description}</p>
      <textarea
        className="textarea"
        rows={3}
        autoFocus
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason"
      />
    </Modal>
  );
};

interface ConfirmModalProps {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
}) => (
  <Modal
    title={title}
    onClose={onClose}
    footer={
      <>
        <Button variant="secondary" onClick={onClose}>
          Back
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </>
    }
  >
    <p className="muted">{description}</p>
  </Modal>
);
