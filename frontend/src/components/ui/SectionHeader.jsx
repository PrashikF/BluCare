// src/components/ui/SectionHeader.jsx
import React from 'react';
import { cn } from '../../utils/cn';

const SectionHeader = ({ title, highlightTitle, description, tag, actions, className = '' }) => {
  return (
    <div className={cn('flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-light', className)}>
      <div className="space-y-1">
        {tag && (
          <span className="text-[10px] font-mono uppercase tracking-widest text-sage bg-sage/10 px-2.5 py-1 rounded-full border border-sage/20 inline-block mb-1">
            {tag}
          </span>
        )}
        <h1 className="text-3xl md:text-4xl font-light text-primary tracking-tight">
          {title} {highlightTitle && <span className="font-semibold text-gradient">{highlightTitle}</span>}
        </h1>
        {description && <p className="text-secondary text-sm">{description}</p>}
      </div>

      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
};

export default SectionHeader;
