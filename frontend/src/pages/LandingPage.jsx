import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowRight, Shield, Activity, Clock, ChevronRight, Stethoscope, HeartPulse, Brain } from 'lucide-react';
import Navbar from '../components/Navbar';

const LandingPage = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const featuresRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    tl.fromTo(titleRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    )
    .fromTo(subtitleRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      "-=0.6"
    )
    .fromTo(ctaRef.current,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.5)" },
      "-=0.5"
    )
    .fromTo(".feature-card",
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" },
      "-=0.4"
    );

    gsap.to(".glow-blob", {
      rotation: 360,
      duration: 20,
      repeat: -1,
      ease: "linear",
    });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden selection:bg-accent-blue/30 relative">
      <Navbar />
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none glow-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] rounded-full bg-emerald-600/10 blur-[150px] pointer-events-none glow-blob" />
      
      <main className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center" ref={heroRef}>
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mt-12 mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium text-blue-300 mb-8 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <SparkleIcon /> Introducing BluCare+ Next-Gen Triage
          </div>
          
          <h1 ref={titleRef} className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
              Intelligent Clinical
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
              Triage & Analytics.
            </span>
          </h1>
          
          <p ref={subtitleRef} className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Empower your health decisions with real-time AI symptom assessment, integrated emergency hospital routing, and longitudinal risk modeling—built for modern care.
          </p>
          
          <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/app/chat/diagnostic')}
              className="px-8 py-4 rounded-full bg-white text-black font-semibold tracking-wide hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center gap-2 group"
            >
              Start Diagnostic Chat
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/app/hospitals')}
              className="px-8 py-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-white font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              Locate Hospitals
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12">
          <FeatureCard 
            icon={<Brain className="w-6 h-6 text-blue-400" />}
            title="Multi-Agent AI Reasoning"
            description="Our advanced LLM router dynamically transitions between information gathering, medical literature retrieval, and remedy synthesis for unparalleled diagnostic accuracy."
          />
          <FeatureCard 
            icon={<Shield className="w-6 h-6 text-emerald-400" />}
            title="Clinical Safety Guardrails"
            description="Strict adherence to WHO protocols. The system instantly detects high-risk indicators and prompts emergency SOS dispatches when critical care is needed."
          />
          <FeatureCard 
            icon={<Activity className="w-6 h-6 text-purple-400" />}
            title="Live GPS Hospital Routing"
            description="Seamlessly cross-reference your triage severity with nearby medical facilities, real-time ICU bed availability, and live ambulance dispatch times."
          />
        </div>
      </main>
      
      {/* Premium divider */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <footer className="text-center py-8 text-zinc-600 text-sm">
        <p>© 2026 BluCare+ Intelligence RAG System. For research and demonstration.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="feature-card p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors backdrop-blur-xl group">
    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-medium text-white mb-3 tracking-tight">{title}</h3>
    <p className="text-sm text-zinc-400 leading-relaxed">
      {description}
    </p>
  </div>
);

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  </svg>
);

export default LandingPage;
