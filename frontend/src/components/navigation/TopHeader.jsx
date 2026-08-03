// src/components/navigation/TopHeader.jsx
import React, { useState, useEffect } from 'react';
import { Search, Sun, Moon, Bell, Activity, Command, ChevronRight, ShieldAlert } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import CommandPalette from './CommandPalette';

const routeLabels = {
  '/app/dashboard': { category: 'Overview', name: 'Clinical Command Dashboard' },
  '/app/chat/diagnostic': { category: 'Clinical Care', name: 'Symptom Assessment' },
  '/app/chat/literature': { category: 'Clinical Care', name: 'Medical Research Portal' },
  '/app/chat/records': { category: 'Health Records', name: 'Personal Health Records' },
  '/app/chat/pharmacy': { category: 'Health Records', name: 'Medication & Dosage Guide' },
  '/app/hospitals': { category: 'Care Network', name: 'Hospital & Emergency Finder' },
  '/app/journal': { category: 'Health Records', name: 'Patient Medical Journal' },
  '/app/analytics': { category: 'Insights', name: 'Health Risk Analytics' },
  '/app/profile': { category: 'Account', name: 'Patient Profile' },
  '/app/settings': { category: 'System', name: 'Care Protocol Settings' },
  '/app/help': { category: 'Support', name: 'Help & Safety Center' },
};

const TopHeader = ({ isCollapsed }) => {
  const [theme, setTheme] = useState(localStorage.getItem('blucare_theme') || 'dark');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentRouteInfo = routeLabels[location.pathname] || { category: 'Workspace', name: 'Clinical Care' };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('blucare_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <>
      <header className="w-full h-20 shrink-0 bg-nav-bg backdrop-blur-xl border-b border-light flex items-center justify-between px-4 sm:px-6 relative z-30">
        {/* Breadcrumb Navigation Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs truncate max-w-[160px] sm:max-w-xs md:max-w-none">
          <span className="text-subdued font-medium hidden sm:inline">BluCare+</span>
          <ChevronRight size={14} className="text-subdued/60 hidden sm:inline" />
          <span className="text-secondary font-medium hidden md:inline">{currentRouteInfo.category}</span>
          <ChevronRight size={14} className="text-subdued/60 hidden md:inline" />
          <span className="text-sage font-semibold truncate">{currentRouteInfo.name}</span>
        </div>

        {/* Search Command Palette Trigger */}
        <button
          onClick={() => setIsCommandOpen(true)}
          className="hidden lg:flex items-center justify-between w-64 xl:w-80 bg-input-bg/70 hover:bg-bg-card border border-light focus:border-lavender rounded-xl px-3.5 py-2 text-xs text-subdued transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-sage"
        >
          <div className="flex items-center gap-2">
            <Search size={15} className="text-subdued" />
            <span className="truncate">Search symptoms, guides...</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-subdued bg-bg-surface px-1.5 py-0.5 rounded border border-light font-mono shrink-0">
            <Command size={10} /> K
          </div>
        </button>

        {/* Mobile Search Icon Button */}
        <button
          onClick={() => setIsCommandOpen(true)}
          className="flex lg:hidden p-2 rounded-xl text-subdued hover:text-primary hover:bg-bg-card/50 transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-sage"
          title="Search (Cmd + K)"
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        {/* Right Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick SOS Trigger Button */}
          <button
            onClick={() => navigate('/app/hospitals')}
            className="px-2.5 sm:px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors duration-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(244,63,94,0.2)] shrink-0 focus-visible:outline-2 focus-visible:outline-rose-400"
          >
            <ShieldAlert size={14} />
            <span className="hidden sm:inline">Emergency SOS</span>
          </button>

          {/* Clinical Health Badge */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-ai-bubble-bg border border-ai-bubble-border text-xs text-sage">
            <Activity size={14} className="animate-pulse" />
            <span>Clinical Active</span>
          </div>

          {/* Notifications */}
          <button
            className="p-2 rounded-xl text-subdued hover:text-primary hover:bg-bg-card/50 transition-colors duration-200 relative cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-sage"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sage" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-subdued hover:text-lavender hover:bg-bg-card/50 transition-colors duration-200 cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-sage"
            title="Toggle Dark / Light Theme"
            aria-label="Toggle Dark / Light Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Profile Trigger */}
          <button
            onClick={() => navigate('/app/profile')}
            className="pl-2 sm:pl-3 border-l border-light flex items-center gap-2.5 cursor-pointer group shrink-0 focus-visible:outline-2 focus-visible:outline-sage"
          >
            <div className="w-8 h-8 rounded-full bg-sage/15 border border-sage/30 text-sage flex items-center justify-center font-semibold text-xs shadow-[0_0_10px_var(--glow-sage)] group-hover:scale-105 transition-transform duration-200">
              P
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-primary leading-tight group-hover:text-sage transition-colors duration-200">Prashik K.</p>
              <p className="text-[10px] text-subdued">Patient Profile</p>
            </div>
          </button>
        </div>
      </header>

      {/* Global Command Palette Overlay */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  );
};

export default TopHeader;
