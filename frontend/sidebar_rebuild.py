import os

sidebar_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/navigation/Sidebar.jsx'

sidebar_content = """import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useParams, useLocation } from 'react-router-dom';
import { BrandLogo } from '../ui/BrandLogo';
import { useUser } from '@clerk/clerk-react';
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
  Menu
} from 'lucide-react';
import {
  getSessions,
  createSession,
  renameSession,
  deleteSession,
  groupSessionsByDate,
  setActiveSessionId,
} from '../../utils/chatStorage';
import { useToast } from '../../contexts/ToastContext';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = useParams();
  const { addToast } = useToast();
  const { user } = useUser();

  const [sessions, setSessions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const loadSessions = () => {
    const list = getSessions();
    setSessions(list);
  };

  useEffect(() => {
    loadSessions();

    // Listen for custom storage update events
    const handleStorageChange = () => loadSessions();
    window.addEventListener('blucare_sessions_updated', handleStorageChange);
    return () => window.removeEventListener('blucare_sessions_updated', handleStorageChange);
  }, [location.pathname]);

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

  const grouped = groupSessionsByDate(sessions);

  const renderSessionItem = (sess) => {
    const isActive = location.pathname === `/app/chat/${sess.id}` || location.pathname === `/chat/${sess.id}`;
    const isEditing = editingId === sess.id;

    if (isEditing) {
      return (
        <div key={sess.id} className="flex items-center gap-1.5 px-3 py-2 mx-2 rounded-xl bg-bg-card/90 border border-sage/40">
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
          title={isCollapsed ? sess.title : undefined}
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
          
          <div className={`flex items-center justify-between flex-1 min-w-0 pr-3 transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
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
              <BrandLogo collapsed={false} showDot={true} dotId="chatBrandDot" noLink />
            </div>
          </div>

          {/* New Chat Primary Button */}
          <div className="px-4 py-2 shrink-0">
            <button
              onClick={handleCreateNewChat}
              className={`flex items-center h-12 rounded-[24px] bg-bg-surface hover:bg-bg-card transition-[width,background-color] duration-300 ease-in-out overflow-hidden cursor-pointer shadow-sm border border-light/50 ${isCollapsed ? 'w-10 rounded-full' : 'w-full'}`}
              title="New Chat"
            >
              <div className="w-10 h-12 shrink-0 flex items-center justify-center text-subdued group-hover:text-primary">
                <Plus size={20} />
              </div>
              <span className={`whitespace-nowrap text-[13px] font-semibold text-primary transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'} pr-4`}>
                New chat
              </span>
            </button>
          </div>

          {/* Chronological Chat History List */}
          <div className="flex-1 overflow-y-auto py-2 space-y-1 scrollbar-thin">
            {/* Today */}
            {grouped.today.length > 0 && (
              <div className="space-y-1 mt-2">
                <div className={`px-4 h-6 flex items-end mb-2 transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                  <p className="px-3 text-[11px] font-medium text-subdued">Today</p>
                </div>
                {grouped.today.map(renderSessionItem)}
              </div>
            )}

            {/* Yesterday */}
            {grouped.yesterday.length > 0 && (
              <div className="space-y-1 mt-4">
                <div className={`px-4 h-6 flex items-end mb-2 transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                  <p className="px-3 text-[11px] font-medium text-subdued">Yesterday</p>
                </div>
                {grouped.yesterday.map(renderSessionItem)}
              </div>
            )}

            {/* Previous 7 Days */}
            {grouped.last7Days.length > 0 && (
              <div className="space-y-1 mt-4">
                <div className={`px-4 h-6 flex items-end mb-2 transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                  <p className="px-3 text-[11px] font-medium text-subdued">Previous 7 Days</p>
                </div>
                {grouped.last7Days.map(renderSessionItem)}
              </div>
            )}

            {/* Older */}
            {grouped.older.length > 0 && (
              <div className="space-y-1 mt-4">
                <div className={`px-4 h-6 flex items-end mb-2 transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                  <p className="px-3 text-[11px] font-medium text-subdued">Older</p>
                </div>
                {grouped.older.map(renderSessionItem)}
              </div>
            )}

            {sessions.length === 0 && !isCollapsed && (
              <div className="py-8 text-center text-subdued space-y-2">
                <Sparkles size={20} className="mx-auto text-subdued/50" />
                <p className="text-[13px]">No previous chats</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Profile & Status */}
        <div className="px-4 py-4 shrink-0 border-t border-transparent">
          <div className="flex items-center h-10 w-full overflow-hidden">
            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user?.fullName || 'User'}
                  className="w-8 h-8 rounded-full border border-sage/20 object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-sage/15 border border-sage/20 text-sage flex items-center justify-center font-semibold text-xs shrink-0">
                  {(user?.fullName || user?.firstName || 'P').charAt(0)}
                </div>
              )}
            </div>
            
            <div className={`ml-2 flex flex-col justify-center overflow-hidden transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
              <span className="text-[13px] font-medium text-primary truncate">
                {user?.firstName || user?.fullName || 'Authenticated User'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
"""

with open(sidebar_path, 'w') as f:
    f.write(sidebar_content)

print("Rebuilt Sidebar.jsx completely")
