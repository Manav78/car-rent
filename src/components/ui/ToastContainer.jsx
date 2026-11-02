import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const toastStyles = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-slate-900/95 border-emerald-500/40 text-emerald-300 shadow-emerald-950/50',
    iconColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    progress: 'bg-emerald-500',
    title: 'Success',
  },
  error: {
    icon: XCircle,
    bg: 'bg-slate-900/95 border-rose-500/40 text-rose-300 shadow-rose-950/50',
    iconColor: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
    progress: 'bg-rose-500',
    title: 'Error',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-slate-900/95 border-amber-500/40 text-amber-300 shadow-amber-950/50',
    iconColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    progress: 'bg-amber-500',
    title: 'Attention',
  },
  info: {
    icon: Info,
    bg: 'bg-slate-900/95 border-blue-500/40 text-blue-300 shadow-blue-950/50',
    iconColor: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
    progress: 'bg-blue-500',
    title: 'Notice',
  },
};

const ToastContainer = ({ toasts = [], onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const style = toastStyles[toast.type] || toastStyles.success;
        const Icon = style.icon;

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto w-full p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-top-5 fade-in ${style.bg}`}
          >
            <div className={`p-2 rounded-xl border shrink-0 ${style.iconColor}`}>
              <Icon className="w-4 h-4" />
            </div>

            <div className="flex-1 pt-0.5 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                  {style.title}
                </span>
                <button
                  type="button"
                  onClick={() => onDismiss(toast.id)}
                  className="text-slate-400 hover:text-slate-100 p-0.5 rounded-lg transition-colors"
                  aria-label="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs font-semibold text-slate-100 mt-0.5 leading-relaxed break-words">
                {toast.message}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
