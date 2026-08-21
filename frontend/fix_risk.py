import os
import re

chat_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/pages/MultiRagChatPage.jsx'
with open(chat_path, 'r') as f:
    chat = f.read()

# Replace the RiskBadge footer with a clean, spaceless one
old_footer = """              {/* Bot Risk Classifier & Actions */}
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
              )}"""

new_footer = """              {/* Bot Actions (No Risk Badge) */}
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
              )}"""

chat = chat.replace(old_footer, new_footer)

with open(chat_path, 'w') as f:
    f.write(chat)

print("Risk Badge Removed!")
