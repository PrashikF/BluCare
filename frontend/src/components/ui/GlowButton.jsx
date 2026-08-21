// src/components/ui/GlowButton.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const GlowButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  disabled = false,
  loading = false,
}) => {
  const sizeClasses = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  const variants = {
    primary:
      'backdrop-blur-md bg-sage/10 border border-sage/30 text-sage hover:bg-sage hover:text-bg-base font-semibold tracking-wider uppercase shadow-[0_0_20px_var(--glow-sage)]',
    secondary:
      'backdrop-blur-md bg-bg-card/60 border border-light text-primary hover:border-lavender hover:text-lavender font-medium',
    accent:
      'bg-lavender/10 border border-lavender/30 text-lavender hover:bg-lavender hover:text-bg-base font-semibold tracking-wider uppercase',
    danger:
      'bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white font-semibold tracking-wider uppercase shadow-[0_0_15px_rgba(244,63,94,0.3)]',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        'rounded-full transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-sage focus-visible:outline-offset-2',
        sizeClasses[size] || sizeClasses.md,
        variants[variant] || variants.primary,
        className
      )}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : children}
    </button>
  );
};

export default GlowButton;
