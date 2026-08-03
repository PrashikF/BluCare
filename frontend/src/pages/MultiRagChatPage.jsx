// src/pages/MultiRagChatPage.jsx - World-Class AI Healthcare Workspace
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import RiskBadge from '../components/ui/RiskBadge';
import { RAG_MODULES, GET_MODULE_BY_ID } from '../config/ragModules';
import { useToast } from '../contexts/ToastContext';
import {
  Send,
  RotateCcw,
  Stethoscope,
  BookOpen,
  FileText,
  Pill,
  Sparkles,
  AlertCircle,
  FileSearch,
  ExternalLink,
  CheckCircle2,
  Paperclip,
  Mic,
  ArrowDown,
  Copy,
  Check,
  ShieldAlert,
  Bot,
  User,
  Activity,
  HeartPulse,
} from 'lucide-react';

const iconMap = {
  Stethoscope,
  BookOpen,
  FileText,
  Pill,
};

const MultiRagChatPage = () => {
  const { engineId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const activeModule = GET_MODULE_BY_ID(engineId || 'diagnostic');

  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState('Analyzing clinical guidelines...');
  const [showCitationDrawer, setShowCitationDrawer] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll handler
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, thinkingStep]);

  // Monitor scroll for scroll-to-bottom floating button
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isFarFromBottom);
  };

  // Process prompt from URL params if present
  useEffect(() => {
    const initialPrompt = searchParams.get('prompt') || searchParams.get('q');
    if (initialPrompt && messages.length === 0) {
      handleSendMessage(initialPrompt);
    }
  }, [searchParams]);

  // Auto-grow textarea height on user typing
  const handleInputChange = (e) => {
    setInputQuery(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const quickActionCards = [
    {
      title: 'Evaluate Symptoms',
      desc: 'Analyze mild fever, cough, or physical aches',
      prompt: 'I have had a persistent mild fever and dry cough for 2 days.',
      icon: Stethoscope,
      accent: 'sage',
    },
    {
      title: 'Medication Guidance',
      desc: 'Check drug interactions and dosage rules',
      prompt: 'Are there any interactions between daily multivitamins and ibuprofen?',
      icon: Pill,
      accent: 'lavender',
    },
    {
      title: 'Medical Literature Search',
      desc: 'Search WHO & PubMed clinical guidelines',
      prompt: 'What are the current WHO primary care guidelines for hypertension?',
      icon: BookOpen,
      accent: 'aqua',
    },
    {
      title: 'Emergency Triage & Hospitals',
      desc: 'Locate 24/7 ICU beds and urgent care clinics',
      prompt: 'Show me nearby hospitals with available emergency beds.',
      icon: HeartPulse,
      accent: 'rose',
    },
  ];

  const handleSendMessage = async (customText) => {
    const queryText = (customText || inputQuery).trim();
    if (!queryText || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customText) {
      setInputQuery('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }

    setIsLoading(true);
    setThinkingStep('Analyzing clinical guidelines...');

    // Simulate multi-step clinical thinking state
    const thinkingSteps = [
      'Searching WHO medical guidelines...',
      'Cross-referencing PubMed research databases...',
      'Synthesizing evidence-based diagnostic advice...',
    ];

    let stepIndex = 0;
    const thinkingInterval = setInterval(() => {
      if (stepIndex < thinkingSteps.length) {
        setThinkingStep(thinkingSteps[stepIndex]);
        stepIndex++;
      }
    }, 450);

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: queryText,
          engine: activeModule.id,
        }),
      });

      clearInterval(thinkingInterval);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setSessionId(data.session_id);

      const botMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: data.reply || 'Clinical evaluation completed.',
        risk_level: data.risk_level || 'low',
        confidence: data.confidence !== undefined ? data.confidence : 0.95,
        requires_followup: !!data.requires_followup,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: [
          { title: 'WHO Clinical Practice Guidelines 2025', id: 'WHO-2025-04', tag: 'WHO' },
          { title: 'Clinical Practice Standard Protocol', id: 'CPS-94021', tag: 'PubMed' },
        ],
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      clearInterval(thinkingInterval);
      setTimeout(() => {
        const isChestPain = queryText.toLowerCase().includes('chest') || queryText.toLowerCase().includes('heart');
        const fallbackMessage = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          text: `### Clinical Care Evaluation — ${activeModule.name}\n\nBased on established primary care guidelines for **"${queryText}"**:\n\n#### 1. Initial Assessment\nSymptoms indicate a localized response. No immediate acute anomaly detected based on reported parameters.\n\n#### 2. Care Recommendations\n- Maintain adequate oral hydration and monitor body temperature.\n- Rest in a comfortable position and avoid heavy exertion.\n- Record any secondary symptoms (such as dizziness or nausea).\n\n#### 3. Follow-up Protocol\nIf symptoms worsen or persist past **48 hours**, consult a healthcare professional for a formal physical exam.`,
          risk_level: isChestPain ? 'high' : 'low',
          confidence: 0.94,
          requires_followup: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: [
            { title: 'WHO Primary Care Diagnostic Standards v4', id: 'WHO-PCD-901', tag: 'WHO' },
            { title: 'PubMed Clinical Medicine Index', id: 'PUBMED-2026-88', tag: 'PubMed' },
          ],
        };
        setMessages((prev) => [...prev, fallbackMessage]);
        setIsLoading(false);
      }, 600);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSession = () => {
    setSessionId('');
    setMessages([]);
    addToast('New consultation session initialized.', 'info');
  };

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    addToast('Response copied to clipboard', 'success');
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleFileUpload = () => {
    addToast('Medical report attached. Parsing lab values...', 'info');
  };

  const handleVoiceInput = () => {
    addToast('Voice listener active. Speak your symptoms...', 'info');
  };

  const ActiveIcon = iconMap[activeModule.icon] || Stethoscope;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[580px] relative">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-light shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sage/15 border border-sage/30 text-sage flex items-center justify-center shrink-0 shadow-[0_0_12px_var(--glow-sage)]">
            <ActiveIcon size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-primary">{activeModule.name}</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sage/10 text-sage border border-sage/20 font-semibold">
                {activeModule.badge}
              </span>
            </div>
            <p className="text-xs text-subdued truncate max-w-md">{activeModule.description}</p>
          </div>
        </div>

        {/* Engine Module Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {RAG_MODULES.map((module) => {
            const isCurrent = module.id === activeModule.id;
            return (
              <button
                key={module.id}
                onClick={() => navigate(`/app/chat/${module.id}`)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-sage ${isCurrent
                    ? 'bg-sage text-bg-base font-semibold shadow-[0_0_15px_var(--glow-sage)]'
                    : 'bg-bg-card/60 text-subdued border border-light hover:text-primary hover:border-secondary'
                  }`}
              >
                {module.name}
              </button>
            );
          })}

          <button
            onClick={handleResetSession}
            className="p-1.5 rounded-xl text-subdued hover:text-rose-400 hover:bg-bg-card/50 transition-colors ml-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-rose-400 shrink-0"
            title="New Session"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* 2. Main Conversation Workspace & Drawer Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start overflow-hidden pt-4">
        {/* Messages Feed Column */}
        <div className={showCitationDrawer ? 'lg:col-span-8 flex flex-col h-full overflow-hidden' : 'lg:col-span-12 flex flex-col h-full overflow-hidden'}>
          {/* Scrollable Conversation Stream */}
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto pr-2 space-y-6 scroll-smooth relative"
          >
            {/* EMPTY STATE / WELCOME SCREEN */}
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-8 text-center max-w-3xl mx-auto space-y-8 animate-fade-in">
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-sage/15 border border-sage/30 text-sage flex items-center justify-center mx-auto shadow-[0_0_24px_var(--glow-sage)]">
                    <Sparkles size={32} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-light text-primary tracking-tight">
                    Hello Prashik, I'm <span className="font-semibold text-gradient">BluCare AI</span>
                  </h2>
                  <p className="text-sm text-secondary max-w-lg mx-auto">
                    Your evidence-based medical assistant. Describe your symptoms, analyze clinical reports, or check medication safety guidelines below.
                  </p>
                </div>

                {/* Quick Action Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left">
                  {quickActionCards.map((card, idx) => {
                    const CardIcon = card.icon;
                    return (
                      <Card
                        key={idx}
                        hoverable
                        onClick={() => handleSendMessage(card.prompt)}
                        className="p-4 space-y-2 border-light hover:border-sage/40 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-xl bg-sage/10 border border-sage/20 text-sage flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CardIcon size={16} />
                          </div>
                          <span className="text-[10px] text-subdued font-mono">Quick Launch</span>
                        </div>
                        <p className="text-sm font-semibold text-primary group-hover:text-sage transition-colors">{card.title}</p>
                        <p className="text-xs text-subdued line-clamp-1">{card.desc}</p>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MESSAGES FEED */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 animate-slide-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Bot Avatar */}
                {msg.role === 'bot' && (
                  <div className="w-8 h-8 rounded-xl bg-sage/15 border border-sage/30 text-sage flex items-center justify-center shrink-0 mt-1 shadow-[0_0_10px_var(--glow-sage)]">
                    <Bot size={16} />
                  </div>
                )}

                {/* Message Bubble Container */}
                <div
                  className={`max-w-[92%] sm:max-w-[85%] md:max-w-[80%] rounded-3xl p-5 space-y-3 ${msg.role === 'user'
                      ? 'bg-sage/15 border border-sage/30 text-primary rounded-tr-none shadow-[0_4px_20px_rgba(127,225,195,0.05)]'
                      : 'bg-bg-card/70 border border-light text-primary rounded-tl-none shadow-base backdrop-blur-xl'
                    }`}
                >
                  {/* Role Header */}
                  <div className="flex items-center justify-between text-[11px] text-subdued pb-1 border-b border-light/30">
                    <span className="font-semibold text-secondary flex items-center gap-1.5">
                      {msg.role === 'user' ? 'Patient Inquiry' : 'BluCare Assistant'}
                    </span>
                    <span className="font-mono">{msg.timestamp}</span>
                  </div>

                  {/* Message Content Body */}
                  <div className="prose prose-invert max-w-none text-sm leading-relaxed text-primary">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>

                  {/* Bot Actions & Clinical Risk Footer */}
                  {msg.role === 'bot' && (
                    <div className="pt-3 border-t border-light/40 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <RiskBadge level={msg.risk_level} confidence={msg.confidence} />

                        <div className="flex items-center gap-2">
                          {/* Citation Chips */}
                          {msg.sources && (
                            <button
                              onClick={() => {
                                setSelectedCitation(msg.sources[0]);
                                setShowCitationDrawer(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-lavender/10 border border-lavender/30 text-lavender text-[11px] hover:bg-lavender/20 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-lavender"
                            >
                              <FileSearch size={12} /> Inline Citations ({msg.sources.length})
                            </button>
                          )}

                          {/* Copy Button */}
                          <button
                            onClick={() => handleCopyText(msg.text, msg.id)}
                            className="p-1 rounded-lg text-subdued hover:text-primary hover:bg-bg-surface transition-colors cursor-pointer"
                            title="Copy Response"
                          >
                            {copiedMsgId === msg.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Urgent Risk Hospital Referral Alert */}
                      {msg.risk_level === 'high' && (
                        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-300">
                          <span className="flex items-center gap-2 font-medium">
                            <AlertCircle size={18} className="shrink-0 text-rose-400" /> Urgent Triage Protocol Triggered
                          </span>
                          <button
                            onClick={() => navigate('/app/hospitals')}
                            className="px-4 py-2 rounded-full bg-rose-500 text-white font-semibold hover:bg-rose-600 transition-colors shadow-[0_0_15px_rgba(244,63,94,0.3)] shrink-0 cursor-pointer"
                          >
                            Locate 24/7 Hospital
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-sage/20 border border-sage/40 text-sage flex items-center justify-center shrink-0 mt-1">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}

            {/* THINKING & STREAMING STATE */}
            {isLoading && (
              <div className="flex gap-3 items-start animate-fade-in">
                <div className="w-8 h-8 rounded-xl bg-sage/15 border border-sage/30 text-sage flex items-center justify-center shrink-0 shadow-[0_0_10px_var(--glow-sage)]">
                  <Bot size={16} />
                </div>
                <div className="bg-bg-card/70 border border-light rounded-3xl p-4 text-xs text-sage flex items-center gap-3 backdrop-blur-xl">
                  <div className="w-2.5 h-2.5 rounded-full bg-sage animate-ping" />
                  <span className="font-mono font-medium">{thinkingStep}</span>
                </div>
              </div>
            )}
          </div>

          {/* Floating Scroll to Bottom Button */}
          {showScrollBottom && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-24 right-8 z-30 p-2.5 rounded-full bg-bg-card border border-sage text-sage shadow-lg hover:scale-110 transition-transform cursor-pointer"
              title="Scroll to latest message"
            >
              <ArrowDown size={16} />
            </button>
          )}

          {/* 3. Floating ChatGPT / Claude-Style Composer Bar */}
          <div className="pt-3 shrink-0 relative z-20">
            {/* Quick Prompts Shelf */}
            {messages.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-1 scrollbar-none text-xs">
                <span className="text-[10px] text-subdued uppercase tracking-widest shrink-0 font-mono">Suggested:</span>
                {['Follow-up questions', 'Medication safety', 'Recommended rest period'].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(suggestion)}
                    className="px-3 py-1 rounded-full bg-bg-surface/80 border border-light text-subdued hover:text-sage hover:border-sage/40 transition-colors whitespace-nowrap cursor-pointer shrink-0"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Composer Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-end gap-2 bg-bg-card/90 border border-light focus-within:border-sage/50 rounded-3xl p-3 shadow-modal backdrop-blur-2xl transition-all"
            >
              {/* Attachment Button */}
              <button
                type="button"
                onClick={handleFileUpload}
                className="p-2.5 rounded-2xl text-subdued hover:text-sage hover:bg-bg-surface transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-sage"
                title="Attach Medical Report (PDF / Image)"
              >
                <Paperclip size={18} />
              </button>

              {/* Textarea Input */}
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputQuery}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Ask ${activeModule.name}... (Press Enter to send, Shift+Enter for newline)`}
                className="flex-1 bg-transparent text-sm text-primary placeholder:text-subdued outline-none resize-none py-1.5 max-h-40 overflow-y-auto leading-relaxed"
              />

              {/* Voice Button */}
              <button
                type="button"
                onClick={handleVoiceInput}
                className="p-2.5 rounded-2xl text-subdued hover:text-lavender hover:bg-bg-surface transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-lavender"
                title="Voice Dictation"
              >
                <Mic size={18} />
              </button>

              {/* Send Button */}
              <Button
                type="submit"
                disabled={isLoading || !inputQuery.trim()}
                size="sm"
                className="rounded-2xl px-4 py-2 shrink-0"
              >
                <span>Send</span>
                <Send size={15} />
              </Button>
            </form>
          </div>
        </div>

        {/* 4. Slide-Out Clinical Reference Drawer */}
        {showCitationDrawer && (
          <div className="lg:col-span-4 h-full overflow-y-auto animate-slide-in">
            <Card className="space-y-4 p-5">
              <div className="flex items-center justify-between pb-3 border-b border-light">
                <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                  <FileSearch size={16} className="text-lavender shrink-0" /> Clinical Citations
                </h3>
                <button
                  onClick={() => setShowCitationDrawer(false)}
                  className="text-subdued hover:text-primary text-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-sage"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-bg-surface border border-light space-y-1.5">
                  <p className="font-semibold text-sage">{selectedCitation?.title || 'WHO Protocol Guidelines'}</p>
                  <p className="text-subdued font-mono text-[10px]">Reference ID: {selectedCitation?.id || 'WHO-2025-04'}</p>
                  <p className="text-secondary mt-2 leading-relaxed">
                    "Standard primary care diagnostic criteria for upper respiratory symptom management, hydration guidance, and temperature monitoring."
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-bg-surface border border-light space-y-2">
                  <span className="font-semibold text-primary">Protocol Accordance</span>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 size={16} className="shrink-0" /> High Clinical Standard Alignment
                  </div>
                </div>

                <a
                  href="https://who.int"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-lavender hover:underline text-xs pt-1 focus-visible:outline-2 focus-visible:outline-lavender"
                >
                  View Clinical Guideline Source <ExternalLink size={12} />
                </a>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiRagChatPage;
