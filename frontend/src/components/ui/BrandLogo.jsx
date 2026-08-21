import React from 'react';
import { Link } from 'react-router-dom';

export const BrandLogo = ({ collapsed = false, className = "", noLink = false, showDot = false, chatState = "idle", dotId, textSize = "text-xl md:text-2xl" }) => {
  const content = (
    <div className={`flex items-center gap-2.5 shrink-0 ${className}`}>
      
      {showDot && (
        <div id={dotId} className="brand-dot shrink-0" />
      )}

      <span
        className={`text-primary font-medium text-base tracking-tight whitespace-nowrap transition-all duration-250 ease-in-out ${
          collapsed ? 'opacity-0 w-0 overflow-hidden pointer-events-none' : 'opacity-100 w-auto'
        }`}
      >
        BluCare+
      </span>
    </div>
  );

  if (noLink) return content;

  return (
    <Link to="/" className="no-underline group focus-visible:outline-2 focus-visible:outline-sage">
      {content}
    </Link>
  );
};
