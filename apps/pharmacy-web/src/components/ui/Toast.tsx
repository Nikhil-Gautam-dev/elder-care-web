import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertCircle, BellRing, CheckCircle2 } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  kind: ToastKind;
  title: string;
  detail?: string;
}

interface ToastApi {
  show: (kind: ToastKind, title: string, detail?: string) => void;
}

const ToastContext = createContext<ToastApi>({ show: () => undefined });
export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((kind: ToastKind, title: string, detail?: string) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, kind, title, detail }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  const api = useMemo(() => ({ show }), [show]);
  const Icon = { success: CheckCircle2, error: AlertCircle, info: BellRing };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((t) => {
          const I = Icon[t.kind];
          return (
            <div key={t.id} className={`toast ${t.kind}`}>
              <I size={18} className="ico" />
              <div>
                <div className="strong">{t.title}</div>
                {t.detail && <div className="sub">{t.detail}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
