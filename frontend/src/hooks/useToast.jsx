import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const VARIANTS = {
  success: { icon: CheckCircle2, ring: 'ring-emerald-500/20', iconColor: 'text-emerald-500', bar: 'bg-emerald-500' },
  error: { icon: AlertCircle, ring: 'ring-rose-500/20', iconColor: 'text-rose-500', bar: 'bg-rose-500' },
  info: { icon: Info, ring: 'ring-indigo-500/20', iconColor: 'text-indigo-500', bar: 'bg-indigo-500' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (type, message) => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-3), { id, type, message }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss]
  );

  const toast = useMemo(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      info: (message) => push('info', message),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-5 sm:items-end">
        {toasts.map((item) => {
          const variant = VARIANTS[item.type] || VARIANTS.info;
          const Icon = variant.icon;
          return (
            <div
              key={item.id}
              className={`pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 shadow-lg shadow-slate-900/10 ring-4 ${variant.ring}`}
              role="status"
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${variant.iconColor}`} />
              <p className="flex-1 text-sm font-medium text-slate-700">{item.message}</p>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
