// src/components/ui/AlertBanner.jsx
import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, Info } from 'lucide-react';

const AlertBanner = ({ type = 'info', title, message, actionText, onAction }) => {
  const styles = {
    info: {
      bg: 'bg-sage/10',
      border: 'border-sage/30',
      text: 'text-sage',
      icon: Info,
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-300',
      icon: AlertTriangle,
    },
    danger: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-300',
      icon: AlertCircle,
    },
    success: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      icon: CheckCircle2,
    },
  };

  const currentStyle = styles[type] || styles.info;
  const IconComponent = currentStyle.icon;

  return (
    <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs ${currentStyle.bg} ${currentStyle.border} ${currentStyle.text}`}>
      <div className="flex items-center gap-3">
        <IconComponent size={20} className="shrink-0" />
        <div>
          {title && <p className="font-semibold text-primary">{title}</p>}
          <p className="text-secondary">{message}</p>
        </div>
      </div>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-3.5 py-1.5 rounded-xl bg-primary text-bg-base font-semibold hover:opacity-90 transition-opacity shrink-0 cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
