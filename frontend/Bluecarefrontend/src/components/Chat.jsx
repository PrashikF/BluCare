import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Paperclip, Mic, Send, ChevronDown, X, Volume2, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'blucare_chat_history';
const defaultGreeting = "Hello, I'm Yukti. I'm here to listen and help you navigate how you're feeling today. Take your time—whenever you're ready, you can type, upload a file, or speak to me.";

export default function Chat({ setStatusDotClass, user, onOpenVoice }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const chatAreaRef = useRef(null);
  const textareaRef = useRef(null);

  const [appState, setAppState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const cleanSessions = (parsed.sessions || []).filter(s => !s.isTemporary);
        if (cleanSessions.length > 0) {
          return {
            sessions: cleanSessions,
            currentSessionId: cleanSessions[cleanSessions.length - 1].id
          };
        }
      } catch (e) {}
    }
    const initialSession = {
      id: 'sess_' + Date.now(),
      timestamp: Date.now(),
      isTemporary: false,
      messages: [{ role: 'ai', content: defaultGreeting }]
    };
    return {
      sessions: [initialSession],
      currentSessionId: initialSession.id
    };
  });

  const [inputValue, setInputValue] = useState('');
  const [pendingFile, setPendingFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentSession = appState.sessions.find(s => s.id === appState.currentSessionId) || appState.sessions[0];

  // Save non-temporary state to localStorage
  useEffect(() => {
    const stateToSave = {
      ...appState,
      sessions: appState.sessions.filter(s => !s.isTemporary)
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [appState]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [currentSession?.messages, isGenerating]);

  // Adjust textarea height and typing dot state
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.style.overflowY = textareaRef.current.scrollHeight > 150 ? 'auto' : 'hidden';
    }

    if (!isGenerating) {
      if (val.trim().length > 0) {
        setStatusDotClass('typing');
      } else {
        setStatusDotClass('');
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setPendingFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleMessageExpand = (index) => {
    setAppState(prev => {
      const newSessions = prev.sessions.map(sess => {
        if (sess.id === prev.currentSessionId) {
          const newMsgs = [...sess.messages];
          newMsgs[index] = { ...newMsgs[index], expanded: !newMsgs[index].expanded };
          return { ...sess, messages: newMsgs };
        }
        return sess;
      });
      return { ...prev, sessions: newSessions };
    });
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text && !pendingFile) return;

    const userMsg = {
      role: 'user',
      content: text,
      attachment: pendingFile ? pendingFile.name : null,
      expanded: false
    };

    setAppState(prev => {
      const newSessions = prev.sessions.map(sess => {
        if (sess.id === prev.currentSessionId) {
          return { ...sess, messages: [...sess.messages, userMsg] };
        }
        return sess;
      });
      return { ...prev, sessions: newSessions };
    });

    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.overflowY = 'hidden';
    }
    clearFile();

    setIsGenerating(true);
    setStatusDotClass('generating');

    setTimeout(() => {
      const aiResponse = {
        role: 'ai',
        content: "I'm listening carefully. Take a deep breath, I'm here to help you work through this. Could you tell me a little more about what's on your mind?"
      };

      setAppState(prev => {
        const newSessions = prev.sessions.map(sess => {
          if (sess.id === prev.currentSessionId) {
            return { ...sess, messages: [...sess.messages, aiResponse] };
          }
          return sess;
        });
        return { ...prev, sessions: newSessions };
      });

      setIsGenerating(false);
      setStatusDotClass('');
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      {/* Messages Scroll Area */}
      <section className="chat-area" ref={chatAreaRef}>
        {currentSession?.messages.map((msg, index) => {
          const isAi = msg.role === 'ai';
          const isLongText = (msg.content || '').length > 250;

          return (
            <div key={index} className={`message ${isAi ? 'ai-message' : 'user-message'}`}>
              <div className="speaker-label">
                {isAi ? 'Yukti' : (user?.name || 'Prashik')}
              </div>

              {isAi ? (
                <div className="ai-bubble">
                  {msg.content}
                </div>
              ) : (
                <div className="user-bubble">
                  <div className={`clamped-text ${msg.expanded ? 'expanded' : ''}`}>
                    {msg.content}
                  </div>

                  {msg.attachment && (
                    <div className="voice-tag" title="Attached File">
                      <Paperclip size={12} />
                      <span>{msg.attachment}</span>
                    </div>
                  )}

                  {isLongText && (
                    <button
                      className={`expand-toggle ${msg.expanded ? 'expanded' : ''}`}
                      onClick={() => toggleMessageExpand(index)}
                      title={msg.expanded ? 'Collapse' : 'Expand'}
                    >
                      <ChevronDown size={20} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {isGenerating && (
          <div className="message ai-message">
            <div className="speaker-label">Yukti</div>
            <div className="ai-bubble flex items-center gap-2 text-[var(--text-subdued)] italic">
              <Sparkles size={16} className="animate-spin text-[var(--accent-sage)]" />
              <span>Yukti is reflecting...</span>
            </div>
          </div>
        )}
      </section>

      {/* Layered Glow Input Section */}
      <section className="input-section">
        <div className={`input-glow ${isGenerating ? 'active-listening' : ''}`}>
          <div className="input-wrapper">
            <button
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
            >
              <Plus size={20} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.txt"
            />

            <div className="input-core">
              {pendingFile && (
                <div className="file-indicator">
                  <Paperclip size={12} />
                  <span>{pendingFile.name}</span>
                  <span className="remove-file" onClick={clearFile}>&times;</span>
                </div>
              )}
              <textarea
                ref={textareaRef}
                className="chat-textarea"
                placeholder="Message Yukti..."
                rows={1}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="actions-container">
              <button
                className="mic-btn"
                title="Voice Assistant"
                onClick={() => {
                  if (onOpenVoice) onOpenVoice();
                  else navigate('/voice');
                }}
              >
                <Mic size={20} />
              </button>

              <button
                className="send-btn"
                onClick={handleSend}
                title="Send Message"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
        <p className="footer-note">A safe, private space for your health journey.</p>
      </section>
    </div>
  );
}
