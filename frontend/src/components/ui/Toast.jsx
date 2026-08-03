// src/components/ui/Toast.jsx
import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const Toast = ({ id, type = 'info', message, onClose }) => {
  const styles = {
    info: {
      bg: 'bg-bg-card/90 border-sage/40 text-primary',
      icon: Info,
      iconColor: 'text-sage',
    },
    success: {
      bg: 'bg-bg-card/90 border-emerald-500/40 text-primary',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
    },
    warning: {
      bg: 'bg-bg-card/90 border-amber-500/40 text-primary',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
    },
    error: {
      bg: 'bg-bg-card/90 border-rose-500/40 text-primary',
      icon: AlertCircle,
      iconColor: 'text-rose-400',
    },
  };

  const config = styles[type] || styles.info;
  const IconComponent = config.icon;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-base text-xs transition-all duration-300 animate-slide-in',
        config.bg
      )}
    >
      <div className="flex items-center gap-2.5">
        <IconComponent size={16} className={cn('shrink-0', config.iconColor)} />
        <span className="font-medium">{message}</span>
      </div>
      <button
        onClick={() => onClose(id)}
        className="p-1 rounded-lg text-subdued hover:text-primary hover:bg-bg-surface transition-colors cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
