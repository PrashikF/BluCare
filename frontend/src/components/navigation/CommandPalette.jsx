// src/components/navigation/CommandPalette.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Stethoscope,
  BookOpen,
  FileText,
  Pill,
  Hospital,
  BookMarked,
  TrendingUp,
  Settings,
  User,
  HelpCircle,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const CommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose ? onClose() : null;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { title: 'Dashboard Overview', path: '/app/dashboard', icon: LayoutDashboard, category: 'Workspaces' },
    { title: 'Symptom Assessment', path: '/app/chat/diagnostic', icon: Stethoscope, category: 'Clinical Care' },
    { title: 'Medical Research Portal', path: '/app/chat/literature', icon: BookOpen, category: 'Clinical Care' },
    { title: 'Personal Health Records', path: '/app/chat/records', icon: FileText, category: 'Health Records' },
    { title: 'Medication & Dosage Guide', path: '/app/chat/pharmacy', icon: Pill, category: 'Health Records' },
    { title: 'Hospital & Emergency Finder', path: '/app/hospitals', icon: Hospital, category: 'Emergency' },
    { title: 'Medical Journal & Briefs', path: '/app/journal', icon: BookMarked, category: 'Health Records' },
    { title: 'Health Risk Analytics', path: '/app/analytics', icon: TrendingUp, category: 'Insights' },
    { title: 'Patient Profile', path: '/app/profile', icon: User, category: 'Account' },
    { title: 'Care Protocol Settings', path: '/app/settings', icon: Settings, category: 'System' },
    { title: 'Help & Safety Center', path: '/app/help', icon: HelpCircle, category: 'Support' },
  ];

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-bg-card/90 border border-light rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden backdrop-blur-2xl">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-light">
          <Search size={20} className="text-sage shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, search symptoms, or jump to workspace..."
            className="flex-1 bg-transparent text-primary text-base placeholder:text-subdued outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-subdued hover:text-primary hover:bg-bg-surface transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Command Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(cmd.path)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left text-sm text-secondary hover:text-primary hover:bg-sage/10 hover:border-sage/20 border border-transparent transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-bg-surface border border-light flex items-center justify-center text-sage group-hover:border-sage/30">
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-primary leading-snug">{cmd.title}</p>
                      <p className="text-[10px] text-subdued uppercase tracking-wider">{cmd.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-subdued group-hover:text-sage">
                    <span>Jump</span>
                    <ArrowRight size={14} />
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-12 text-center text-subdued space-y-2">
              <Sparkles size={24} className="mx-auto text-subdued/50" />
              <p className="text-sm">No commands matching "{query}"</p>
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-5 py-3 border-t border-light bg-bg-surface/50 text-xs text-subdued flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-bg-card border border-light text-[10px] text-primary">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-bg-card border border-light text-[10px] text-primary">↵</kbd> Select
            </span>
          </div>
          <span className="text-[11px] text-sage font-mono">BluCare+ Linear Command Engine</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
