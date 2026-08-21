import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mic } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col justify-between items-center relative z-10 select-none">
      <div className="ambient-background" />

      <main className="flex-1 flex flex-col items-center justify-center text-center px-5 -mt-10 z-10 max-w-2xl mx-auto my-auto">
        {/* 1. Hero Section */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-[var(--text-primary)] mb-6 leading-tight animate-fade-up-1">
          Here to listen.<br />Whenever you are ready.
        </h1>

        {/* 2. Description */}
        <p className="text-base sm:text-lg text-[var(--text-secondary)] font-light max-w-[500px] leading-relaxed mb-12 animate-fade-up-2">
          A private, gentle space to navigate how you're feeling.
          Take your time, there is absolutely no rush.
        </p>

        {/* 3. Primary CTA */}
        <Link
          to="/chat"
          className="cta-button inline-flex items-center gap-3 bg-[var(--bg-card)] color-[var(--text-primary)] border border-[var(--border-light)] px-10 py-4 rounded-full text-base font-normal no-underline shadow-[var(--shadow-base)] hover:-translate-y-0.5 hover:bg-[var(--bg-surface)] hover:border-[var(--accent-sage)] hover:text-[var(--accent-sage)] hover:shadow-[0_12px_40px_var(--glow-sage)] transition-all duration-400 animate-fade-up-3 group"
        >
          <span>Begin gently</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* 4 & 5. Trust & Voice Hint */}
        <div className="mt-12 flex flex-col items-center gap-3 animate-fade-up-4">
          <div className="text-xs text-[var(--text-subdued)] font-light">
            Your conversations stay completely private.
          </div>

          <Link
            to="/voice"
            className="inline-flex items-center justify-center gap-2 text-xs text-[var(--accent-lavender)] bg-[rgba(182,196,255,0.05)] px-4 py-1.5 rounded-full no-underline hover:bg-[rgba(182,196,255,0.12)] transition-colors mt-2"
          >
            <Mic size={14} />
            <span>Type at your pace, or use your voice.</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-10 text-xs text-[var(--text-subdued)] font-light animate-fade-in-footer">
        Designed for calm, not alarm.
      </footer>
    </div>
  );
}
