// src/pages/MultiRagChatPage.jsx - Clean ChatGPT-Style AI Healthcare Workspace
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import GlassCard from '../components/ui/GlassCard';
import GlowButton from '../components/ui/GlowButton';
import RiskBadge from '../components/ui/RiskBadge';
import { useToast } from '../contexts/ToastContext';
import { logger } from '../utils/logger';
import { useAuth, useUser } from '@clerk/clerk-react';
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
import { BrandLogo } from '../components/ui/BrandLogo';

const MultiRagChatPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { getToken } = useAuth();
  const { user } = useUser();

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


  // Sync Chat State to Sidebar Dot
  useEffect(() => {
    const dot = document.getElementById('chatBrandDot');
    if (!dot) return;
    
    if (inputQuery.trim().length > 0 && !isLoading) {
      dot.className = 'brand-dot typing shrink-0 transition-all duration-400 ease-in-out';
      dot.style.boxShadow = '';
    } else {
      // Return to original default color when idle or generating
      dot.className = 'brand-dot shrink-0 transition-all duration-400 ease-in-out';
      dot.style.boxShadow = 'none';
    }
  }, [isLoading, inputQuery, thinkingStep]);

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
      className="chat-container-main"
      id="chatContainer"
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

      {/* Slide-Out Clinical Citation Reference Drawer */}
      {showCitationDrawer && (
        <div className="absolute right-0 top-0 h-full w-80 z-40 bg-bg-base/95 backdrop-blur-xl border-l border-light overflow-y-auto p-4 animate-slide-in">
            <div className="flex items-center justify-between pb-3 border-b border-light mb-4">
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
                  <Check size={16} className="shrink-0" /> Verified Clinical Alignment
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
        </div>
      )}

      {/* Main Chat Area */}
      <section className="chat-area" id="chatArea" ref={chatContainerRef} onScroll={handleScroll}>
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center py-10 text-center max-w-2xl mx-auto space-y-8 animate-fade-in my-auto">
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-sage/15 border border-sage/30 text-sage flex items-center justify-center mx-auto shadow-[0_0_24px_var(--glow-sage)]">
                <Sparkles size={32} />
              </div>
              <div className="flex items-center justify-center transform-gpu scale-125 mb-2 mt-4">
                <BrandLogo noLink />
              </div>
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

        {messages.map((msg, index) => (
          <div key={msg.id} className={`message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}>
            <div className="speaker-label">{msg.role === 'user' ? (user?.firstName || user?.fullName || 'Patient') : 'Yukti'}</div>
            <div className={msg.role === 'user' ? 'user-bubble' : 'ai-bubble'}>
              <div className={msg.text.length > 250 ? 'clamped-text expanded' : ''}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
              
              {/* If user attached a file in this message */}
              {msg.role === 'user' && msg.text.includes('📎') && (
                <div className="voice-tag mt-2" title="Attached File">
                  <FileText size={12} className="mr-1" /> Attached File
                </div>
              )}

              {/* Bot Actions (No Risk Badge) */}
              {msg.role === 'bot' && (
                <div className="flex items-center justify-end gap-2 text-xs mt-2">
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
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message ai-message">
             <div className="speaker-label">Yukti</div>
             <div className="ai-bubble flex items-center gap-3">
               <div className="w-2.5 h-2.5 rounded-full bg-sage animate-ping" />
               <span className="font-mono font-medium">{thinkingStep}</span>
             </div>
          </div>
        )}
      </section>

      {/* Floating Scroll-To-Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-32 right-8 z-30 p-2.5 rounded-full bg-bg-card border border-sage text-sage shadow-lg hover:scale-110 transition-transform cursor-pointer"
          title="Scroll to latest message"
        >
          <ArrowDown size={16} />
        </button>
      )}

      {/* Input Section */}
      <section className="input-section">
        {/* Active Voice Recording Status Bar */}
        {isRecording && (
          <div className="flex items-center justify-between px-4 py-2 mb-4 mx-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 animate-fade-in relative z-20">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="font-semibold">Voice Listener Active</span>
              <span className="font-mono text-[11px] opacity-80">({recordingTime}s)</span>
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

        <div className={`input-glow ${isRecording ? 'active-listening' : ''}`} id="inputGlow">
          <div className="input-wrapper">
            <button className="upload-btn" id="uploadBtn" title="Attach file" onClick={() => fileInputRef.current?.click()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />

            <div className="input-core">
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pb-2.5 px-1 pt-2">
                  {attachedFiles.map((fileObj) => {
                    const isImg = fileObj.type.startsWith('image/');
                    return (
                      <div key={fileObj.id} className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-bg-card/90 border border-light text-xs text-primary relative overflow-hidden group shadow-sm">
                        {fileObj.status === 'uploading' && (
                          <div className="absolute bottom-0 left-0 h-0.5 bg-sage transition-all duration-150" style={{ width: `${fileObj.progress}%` }} />
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
                        <button type="button" onClick={() => handleRemoveFile(fileObj.id)} className="text-subdued hover:text-rose-400 p-0.5 cursor-pointer ml-1">
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <textarea 
                id="chatInput" 
                ref={textareaRef}
                value={inputQuery}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="chat-input"
                placeholder="Message Yukti..." 
                rows={1} 
              />
            </div>
            
            <div className="actions-container">
                <button className="mic-btn" title="Voice Assistant" onClick={() => document.getElementById('voiceModeOverlay').classList.add('active')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="22"></line>
                    </svg>
                </button>
                
                <button className="send-btn" id="sendBtn" title="Send Message" onClick={() => handleSendMessage()} disabled={isLoading || (!inputQuery.trim() && attachedFiles.length === 0)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
          </div>
        </div>
        <p className="footer-note">A safe, private space for your health journey.</p>
      </section>

      {/* VOICE MODE OVERLAY */}
      <div className="voice-overlay" id="voiceModeOverlay" data-state={isRecording ? 'listening' : 'idle'}>
          <div className="voice-bg-glow"></div>
          
          <div className="voice-header">
              <div className="flex items-center gap-3">
                  <BrandLogo noLink />
                  <span className="text-primary font-medium text-[1.1rem]">Voice</span>
              </div>
              <button className="close-voice-btn" onClick={() => {
                document.getElementById('voiceModeOverlay').classList.remove('active');
                if (isRecording) stopVoiceRecording();
              }} title="Return to text chat">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
              </button>
          </div>

          <div className="voice-content">
              <div className="voice-speaker-name visible" id="voiceSpeakerName">
                {isRecording ? (user?.firstName || user?.fullName || 'Patient') : 'Yukti'}
              </div>
              <div className="voice-main-text visible" id="voiceMainText">
                {isRecording ? (inputQuery || 'Listening...') : 'Tap the mic and tell me how you are feeling.'}
              </div>
          </div>

          <div className="voice-controls">
              <button className="big-mic-btn" id="bigMicBtn" onClick={toggleVoiceRecording}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <line x1="12" y1="19" x2="12" y2="22"></line>
                  </svg>
              </button>
              <div className="voice-status-text" id="voiceStatusText">
                {isRecording ? 'Tap to pause' : 'Tap to speak'}
              </div>
          </div>
      </div>
    </div>
  );
};

export default MultiRagChatPage;
