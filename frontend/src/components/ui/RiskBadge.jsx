// src/components/ui/RiskBadge.jsx
import React from 'react';

const RiskBadge = ({ level = 'low', confidence }) => {
  const normalizedLevel = (level || 'low').toLowerCase();

  const config = {
    low: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-400/10',
      border: 'border-emerald-500/30 dark:border-emerald-400/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      label: 'LOW RISK',
      dot: 'bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]',
    },
    medium: {
      bg: 'bg-amber-500/10 dark:bg-amber-400/10',
      border: 'border-amber-500/30 dark:border-amber-400/30',
      text: 'text-amber-600 dark:text-amber-400',
      label: 'MEDIUM RISK',
      dot: 'bg-amber-500 dark:bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
    },
    high: {
      bg: 'bg-rose-500/10 dark:bg-rose-400/10',
      border: 'border-rose-500/30 dark:border-rose-400/30',
      text: 'text-rose-600 dark:text-rose-400',
      label: 'HIGH RISK',
      dot: 'bg-rose-500 dark:bg-rose-400 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.7)]',
    },
  };

  const style = config[normalizedLevel] || config.low;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold tracking-wider ${style.bg} ${style.border} ${style.text}`}>
      <span className={`w-2 h-2 rounded-full ${style.dot}`} />
      <span>{style.label}</span>
      {confidence !== undefined && (
        <span className="opacity-75 font-normal border-l border-current/20 pl-2 ml-1">
          {Math.round(confidence * 100)}% Match
        </span>
      )}
    </div>
  );
};

export default RiskBadge;
