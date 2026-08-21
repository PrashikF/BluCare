// src/pages/SignUpPage.jsx - Custom Glassmorphic Sign Up Page
import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { BrandLogo } from '../components/ui/BrandLogo';
import { NavLink } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const SignUpPage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-bg-base relative overflow-hidden p-4">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 right-1/2 translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-sage/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full bg-lavender/10 blur-[100px] pointer-events-none" />

      {/* Main Glassmorphic Container */}
      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <NavLink to="/" className="inline-flex items-center gap-2.5 no-underline group mb-2">
            <div className="brand-dot shrink-0" />
            <span className="text-primary font-bold text-2xl tracking-tight">
              BluCare<span className="text-sage">+</span>
            </span>
          </NavLink>

          <p className="text-xs text-subdued uppercase tracking-widest font-mono">
            Create Your Medical Intelligence Account
          </p>
        </div>

        {/* Clerk Sign Up Box Wrapper */}
        <div className="p-2 rounded-3xl bg-bg-surface/80 backdrop-blur-xl border border-light shadow-2xl flex justify-center">
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/app/chat"
            appearance={{
              elements: {
                rootBox: 'w-full shadow-none bg-transparent',
                card: 'bg-transparent shadow-none p-4 w-full border-none',
                headerTitle: 'text-primary text-xl font-bold font-sans',
                headerSubtitle: 'text-subdued text-xs font-sans',
                socialButtonsBlockButton: 'bg-bg-card/70 border border-light text-primary hover:bg-bg-card text-xs font-medium rounded-xl',
                socialButtonsBlockButtonText: 'text-primary font-medium text-xs',
                dividerLine: 'bg-light',
                dividerText: 'text-subdued text-xs uppercase tracking-widest',
                formFieldLabel: 'text-secondary text-xs font-medium mb-1',
                formFieldInput: 'bg-bg-card/80 border border-light text-primary rounded-xl text-sm focus:border-sage focus:ring-1 focus:ring-sage outline-none',
                formButtonPrimary: 'bg-sage hover:brightness-110 text-bg-base font-semibold text-sm py-2.5 rounded-xl shadow-[0_0_20px_var(--glow-sage)] transition-all',
                footerActionLink: 'text-sage hover:underline text-xs font-semibold',
                footerActionText: 'text-subdued text-xs',
                identityPreviewText: 'text-primary text-xs',
                identityPreviewEditButton: 'text-sage text-xs',
              },
            }}
          />
        </div>

        {/* Clinical Disclaimer */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-subdued font-mono text-center">
          <ShieldCheck size={14} className="text-sage shrink-0" />
          <span>Encrypted Patient Data Isolation Standard</span>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
