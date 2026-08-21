import os

sidebar_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/navigation/Sidebar.jsx'

sidebar_content = """import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useParams, useLocation } from 'react-router-dom';
import { BrandLogo } from '../ui/BrandLogo';
import { useUser, useClerk } from '@clerk/clerk-react';
import {
  Plus,
  MessageSquare,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Menu,
  ChevronDown,
  User,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import {
  getSessions,
  createSession,
  renameSession,
  deleteSession,
  setActiveSessionId,
} from '../../utils/chatStorage';
import { useToast } from '../../contexts/ToastContext';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = useParams();
  const { addToast } = useToast();
  const { user } = useUser();
  const { signOut } = useClerk();

  const [sessions, setSessions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const displayName = user?.fullName || user?.firstName || 'Patient';
  const displayEmail = user?.primaryEmailAddress?.emailAddress || '';
  const avatarUrl = user?.imageUrl;

  const loadSessions = () => {
    const list = getSessions();
    setSessions(list);
  };

  useEffect(() => {
    loadSessions();

    const handleStorageChange = () => loadSessions();
    window.addEventListener('blucare_sessions_updated', handleStorageChange);
    return () => window.removeEventListener('blucare_sessions_updated', handleStorageChange);
  }, [location.pathname]);

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

  const handleCreateNewChat = () => {
    const newSess = createSession('New Health Consultation');
    loadSessions();
    window.dispatchEvent(new Event('blucare_sessions_updated'));
    navigate(`/app/chat/${newSess.id}`);
    addToast('New conversation initialized', 'info');
  };

  const handleStartRename = (e, sess) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingId(sess.id);
    setEditingTitle(sess.title);
  };

  const handleSaveRename = (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    if (editingTitle.trim()) {
      renameSession(id, editingTitle.trim());
      loadSessions();
      window.dispatchEvent(new Event('blucare_sessions_updated'));
      addToast('Conversation renamed', 'success');
    }
    setEditingId(null);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingId(null);
  };

  const handleDelete = (e, id, title) => {
    e.stopPropagation();
    e.preventDefault();
    deleteSession(id);
    loadSessions();
    window.dispatchEvent(new Event('blucare_sessions_updated'));
    addToast(`Deleted "${title || 'Chat'}"`, 'info');

    if (sessionId === id) {
      navigate('/app/chat');
    }
  };

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    addToast('Signing out of BluCare+...', 'info');
    await signOut(() => navigate('/'));
  };

  const renderSessionItem = (sess) => {
    const isActive = location.pathname === `/app/chat/${sess.id}` || location.pathname === `/chat/${sess.id}`;
    const isEditing = editingId === sess.id;

    if (isEditing) {
      return (
        <div key={sess.id} className="flex items-center gap-1.5 px-3 h-10 mx-4 rounded-xl bg-bg-card/90 border border-sage/40">
          <input
            type="text"
            autoFocus
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRename(e, sess.id);
              if (e.key === 'Escape') handleCancelRename(e);
            }}
            className="flex-1 bg-transparent text-[13px] text-primary outline-none min-w-0"
          />
          <button
            onClick={(e) => handleSaveRename(e, sess.id)}
            className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded cursor-pointer shrink-0"
            title="Save"
          >
            <Check size={14} />
          </button>
          <button
            onClick={handleCancelRename}
            className="p-1 text-subdued hover:bg-bg-surface rounded cursor-pointer shrink-0"
            title="Cancel"
          >
            <X size={14} />
          </button>
        </div>
      );
    }

    return (
      <div key={sess.id} className="px-4">
        <NavLink
          to={`/app/chat/${sess.id}`}
          onClick={() => setActiveSessionId(sess.id)}
          title={sess.title}
          className={`group flex items-center h-10 w-full rounded-full transition-all no-underline overflow-hidden ${
            isActive
              ? 'bg-sage/15 text-sage'
              : 'text-secondary hover:bg-bg-surface/60 hover:text-primary'
          }`}
        >
          {/* Fixed Icon Wrapper for perfect center alignment (40px) */}
          <div className="w-10 h-10 shrink-0 flex items-center justify-center">
            <MessageSquare size={18} className={`${isActive ? 'text-sage' : 'text-subdued group-hover:text-primary'}`} />
          </div>
          
          <div className="flex items-center justify-between flex-1 min-w-0 pr-3 opacity-100">
            <span className={`truncate text-[13px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{sess.title}</span>
            
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
              <button
                onClick={(e) => handleStartRename(e, sess)}
                className="p-1 rounded-full text-subdued hover:text-primary hover:bg-bg-card transition-colors cursor-pointer"
                title="Rename"
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={(e) => handleDelete(e, sess.id, sess.title)}
                className="p-1 rounded-full text-subdued hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        </NavLink>
      </div>
    );
  };

  return (
    <aside
      role="navigation"
      aria-label="Main Navigation"
      aria-expanded={!isCollapsed}
      className={`relative h-full shrink-0 z-40 bg-transparent transition-[width] duration-300 ease-in-out flex flex-col overflow-hidden ${
        isCollapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      <div className="w-64 h-full flex flex-col justify-between">
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Header Row (Brand Logo + Collapse Toggle) */}
          <div className="h-16 flex items-center px-4 w-full relative shrink-0">
            {/* Collapse Toggle as the primary alignment anchor */}
            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-subdued hover:text-primary hover:bg-bg-surface transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-sage"
                title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                <Menu size={20} />
              </button>
            </div>

            <div className={`ml-3 transition-opacity duration-300 flex items-center gap-2 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              <BrandLogo collapsed={false} showDot={true} dotId="chatBrandDot" />
            </div>
          </div>

          {/* New Chat Primary Button */}
          <div className="px-4 py-2 shrink-0">
            <button
              onClick={handleCreateNewChat}
              className={`flex items-center h-10 rounded-full bg-sage hover:bg-sage/90 text-bg-base transition-[width,background-color] duration-300 ease-in-out overflow-hidden cursor-pointer shadow-sm ${isCollapsed ? 'w-10' : 'w-full'}`}
              title="New Chat"
            >
              <div className="w-10 h-10 shrink-0 flex items-center justify-center text-bg-base">
                <Plus size={18} />
              </div>
              <span className={`whitespace-nowrap text-[13px] font-semibold text-bg-base transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'} pr-4`}>
                New chat
              </span>
            </button>
          </div>

          {/* Clean Flat Chat History List (Hidden completely when collapsed) */}
          <div className={`flex-1 overflow-y-auto py-2 space-y-1 scrollbar-thin transition-opacity duration-300 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            {sessions.map(renderSessionItem)}

            {sessions.length === 0 && (
              <div className="py-8 text-center text-subdued space-y-2">
                <Sparkles size={20} className="mx-auto text-subdued/50" />
                <p className="text-[13px]">No previous chats</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Profile & Status (Dropdown logic imported from TopHeader) */}
        <div className="px-4 py-4 shrink-0 border-t border-transparent relative" ref={dropdownRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex items-center h-10 rounded-full transition-[width,background-color] duration-300 ease-in-out overflow-hidden cursor-pointer hover:bg-bg-card/60 w-full group ${isCollapsed ? 'w-10' : 'w-full'}`}
          >
            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-8 h-8 rounded-full border border-sage/20 object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-sage/15 border border-sage/20 text-sage flex items-center justify-center font-semibold text-xs shrink-0">
                  {displayName.charAt(0)}
                </div>
              )}
            </div>
            
            <div className={`ml-2 flex flex-1 items-center justify-between min-w-0 pr-3 transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
              <span className="text-[13px] font-medium text-primary truncate">
                {displayName}
              </span>
              <ChevronDown size={14} className="text-subdued group-hover:text-primary transition-colors shrink-0 ml-1" />
            </div>
          </button>

          {/* Dropdown Menu Container */}
          {isMenuOpen && !isCollapsed && (
            <div className="absolute left-4 bottom-14 w-60 bg-bg-card/95 border border-light rounded-2xl shadow-modal backdrop-blur-2xl p-2 z-50 animate-fade-in space-y-1">
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
    </aside>
  );
};

export default Sidebar;
"""

with open(sidebar_path, 'w') as f:
    f.write(sidebar_content)

print("Rewrote Sidebar.jsx")
