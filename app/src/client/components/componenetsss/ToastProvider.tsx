import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import "./Toast.css";

type ToastKind = "success" | "error";

export interface ToastOptions {
  id?: string;
  kind?: ToastKind;
  title?: string;
  message?: string;
  // ms
  duration?: number;
}

interface ToastItem extends Required<Omit<ToastOptions, "duration">> {
  duration: number;
}

type ToastContextType = {
  showToast: (opts: ToastOptions) => string; // returns id
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
};

// ---- Icons (inline SVGs you provided) ----
const ErrorIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none" aria-hidden>
    <path d="M11 6.00005V10M11 14H11.01M6.9 18C8.80858 18.9791 11.0041 19.2443 13.0909 18.7478C15.1777 18.2514 17.0186 17.0259 18.2818 15.2922C19.545 13.5586 20.1474 11.4308 19.9806 9.29221C19.8137 7.15366 18.8886 5.14502 17.3718 3.62824C15.855 2.11146 13.8464 1.1863 11.7078 1.01946C9.56929 0.852628 7.44147 1.45509 5.70782 2.71829C3.97417 3.98149 2.74869 5.82236 2.25222 7.90916C1.75575 9.99596 2.02094 12.1915 3 14.1L1 20L6.9 18Z" stroke="#ED5142" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SuccessIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="13" viewBox="0 0 18 13" fill="none" aria-hidden>
    <path d="M17 1L6 12L1 7" stroke="#6AB349" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M9 1L1 9M1 1L9 9" stroke="#373B40" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
);

export const ToastProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Record<string, number>>({});

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const handle = timersRef.current[id];
    if (handle) {
      window.clearTimeout(handle);
      delete timersRef.current[id];
    }
  }, []);

  const showToast = useCallback((opts: ToastOptions) => {
    const generateId = () => {
      if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
        return (crypto as any).randomUUID();
      }
      // simple fallback (not crypto-secure but sufficient for ids)
      return Math.random().toString(36).slice(2) + Date.now().toString(36);
    };
    const id = opts.id ?? generateId();
    const item: ToastItem = {
      id,
      kind: opts.kind ?? "success",
      title: opts.title ?? (opts.kind === "error" ? "Failed" : "Success"),
      message: opts.message ?? "",
      duration: Math.max(1000, opts.duration ?? 4000),
    };
    setToasts(prev => [item, ...prev]); // newest on top
    // auto hide
    timersRef.current[id] = window.setTimeout(() => dismissToast(id), item.duration);
    return id;
  }, [dismissToast]);

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Portal-like container fixed bottom-right */}
      <div className="toast-viewport" aria-live="polite" aria-atomic="false">
        {toasts.map(t => (
          <ToastCard key={t.id} item={t} onClose={() => dismissToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastCard: React.FC<{ item: ToastItem; onClose: () => void }> = ({ item, onClose }) => {
  // pause on hover
  const ref = useRef<HTMLDivElement | null>(null);
  const pauseTimers = useRef<{paused: boolean}>({ paused: false });

  const handleMouseEnter = () => {
    if (pauseTimers.current.paused) return;
    pauseTimers.current.paused = true;
    // Stop CSS countdown by toggling a class
    ref.current?.classList.add("toast-paused");
  };

  const handleMouseLeave = () => {
    if (!pauseTimers.current.paused) return;
    pauseTimers.current.paused = false;
    ref.current?.classList.remove("toast-paused");
  };

  return (
    <div
      ref={ref}
      className={`toast-card ${item.kind === "error" ? "toast-error" : "toast-success"}`}
      role="status"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="toast-icon">
        {item.kind === "error" ? <ErrorIcon/> : <SuccessIcon/>}
      </div>

      <div className="toast-body">
        <div className="toast-title">
          {item.title}
        </div>
        {item.message ? <div className="toast-message">{item.message}</div> : null}
      </div>

      <button className="toast-close" aria-label="Dismiss notification" onClick={onClose}>
        <CloseIcon/>
      </button>
    </div>
  );
};
