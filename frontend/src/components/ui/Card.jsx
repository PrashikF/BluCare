// src/components/ui/Card.jsx
import React from 'react';
import { cn } from '../../utils/cn';

const Card = ({ children, className = '', hoverable = false, noisy = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden backdrop-blur-xl bg-bg-card/40 border border-light rounded-3xl p-4 sm:p-6 shadow-base transition-all duration-300',
        hoverable && 'hover:border-sage/40 hover:shadow-[0_8px_30px_rgba(127,225,195,0.08)] hover:-translate-y-0.5 cursor-pointer',
        className
      )}
    >
      {noisy && <div className="noisy absolute inset-0 pointer-events-none z-0 opacity-15" />}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default Card;
