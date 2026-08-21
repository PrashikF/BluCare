// src/components/navigation/TopHeader.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Plus, Sparkles, Menu, ShieldAlert, User, Settings, HelpCircle, ChevronDown, LogOut } from 'lucide-react';
import { useNavigate, useParams, useLocation, NavLink } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { getSessionById, createSession } from '../../utils/chatStorage';
import { useToast } from '../../contexts/ToastContext';

const routeLabels = {
  '/app/chat': 'AI Healthcare Assistant',
  '/app/hospitals': 'Ambulance Assistance (SOS)',
  '/app/profile': 'Patient Profile',
  '/app/settings': 'Care Protocol Settings',
  '/app/help': 'Help & Safety Center',
};

const TopHeader = ({ isCollapsed, setIsCollapsed }) => {
  const [theme, setTheme] = useState(localStorage.getItem('blucare_theme') || 'dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = useParams();
  const { addToast } = useToast();
  const { user } = useUser();
  const { signOut } = useClerk();

  const currentSession = sessionId ? getSessionById(sessionId) : null;
  const activeLabel = routeLabels[location.pathname] || (currentSession ? currentSession.title : 'AI Healthcare Assistant');

  const displayName = user?.fullName || user?.firstName || 'Authenticated Patient';
  const displayEmail = user?.primaryEmailAddress?.emailAddress || 'patient@ragblucare.ai';
  const avatarUrl = user?.imageUrl;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('blucare_theme', theme);
  }, [theme]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleNewChat = () => {
    const newSess = createSession('New Health Consultation');
    window.dispatchEvent(new Event('blucare_sessions_updated'));
    navigate(`/app/chat/${newSess.id}`);
    addToast('New conversation initialized', 'info');
  };

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    addToast('Signing out of BluCare+...', 'info');
    await signOut(() => navigate('/'));
  };

  return (
    <header className="w-full h-16 shrink-0 bg-nav-bg/90 backdrop-blur-xl border-b border-light flex items-center justify-between px-4 sm:px-6 relative z-30">
      {/* Left: Mobile Sidebar Toggle & Location Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-xl text-subdued hover:text-primary hover:bg-bg-card/50 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-sage"
          title="Toggle Navigation Sidebar"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <NavLink
            to="/"
            className="w-6 h-6 rounded-lg bg-sage/15 border border-sage/30 text-sage flex items-center justify-center shrink-0 hover:scale-105 transition-transform cursor-pointer"
            title="BluCare+ Home (Public Landing)"
          >
            <Sparkles size={12} />
          </NavLink>
          <h1 className="text-sm font-semibold text-primary truncate max-w-xs sm:max-w-md md:max-w-lg">
            {activeLabel}
          </h1>
        </div>
      </div>

      {/* Right Actions: SOS, New Chat, Theme Toggle, Account Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Emergency SOS Button */}
        <button
          onClick={() => navigate('/app/hospitals')}
          className="px-2.5 sm:px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(244,63,94,0.2)] shrink-0 focus-visible:outline-2 focus-visible:outline-rose-400"
          title="Emergency Care & Ambulance Assistance"
        >
          <ShieldAlert size={14} />
          <span className="hidden sm:inline">Emergency SOS</span>
        </button>

        {/* New Chat Quick Action */}
        <button
          onClick={handleNewChat}
          className="px-3 py-1.5 rounded-full bg-sage/10 border border-sage/30 text-sage hover:bg-sage hover:text-bg-base transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_var(--glow-sage)]"
          title="Start New Chat"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-subdued hover:text-lavender hover:bg-bg-card/50 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-sage"
          title="Toggle Dark / Light Theme"
          aria-label="Toggle Dark / Light Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User Account Menu Dropdown */}
        <div className="relative pl-1 border-l border-light" ref={dropdownRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-bg-card/60 transition-colors cursor-pointer group focus-visible:outline-2 focus-visible:outline-sage"
            title="Account Options"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-8 h-8 rounded-full border border-sage/30 object-cover shadow-[0_0_10px_var(--glow-sage)] group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-sage/15 border border-sage/30 text-sage flex items-center justify-center font-semibold text-xs shadow-[0_0_10px_var(--glow-sage)] group-hover:scale-105 transition-transform">
                {displayName.charAt(0)}
              </div>
            )}
            <ChevronDown size={14} className="text-subdued group-hover:text-primary transition-colors hidden sm:block" />
          </button>

          {/* Dropdown Menu Container */}
          {isMenuOpen && (
            <div className="absolute right-0 top-12 w-60 bg-bg-card/95 border border-light rounded-2xl shadow-modal backdrop-blur-2xl p-2 z-50 animate-fade-in space-y-1">
              <div className="px-3 py-2 border-b border-light mb-1">
                <p className="text-xs font-semibold text-primary truncate">{displayName}</p>
                <p className="text-[10px] text-subdued font-mono truncate">{displayEmail}</p>
              </div>

              <button
                onClick={() => {
                  navigate('/app/profile');
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-secondary hover:text-primary hover:bg-sage/10 transition-colors cursor-pointer text-left"
              >
                <User size={15} className="text-sage" />
                <span>Patient Profile</span>
              </button>

              <button
                onClick={() => {
                  navigate('/app/settings');
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-secondary hover:text-primary hover:bg-sage/10 transition-colors cursor-pointer text-left"
              >
                <Settings size={15} className="text-lavender" />
                <span>Care Settings</span>
              </button>

              <button
                onClick={() => {
                  navigate('/app/help');
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-secondary hover:text-primary hover:bg-sage/10 transition-colors cursor-pointer text-left"
              >
                <HelpCircle size={15} className="text-subdued" />
                <span>Help & Safety Center</span>
              </button>

              <div className="pt-1 border-t border-light">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer text-left font-medium"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
