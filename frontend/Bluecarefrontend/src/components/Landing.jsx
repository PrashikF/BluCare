import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mic, MessageSquare, ShieldCheck, Sparkles, Heart, Activity } from 'lucide-react';

const STORAGE_KEY = 'blucare_chat_history';

export default function Landing() {
  const navigate = useNavigate();

  const handlePromptClick = (promptText, isVoice = false) => {
    if (isVoice) {
      navigate('/voice');
      return;
    }

    // Pre-populate chat with the prompt
    const saved = localStorage.getItem(STORAGE_KEY);
    let appState = { sessions: [] };
    if (saved) {
      try { appState = JSON.parse(saved); } catch (e) {}
    }

    const newSession = {
      id: 'sess_' + Date.now(),
      timestamp: Date.now(),
      isTemporary: false,
      messages: [
        {
          role: 'ai',
          content: "Hello, I'm Yukti. I'm here to listen and help you navigate how you're feeling today."
        },
        {
          role: 'user',
          content: promptText,
          expanded: false
        },
        {
          role: 'ai',
          content: `I hear you. Let's take a deep breath together. Tell me a bit more about when you started noticing "${promptText.slice(0, 40)}..."`
        }
      ]
    };

    if (!appState.sessions) appState.sessions = [];
    appState.sessions.push(newSession);
    appState.currentSessionId = newSession.id;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));

    navigate('/chat');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between items-center relative z-10 select-none overflow-x-hidden">
      {/* Ambient background blur */}
      <div className="ambient-background" />

      {/* Main Container */}
      <main className="flex-1 max-w-[960px] mx-auto w-full px-6 pt-32 pb-20 flex flex-col items-center text-center z-10">

        {/* Floating Calm Pill Badge */}
        <div className="hero-pill-badge">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-sage)] animate-pulse" />
          <span>✦ Private & Calm Healthcare Companion</span>
        </div>

        {/* Hero Title */}
        <h1 className="hero-title text-4xl sm:text-6xl font-light tracking-tight text-[var(--text-primary)] mb-6 leading-tight max-w-[780px]">
          Here to listen.<br />
          <span className="gradient-text-sage font-normal">Whenever you are ready.</span>
        </h1>

        {/* Hero Description */}
        <p className="hero-description text-lg sm:text-xl text-[var(--text-secondary)] font-light max-w-[560px] leading-relaxed mb-10">
          A private, gentle space to navigate how you're feeling.
          Take your time—there is absolutely no rush.
        </p>

        {/* Primary CTA */}
        <div className="animate-fade-up-3 mb-16">
          <Link to="/chat" className="cta-button group">
            <span>Begin gently</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Interactive Mode Cards (Text vs Voice) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-16 animate-fade-up-4">

          {/* Text Chat Card */}
          <div
            onClick={() => navigate('/chat')}
            className="mode-card mode-card-sage group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[var(--ai-bubble-bg)] border border-[var(--ai-bubble-border)] flex items-center justify-center text-[var(--accent-sage)]">
                  <MessageSquare size={22} />
                </div>
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--accent-sage)] bg-[rgba(127,225,195,0.1)] px-3 py-1 rounded-full">
                  Text Mode
                </span>
              </div>
              <h3 className="text-xl font-normal text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-sage)] transition-colors">
                Reflective Text Conversations
              </h3>
              <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed">
                Chat at your pace with Yukti. Support for temporary un-logged sessions or journaled history.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-[var(--border-light)] flex items-center gap-2 text-xs font-medium text-[var(--accent-sage)]">
              <span>Open Text Companion</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Voice Chat Card */}
          <div
            onClick={() => navigate('/voice')}
            className="mode-card mode-card-lavender group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[var(--user-bubble-bg)] border border-[var(--user-bubble-border)] flex items-center justify-center text-[var(--accent-lavender)]">
                  <Mic size={22} />
                </div>
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--accent-lavender)] bg-[rgba(182,196,255,0.1)] px-3 py-1 rounded-full">
                  Voice Mode
                </span>
              </div>
              <h3 className="text-xl font-normal text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-lavender)] transition-colors">
                Immersive Voice Experience
              </h3>
              <p className="text-sm text-[var(--text-secondary)] font-light leading-relaxed">
                Hands-free spoken conversations with real-time speech synthesis and visual wave indicators.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-[var(--border-light)] flex items-center gap-2 text-xs font-medium text-[var(--accent-lavender)]">
              <span>Launch Voice Mode</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

        {/* Quick Topic Inspirations */}
        <div className="w-full mb-16 animate-fade-up-5">
          <div className="text-xs uppercase tracking-widest text-[var(--text-subdued)] font-medium mb-4">
            Or choose a topic to explore gently:
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => handlePromptClick("I'm feeling an anxious tightness in my chest when I stress...")}
              className="prompt-pill"
            >
              <span>💬 Anxious chest tightness</span>
            </button>

            <button
              onClick={() => handlePromptClick("Can you explain what mild fever with fatigue usually means?")}
              className="prompt-pill"
            >
              <span>🩺 Mild fever & fatigue</span>
            </button>

            <button
              onClick={() => handlePromptClick("", true)}
              className="prompt-pill hover:border-[var(--accent-lavender)]"
            >
              <span>🎙️ I prefer to speak out loud</span>
            </button>

            <button
              onClick={() => handlePromptClick("I need a calm space to organize my symptoms before seeing a doctor...")}
              className="prompt-pill"
            >
              <span>🌿 Doctor visit preparation</span>
            </button>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="trust-section flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-[var(--text-subdued)] font-light">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[var(--accent-sage)]" />
            <span>100% Private & Encrypted</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--accent-lavender)]" />
            <span>Grounded Healthcare AI</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-[var(--status-normal)]" />
            <span>Calm by Design</span>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-xs text-[var(--text-subdued)] font-light animate-fade-in-footer border-t border-[var(--border-light)] z-10">
        Designed for calm, not alarm.
      </footer>
    </div>
  );
}
