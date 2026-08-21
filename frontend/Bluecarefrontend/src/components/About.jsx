import React from 'react';
import { Smile, Headphones, Cpu, Heart, Shield, Info } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col justify-between items-center relative z-10">
      <div className="ambient-background" />

      <main className="flex-1 max-w-[900px] mx-auto w-full px-5 pt-36 pb-20">
        <div className="header-section text-center mb-16 opacity-0 animate-fade-up-1">
          <h1 className="page-title text-4xl sm:text-5xl font-light tracking-tight text-[var(--text-primary)] mb-4">
            Health information shouldn't feel like an emergency.
          </h1>
          <p className="page-subtitle text-lg text-[var(--text-secondary)] font-light max-w-[600px] mx-auto leading-relaxed">
            Understanding how BluCare+ is built to provide clarity, structure, and emotional safety when you need it most.
          </p>
        </div>

        <div className="bento-grid">
          {/* 1. The Problem */}
          <div className="bento-card card-wide delay-1">
            <div className="card-icon">
              <Smile size={24} />
            </div>
            <h3 className="card-title">Why we built this</h3>
            <p className="card-text">
              Searching for health symptoms online often leads to a spiral of alarmist, overwhelming, and impersonal information. We created BluCare+ because we believe people deserve a space that reduces anxiety rather than amplifying it. A space to gently explore what you're feeling without the pressure of a search engine.
            </p>
          </div>

          {/* 2. Our Approach */}
          <div className="bento-card delay-2">
            <div className="card-icon">
              <Headphones size={24} />
            </div>
            <h3 className="card-title">A companion, not a search bar</h3>
            <p className="card-text">
              BluCare+ is a quiet space to talk things through. Through guided text or voice conversations, your AI companion, Yukti, asks context-aware questions to understand your situation before offering information.
            </p>
          </div>

          {/* 3. Technology */}
          <div className="bento-card delay-3">
            <div className="card-icon">
              <Cpu size={24} />
            </div>
            <h3 className="card-title">Grounded reasoning</h3>
            <p className="card-text">
              Behind the calm interface is structured reasoning. Instead of AI guesswork, BluCare+ retrieves information from verified medical knowledge bases to provide reliable and responsible insights.
            </p>
          </div>

          {/* 4. What makes it different */}
          <div className="bento-card delay-4">
            <div className="card-icon">
              <Heart size={24} />
            </div>
            <h3 className="card-title">Calm by design</h3>
            <p className="card-text">
              We prioritize listening over answering. Every aspect of the experience—from the muted colors to the gentle pacing—is carefully designed to create an emotionally safe and unhurried environment.
            </p>
          </div>

          {/* 5. Privacy */}
          <div className="bento-card delay-5">
            <div className="card-icon">
              <Shield size={24} />
            </div>
            <h3 className="card-title">Your data is yours</h3>
            <p className="card-text">
              Privacy isn't an afterthought. We minimize data exposure and offer Temporary Sessions that wipe your conversation the moment you leave, ensuring your most sensitive questions remain private.
            </p>
          </div>
        </div>

        {/* 6. Responsibility Note */}
        <div className="responsibility-note mt-10 p-6 rounded-2xl border border-[var(--border-light)] flex gap-4 items-start">
          <Info size={20} className="text-[var(--text-subdued)] shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--text-subdued)] leading-relaxed font-light">
            <strong className="font-normal text-[var(--text-secondary)]">A note on responsibility:</strong> BluCare+ is designed as a companion for early reflection and clarity. It is not a medical device, it cannot diagnose conditions, and it does not replace professional medical advice, doctors, or emergency care.
          </p>
        </div>
      </main>
    </div>
  );
}
