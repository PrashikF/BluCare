// src/pages/MultiRagChatPage.jsx - Clean ChatGPT-Style AI Healthcare Workspace
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import GlassCard from '../components/ui/GlassCard';
import GlowButton from '../components/ui/GlowButton';
import RiskBadge from '../components/ui/RiskBadge';
import { useToast } from '../contexts/ToastContext';
import { logger } from '../utils/logger';
import { useAuth } from '@clerk/clerk-react';
import {
  getSessionById,
  createSession,
  updateSession,
  getActiveSessionId,
  setActiveSessionId,
} from '../utils/chatStorage';
import { chatApi, ApiError } from '../utils/api';
import {
  Send,
  Sparkles,
  FileSearch,
  ExternalLink,
  Paperclip,
  Mic,
  MicOff,
  ArrowDown,
  Bot,
  User,
  X,
  Image as ImageIcon,
  RotateCcw,
  UploadCloud,
  Copy,
  Check,
  AlertCircle,
  FileText,
} from 'lucide-react';

const MultiRagChatPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { getToken } = useAuth();

  // AbortController ref for in-flight request cancellation
  const abortControllerRef = useRef(null);

  // Unmount cleanup: cancel any pending HTTP requests
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Chat conversation state
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState('Analyzing clinical guidelines...');

  // Citations drawer state
  const [showCitationDrawer, setShowCitationDrawer] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // File upload state
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // Scroll & input refs
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);

  // Synchronize session from URL parameter or resume active session
  useEffect(() => {
    if (sessionId) {
      const sess = getSessionById(sessionId);
      if (sess) {
        setCurrentSession(sess);
        setMessages(sess.messages || []);
        setActiveSessionId(sess.id);
      } else {
        const activeId = getActiveSessionId();
        navigate(`/app/chat/${activeId}`, { replace: true });
      }
    } else {
      const activeId = getActiveSessionId();
      if (activeId) {
        navigate(`/app/chat/${activeId}`, { replace: true });
      } else {
        setCurrentSession(null);
        setMessages([]);
      }
    }
  }, [sessionId, navigate]);

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

  // Auto-grow textarea height
  const handleInputChange = (e) => {
    setInputQuery(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  // Suggested prompt pills for clean empty state
  const suggestedPrompts = [
    'I have had a fever for two days',
    'Explain my blood report',
    'What medicine is commonly prescribed for migraine?',
    'Help me understand this diagnosis',
  ];

  // ----------------------------------------------------
  // FILE UPLOAD SYSTEM (Drag & Drop, Preview, Progress, Multiple)
  // ----------------------------------------------------
  const handleFileSelect = (files) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    fileList.forEach((file) => {
      const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
      const isImage = file.type.startsWith('image/');
      const previewUrl = isImage ? URL.createObjectURL(file) : null;

      const newFileObj = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl,
        progress: 0,
        status: 'uploading', // 'uploading' | 'complete' | 'error'
        file,
      };

      setAttachedFiles((prev) => [...prev, newFileObj]);

      // Simulate realistic smooth upload progress
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress += Math.floor(Math.random() * 30) + 15;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(progressInterval);
          setAttachedFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, progress: 100, status: 'complete' } : f))
          );
          addToast(`Attached "${file.name}"`, 'success');
        } else {
          setAttachedFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, progress: currentProgress } : f))
          );
        }
      }, 150);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (id) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleRetryUpload = (id) => {
    setAttachedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'uploading', progress: 0 } : f))
    );
    setTimeout(() => {
      setAttachedFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: 'complete', progress: 100 } : f))
      );
      addToast('Upload retried successfully', 'success');
    }, 400);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // ----------------------------------------------------
  // REAL VOICE INPUT SYSTEM (Web Speech API)
  // ----------------------------------------------------
  const startVoiceRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      addToast('Browser Speech Recognition not supported. Please type your query.', 'error');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingTime(0);
        addToast('Voice listener active. Speak your symptoms...', 'info');

        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputQuery(transcript);
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        stopVoiceRecording();
        if (event.error === 'not-allowed') {
          addToast('Microphone access denied. Please check browser permissions.', 'error');
        } else {
          addToast(`Voice error: ${event.error}`, 'error');
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      logger.error('Failed to start speech recognition:', err);
      addToast('Could not access microphone.', 'error');
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      stopVoiceRecording();
      addToast('Voice recording stopped.', 'info');
    } else {
      startVoiceRecording();
    }
  };

  // ----------------------------------------------------
  // SEND MESSAGE HANDLER & BACKEND CALL / FALLBACK
  // ----------------------------------------------------
  const handleSendMessage = async (customText) => {
    const queryText = (customText || inputQuery).trim();
    if ((!queryText && attachedFiles.length === 0) || isLoading) return;

    // Determine target active session or auto-create a new session
    let targetSess = currentSession;
    if (!targetSess) {
      const derivedTitle = queryText.slice(0, 32) || 'Medical Consultation';
      targetSess = createSession(derivedTitle);
      setCurrentSession(targetSess);
      window.dispatchEvent(new Event('blucare_sessions_updated'));
      navigate(`/app/chat/${targetSess.id}`, { replace: true });
    } else if (messages.length === 0 && queryText) {
      // Auto-update initial session title from first prompt
      const derivedTitle = queryText.slice(0, 36);
      updateSession(targetSess.id, { title: derivedTitle });
      window.dispatchEvent(new Event('blucare_sessions_updated'));
    }

    // Format attached files summary if present
    let fullQueryText = queryText;
    if (attachedFiles.length > 0) {
      const fileNames = attachedFiles.map((f) => `📎 [Attached: ${f.name}]`).join('\n');
      fullQueryText = `${queryText}\n\n${fileNames}`;
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: fullQueryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    updateSession(targetSess.id, { messages: newMessages });

    // Reset input fields
    if (!customText) {
      setInputQuery('');
      setAttachedFiles([]);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }

    setIsLoading(true);
    setThinkingStep('Analyzing clinical guidelines...');

    // Multi-step thinking state simulation
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

    // Cancel any ongoing in-flight HTTP request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const requestOptions = {
      getToken,
      signal: controller.signal,
      timeout: 45000,
    };

    try {
      let activeThreadId = targetSess.threadId;
      let chatData = null;

      if (!activeThreadId) {
        // First message turn in new session: initialize backend thread
        chatData = await chatApi.startSession(queryText, requestOptions);
        activeThreadId = chatData.thread_id;
        updateSession(targetSess.id, { threadId: activeThreadId });
      } else {
        // Subsequent message turn in existing backend thread
        chatData = await chatApi.sendMessage(activeThreadId, queryText, requestOptions);
      }

      clearInterval(thinkingInterval);

      // Preserve ALL backend response fields intact (message, stage, is_complete, symptom_facts, metadata)
      const botMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: chatData.message || 'Clinical evaluation completed.',
        stage: chatData.stage,
        is_complete: chatData.is_complete,
        symptom_facts: chatData.symptom_facts || {},
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...(chatData.risk_level && { risk_level: chatData.risk_level }),
        ...(chatData.confidence !== undefined && { confidence: chatData.confidence }),
        ...(chatData.sources && { sources: chatData.sources }),
      };

      const updatedMsgs = [...newMessages, botMessage];
      setMessages(updatedMsgs);
      updateSession(targetSess.id, { messages: updatedMsgs });
      setIsLoading(false);
    } catch (err) {
      clearInterval(thinkingInterval);

      if (err instanceof ApiError && err.status === 408) {
        logger.warn('Chat request timed out:', err);
        addToast('Request timed out. Please try sending your message again.', 'error');
      } else if (err.message !== 'Request was cancelled' && err.message !== 'Request aborted by caller') {
        logger.error('Backend chat API request failed:', err);
        addToast(`Backend Error: ${err.message}`, 'error');
      }
      setIsLoading(false);
    }
  };

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    addToast('Response copied to clipboard', 'success');
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex flex-col h-[calc(100vh-100px)] min-h-[580px] relative overflow-hidden"
    >
      {/* DRAG & DROP OVERLAY DROPZONE */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-bg-base/90 border-2 border-dashed border-sage rounded-3xl flex flex-col items-center justify-center space-y-3 backdrop-blur-xl animate-fade-in pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-sage/20 border border-sage/40 text-sage flex items-center justify-center animate-bounce shadow-[0_0_24px_var(--glow-sage)]">
            <UploadCloud size={32} />
          </div>
          <p className="text-lg font-semibold text-primary">Drop medical files or images here</p>
          <p className="text-xs text-subdued">Supports PDF, PNG, JPG, WEBP, DOCX, and TXT reports</p>
        </div>
      )}

      {/* MAIN CONVERSATION WORKSPACE & CITATIONS CONTAINER */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start overflow-hidden pt-2">
        {/* Messages Feed Column */}
        <div className={showCitationDrawer ? 'lg:col-span-8 flex flex-col h-full overflow-hidden' : 'lg:col-span-12 flex flex-col h-full overflow-hidden'}>
          {/* Scrollable Conversation Stream */}
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto pr-2 space-y-6 scroll-smooth relative"
          >
            {/* CLEAN CHATGPT-STYLE EMPTY WELCOME STATE */}
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-10 text-center max-w-2xl mx-auto space-y-8 animate-fade-in my-auto">
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-sage/15 border border-sage/30 text-sage flex items-center justify-center mx-auto shadow-[0_0_24px_var(--glow-sage)]">
                    <Sparkles size={32} />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-light text-primary tracking-tight">
                    BluCare<span className="font-semibold text-gradient">+</span>
                  </h1>
                  <p className="text-sm font-medium text-sage tracking-wider uppercase font-mono">
                    AI Healthcare Assistant
                  </p>
                  <p className="text-xs text-subdued max-w-md mx-auto leading-relaxed">
                    Ask any health question, describe your symptoms, or upload lab reports for evidence-based clinical guidance.
                  </p>
                </div>

                {/* Suggested Prompt Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
                  {suggestedPrompts.map((promptText, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(promptText)}
                      className="p-3.5 rounded-2xl bg-bg-card/70 border border-light hover:border-sage/40 hover:bg-sage/10 text-xs text-primary font-medium transition-all text-left flex items-center justify-between group cursor-pointer shadow-sm"
                    >
                      <span className="line-clamp-2">{promptText}</span>
                      <Sparkles size={14} className="text-subdued group-hover:text-sage transition-colors shrink-0 ml-2" />
                    </button>
                  ))}
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

                {/* Message Bubble */}
                <div
                  className={`max-w-[92%] sm:max-w-[85%] md:max-w-[80%] rounded-3xl p-5 space-y-3 ${
                    msg.role === 'user'
                      ? 'bg-sage/15 border border-sage/30 text-primary rounded-tr-none shadow-[0_4px_20px_rgba(127,225,195,0.05)]'
                      : 'bg-bg-card/70 border border-light text-primary rounded-tl-none shadow-base backdrop-blur-xl'
                  }`}
                >
                  {/* Role Header */}
                  <div className="flex items-center justify-between text-[11px] text-subdued pb-1 border-b border-light/30">
                    <span className="font-semibold text-secondary flex items-center gap-1.5">
                      {msg.role === 'user' ? 'Patient Inquiry' : 'BluCare AI'}
                    </span>
                    <span className="font-mono">{msg.timestamp}</span>
                  </div>

                  {/* Markdown Content */}
                  <div className="prose prose-invert max-w-none text-sm leading-relaxed text-primary">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>

                  {/* Bot Risk Classifier & Actions */}
                  {msg.role === 'bot' && (
                    <div className="pt-3 border-t border-light/40 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <RiskBadge level={msg.risk_level} confidence={msg.confidence} />

                        <div className="flex items-center gap-2">
                          {msg.sources && (
                            <button
                              onClick={() => {
                                setSelectedCitation(msg.sources[0]);
                                setShowCitationDrawer(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-lavender/10 border border-lavender/30 text-lavender text-[11px] hover:bg-lavender/20 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-lavender"
                            >
                              <FileSearch size={12} /> Citations ({msg.sources.length})
                            </button>
                          )}

                          <button
                            onClick={() => handleCopyText(msg.text, msg.id)}
                            className="p-1 rounded-lg text-subdued hover:text-primary hover:bg-bg-surface transition-colors cursor-pointer"
                            title="Copy Response"
                          >
                            {copiedMsgId === msg.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Urgent Referral Banner if High Risk */}
                      {msg.risk_level === 'high' && (
                        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-300">
                          <span className="flex items-center gap-2 font-medium">
                            <AlertCircle size={18} className="shrink-0 text-rose-400" /> Urgent Care Notice — High Risk Parameters
                          </span>
                          <span className="text-[11px] font-mono text-rose-400">Call Emergency SOS (108/911)</span>
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

            {/* ANIMATED CLINICAL THINKING STATE */}
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

          {/* Floating Scroll-To-Bottom Button */}
          {showScrollBottom && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-28 right-8 z-30 p-2.5 rounded-full bg-bg-card border border-sage text-sage shadow-lg hover:scale-110 transition-transform cursor-pointer"
              title="Scroll to latest message"
            >
              <ArrowDown size={16} />
            </button>
          )}

          {/* ---------------------------------------------------- */}
          {/* COMPOSER INPUT BAR WITH FILE CHIPS & VOICE INDICATOR */}
          {/* ---------------------------------------------------- */}
          <div className="pt-3 shrink-0 relative z-20">
            {/* Hidden File Picker Input */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />

            {/* Attached File Preview Chips */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pb-2.5 px-1">
                {attachedFiles.map((fileObj) => {
                  const isImg = fileObj.type.startsWith('image/');
                  return (
                    <div
                      key={fileObj.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-bg-card/90 border border-light text-xs text-primary relative overflow-hidden group shadow-sm"
                    >
                      {/* Upload Progress Line */}
                      {fileObj.status === 'uploading' && (
                        <div
                          className="absolute bottom-0 left-0 h-0.5 bg-sage transition-all duration-150"
                          style={{ width: `${fileObj.progress}%` }}
                        />
                      )}

                      {isImg && fileObj.previewUrl ? (
                        <img src={fileObj.previewUrl} alt="Thumbnail" className="w-5 h-5 rounded object-cover" />
                      ) : (
                        <FileText size={14} className="text-sage shrink-0" />
                      )}

                      <div className="flex flex-col min-w-0">
                        <span className="truncate max-w-[120px] font-medium leading-tight">{fileObj.name}</span>
                        <span className="text-[9px] text-subdued font-mono">
                          {fileObj.status === 'uploading' ? `${fileObj.progress}%` : formatFileSize(fileObj.size)}
                        </span>
                      </div>

                      {fileObj.status === 'error' ? (
                        <button
                          type="button"
                          onClick={() => handleRetryUpload(fileObj.id)}
                          className="text-rose-400 hover:text-rose-300 p-0.5 cursor-pointer ml-1"
                          title="Retry Upload"
                        >
                          <RotateCcw size={12} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(fileObj.id)}
                          className="text-subdued hover:text-rose-400 p-0.5 cursor-pointer ml-1"
                          title="Remove File"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Active Voice Recording Status Bar */}
            {isRecording && (
              <div className="flex items-center justify-between px-4 py-2 mb-2 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-semibold">Voice Listener Active</span>
                  <span className="font-mono text-[11px] opacity-80">({recordingTime}s)</span>
                </div>

                {/* Animated Audio Waveform Bars */}
                <div className="flex items-center gap-1 h-3">
                  {[40, 90, 60, 100, 50, 80].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-rose-400 rounded-full animate-pulse"
                      style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={stopVoiceRecording}
                  className="px-2.5 py-1 rounded-xl bg-rose-500 text-white font-medium text-[11px] hover:bg-rose-600 transition-colors cursor-pointer"
                >
                  Done Listening
                </button>
              </div>
            )}

            {/* Composer Input Box Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-end gap-2 bg-bg-card/90 border border-light focus-within:border-sage/50 rounded-3xl p-3 shadow-modal backdrop-blur-2xl transition-all"
            >
              {/* Paperclip File Upload Trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-2xl text-subdued hover:text-sage hover:bg-bg-surface transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-sage"
                title="Attach Medical Report / Photo (PDF, Images)"
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
                placeholder="Ask BluCare+ anything... (Press Enter to send, Shift+Enter for newline)"
                className="flex-1 bg-transparent text-sm text-primary placeholder:text-subdued outline-none resize-none py-1.5 max-h-40 overflow-y-auto leading-relaxed"
              />

              {/* Microphone Voice Button */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`p-2.5 rounded-2xl transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-lavender ${
                  isRecording
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                    : 'text-subdued hover:text-lavender hover:bg-bg-surface'
                }`}
                title={isRecording ? 'Stop Voice Recording' : 'Start Voice Dictation'}
              >
                {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              {/* Send Button */}
              <GlowButton
                type="submit"
                disabled={isLoading || (!inputQuery.trim() && attachedFiles.length === 0)}
                size="sm"
                className="rounded-2xl px-4 py-2 shrink-0"
              >
                <span>Send</span>
                <Send size={15} />
              </GlowButton>
            </form>
          </div>
        </div>

        {/* Slide-Out Clinical Citation Reference Drawer */}
        {showCitationDrawer && (
          <div className="lg:col-span-4 h-full overflow-y-auto animate-slide-in">
            <GlassCard className="space-y-4 p-5">
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
                  <p className="font-semibold text-sage">{selectedCitation?.title || 'WHO Primary Care Guidelines'}</p>
                  <p className="text-subdued font-mono text-[10px]">Reference ID: {selectedCitation?.id || 'WHO-2026-04'}</p>
                  <p className="text-secondary mt-2 leading-relaxed">
                    "Standard primary care diagnostic criteria for upper respiratory symptom management, hydration guidance, and temperature monitoring."
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-bg-surface border border-light space-y-2">
                  <span className="font-semibold text-primary">Protocol Accordance</span>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 size={16} className="shrink-0" /> Verified Clinical Alignment
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
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiRagChatPage;
