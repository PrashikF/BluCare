import re

with open('/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/pages/MultiRagChatPage.jsx', 'r') as f:
    content = f.read()

# We want to find `return (\n    <div\n      onDragOver={handleDragOver}` 
# up to `  );\n};\n\nexport default MultiRagChatPage;`

start_str = "  return (\n    <div\n      onDragOver={handleDragOver}"
end_str = "  );\n};\n\nexport default MultiRagChatPage;"

start_idx = content.find(start_str)
end_idx = content.find(end_str) + len(end_str)

if start_idx == -1 or end_idx == -1:
    print(f"Error finding bounds: {start_idx} {end_idx}")
    exit(1)

new_jsx = """  return (
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

        {messages.map((msg, index) => (
          <div key={msg.id} className={`message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}>
            <div className="speaker-label">{msg.role === 'user' ? 'Prashik' : 'Yukti'}</div>
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

              {/* Bot Risk Classifier & Actions */}
              {msg.role === 'bot' && (
                <div className="pt-3 border-t border-light/40 space-y-3 mt-4">
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
                  {msg.risk_level === 'high' && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-300 mt-2">
                      <span className="flex items-center gap-2 font-medium">
                        <AlertCircle size={18} className="shrink-0 text-rose-400" /> Urgent Care Notice — High Risk Parameters
                      </span>
                      <span className="text-[11px] font-mono text-rose-400">Call Emergency SOS (108/911)</span>
                    </div>
                  )}
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
              <div className="flex items-center gap-3 text-primary font-medium text-[1.1rem]">
                  <div className="brand-dot" style={{ boxShadow: 'none' }}></div>
                  BluCare+ Voice
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
                {isRecording ? 'Prashik' : 'Yukti'}
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
"""

new_content = content[:start_idx] + new_jsx

with open('/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/pages/MultiRagChatPage.jsx', 'w') as f:
    f.write(new_content)
