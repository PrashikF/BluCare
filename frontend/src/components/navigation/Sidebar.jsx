// src/components/navigation/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useParams, useLocation } from 'react-router-dom';
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
        <div key={sess.id} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-card/90 border border-sage/40">
          <input
            type="text"
            autoFocus
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRename(e, sess.id);
              if (e.key === 'Escape') handleCancelRename(e);
            }}
            className="flex-1 bg-transparent text-xs text-primary outline-none"
          />
          <button
            onClick={(e) => handleSaveRename(e, sess.id)}
            className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded cursor-pointer"
            title="Save"
          >
            <Check size={14} />
          </button>
          <button
            onClick={handleCancelRename}
            className="p-1 text-subdued hover:bg-bg-surface rounded cursor-pointer"
            title="Cancel"
          >
            <X size={14} />
          </button>
        </div>
      );
    }

    return (
      <NavLink
        key={sess.id}
        to={`/app/chat/${sess.id}`}
        onClick={() => setActiveSessionId(sess.id)}
        title={isCollapsed ? sess.title : undefined}
        className={`group flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all no-underline ${
          isActive
            ? 'bg-sage/15 text-sage border border-sage/30 font-semibold shadow-[0_0_12px_var(--glow-sage)]'
            : 'text-secondary hover:text-primary hover:bg-bg-card/50 border border-transparent'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <MessageSquare size={16} className={`shrink-0 ${isActive ? 'text-sage' : 'text-subdued group-hover:text-primary'}`} />
          {!isCollapsed && <span className="truncate">{sess.title}</span>}
        </div>

        {!isCollapsed && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={(e) => handleStartRename(e, sess)}
              className="p-1 rounded text-subdued hover:text-primary hover:bg-bg-surface transition-colors cursor-pointer"
              title="Rename"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={(e) => handleDelete(e, sess.id, sess.title)}
              className="p-1 rounded text-subdued hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </NavLink>
    );
  };

  return (
    <aside
      role="navigation"
      aria-label="Main Navigation"
      aria-expanded={!isCollapsed}
      className={`relative h-full shrink-0 z-40 bg-bg-surface/90 backdrop-blur-xl border-r border-light transition-[width] duration-250 ease-in-out flex flex-col justify-between ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Section */}
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-light shrink-0">
          {/* BluCare Brand Logo Link (Always routes client-side to Landing Page /) */}
          <NavLink
            to="/"
            className="flex items-center gap-2.5 no-underline shrink-0 group focus-visible:outline-2 focus-visible:outline-sage"
            title="BluCare+ Home (Public Landing)"
          >
            {/* Logo Badge Container (Fixed aspect-square, flex-shrink-0, subtle hover motion & glow) */}
            <div className="w-8 h-8 rounded-xl bg-sage/15 border border-sage/30 text-sage flex items-center justify-center font-bold text-xs aspect-square shrink-0 shadow-[0_0_10px_var(--glow-sage)] group-hover:shadow-[0_0_18px_var(--glow-sage)] group-hover:-translate-y-0.5 transition-all duration-200 ease-in-out cursor-pointer">
              <div className="brand-dot shrink-0" />
            </div>

            {/* Smooth Animated Brand Text (Opacity, translateX, width transition over 250ms) */}
            <div
              className={`transition-all duration-250 ease-in-out flex items-center ${
                isCollapsed
                  ? 'opacity-0 -translate-x-2 w-0 overflow-hidden pointer-events-none'
                  : 'opacity-100 translate-x-0 w-auto'
              }`}
            >
              <span className="text-primary font-semibold text-base tracking-tight whitespace-nowrap">
                BluCare<span className="text-sage">+</span>
              </span>
            </div>
          </NavLink>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-subdued hover:text-primary hover:bg-bg-card/50 transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-sage"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* New Chat Primary Button */}
        <div className="p-3 shrink-0">
          <button
            onClick={handleCreateNewChat}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-sage text-bg-base font-semibold text-xs transition-all shadow-[0_0_20px_var(--glow-sage)] hover:brightness-110 cursor-pointer active:scale-95 ${
              isCollapsed ? 'px-2' : 'px-4'
            }`}
            title="New Chat"
          >
            <Plus size={18} className="shrink-0" />
            <div
              className={`transition-all duration-250 ease-in-out ${
                isCollapsed
                  ? 'opacity-0 -translate-x-2 w-0 overflow-hidden pointer-events-none hidden'
                  : 'opacity-100 translate-x-0 w-auto'
              }`}
            >
              <span>New Chat</span>
            </div>
          </button>
        </div>

        {/* Chronological Chat History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 scrollbar-thin">
          {/* Today */}
          {grouped.today.length > 0 && (
            <div className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-semibold text-subdued uppercase tracking-widest mb-1.5 font-mono">
                  Today
                </p>
              )}
              {grouped.today.map(renderSessionItem)}
            </div>
          )}

          {/* Yesterday */}
          {grouped.yesterday.length > 0 && (
            <div className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-semibold text-subdued uppercase tracking-widest mb-1.5 font-mono">
                  Yesterday
                </p>
              )}
              {grouped.yesterday.map(renderSessionItem)}
            </div>
          )}

          {/* Previous 7 Days */}
          {grouped.last7Days.length > 0 && (
            <div className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-semibold text-subdued uppercase tracking-widest mb-1.5 font-mono">
                  Previous 7 Days
                </p>
              )}
              {grouped.last7Days.map(renderSessionItem)}
            </div>
          )}

          {/* Older */}
          {grouped.older.length > 0 && (
            <div className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-semibold text-subdued uppercase tracking-widest mb-1.5 font-mono">
                  Older
                </p>
              )}
              {grouped.older.map(renderSessionItem)}
            </div>
          )}

          {sessions.length === 0 && !isCollapsed && (
            <div className="py-8 text-center text-subdued space-y-2">
              <Sparkles size={20} className="mx-auto text-subdued/50" />
              <p className="text-xs">No previous chats</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Profile & Status */}
      {!isCollapsed && (
        <div className="p-3 border-t border-light shrink-0">
          <div className="p-3 rounded-2xl bg-bg-card/50 border border-light flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user?.fullName || 'User'}
                  className="w-7 h-7 rounded-full border border-sage/30 object-cover shrink-0 shadow-[0_0_10px_var(--glow-sage)]"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-sage/15 border border-sage/30 text-sage flex items-center justify-center font-semibold text-xs shrink-0 shadow-[0_0_10px_var(--glow-sage)]">
                  {(user?.fullName || user?.firstName || 'P').charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-primary text-xs leading-tight truncate">
                  {user?.fullName || user?.firstName || 'Authenticated User'}
                </p>
                <p className="text-[10px] text-subdued truncate">AI Assistant Active</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-sage font-mono shrink-0 ml-1">
              <ShieldCheck size={14} />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
