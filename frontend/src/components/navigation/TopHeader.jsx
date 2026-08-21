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
    <header className="w-full h-16 shrink-0 bg-transparent flex items-center justify-between px-4 sm:px-6 relative z-30">
      {/* Left: Location Title */}
      <div className="flex items-center gap-3 min-w-0 pl-2">
        <h1 className="text-sm font-semibold text-primary truncate max-w-xs sm:max-w-md md:max-w-lg">
          {activeLabel}
        </h1>
      </div>

      {/* Right Actions: SOS, New Chat, Theme Toggle, Account Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Emergency SOS Button */}
        <button
          onClick={() => navigate('/app/hospitals')}
          className="px-2.5 sm:px-3 py-1.5 rounded-full bg-transparent border border-rose-400/50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:shadow-[0_0_15px_rgba(242,155,155,0.3)] dark:hover:bg-rose-600 dark:hover:border-rose-600 shrink-0 focus-visible:outline-2 focus-visible:outline-rose-400"
          title="Emergency Care & Ambulance Assistance"
        >
          <ShieldAlert size={14} />
          <span className="hidden sm:inline">Emergency SOS</span>
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

        {/* Temporary Chat Control */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-light text-subdued hover:bg-bg-card/50 hover:text-primary transition-colors cursor-pointer text-xs font-medium focus-visible:outline-2 focus-visible:outline-sage"
          title="Temporary Chat (Not saved)"
        >
          <Sparkles size={14} />
          <span className="hidden sm:inline">Temporary Chat</span>
        </button>
      </div>
    </header>
  );
};

export default TopHeader;
