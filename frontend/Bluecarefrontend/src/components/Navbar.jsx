import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, User } from 'lucide-react';

export default function Navbar({
  theme,
  toggleTheme,
  user,
  statusDotClass = '',
  onStartNewSession,
  onStartTemporarySession,
  onShowHistoryToast
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const isChatOrVoice = location.pathname === '/chat' || location.pathname === '/voice';

  const handleProfileClick = () => {
    if (user?.isLoggedIn) {
      navigate('/chat');
    } else {
      navigate('/auth');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 px-6 sm:px-10 flex items-center justify-between z-[100] bg-[var(--nav-bg)] backdrop-blur-md transition-colors duration-300">
      <Link to="/" className="brand flex items-center gap-3 no-underline text-[var(--text-primary)] font-medium text-lg tracking-tight hover:opacity-90 transition-opacity">
        <div className={`brand-dot ${statusDotClass}`} id="statusDot" />
        <span>BluCare+</span>
      </Link>

      <div className="nav-right flex items-center gap-8">
        <div className="nav-links flex items-center gap-7">
          {isChatOrVoice ? (
            <>
              <a onClick={onStartNewSession} className="cursor-pointer text-sm text-[var(--text-subdued)] hover:text-[var(--accent-lavender)] transition-colors">
                New Session
              </a>
              <a onClick={onStartTemporarySession} className="cursor-pointer text-sm text-[var(--text-subdued)] hover:text-[var(--accent-lavender)] transition-colors">
                Temporary Session
              </a>
              <a onClick={onShowHistoryToast} className="cursor-pointer text-sm text-[var(--text-subdued)] hover:text-[var(--accent-lavender)] transition-colors">
                My Journal
              </a>
            </>
          ) : (
            <>
              <Link to="/chat" className={`text-sm no-underline ${location.pathname === '/chat' ? 'text-[var(--accent-lavender)] font-medium' : 'text-[var(--text-subdued)] hover:text-[var(--accent-lavender)]'}`}>
                Chat
              </Link>
              <Link to="/voice" className={`text-sm no-underline ${location.pathname === '/voice' ? 'text-[var(--accent-lavender)] font-medium' : 'text-[var(--text-subdued)] hover:text-[var(--accent-lavender)]'}`}>
                Voice
              </Link>
              <Link to="/about" className={`text-sm no-underline ${location.pathname === '/about' ? 'text-[var(--accent-lavender)] font-medium' : 'text-[var(--text-subdued)] hover:text-[var(--accent-lavender)]'}`}>
                About
              </Link>
            </>
          )}

          <button
            onClick={toggleTheme}
            className="theme-toggle"
            title="Toggle Theme"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* User Profile */}
        <div
          onClick={handleProfileClick}
          className="user-profile"
          title={user?.isLoggedIn ? `Logged in as ${user.name}` : 'Log in / Register'}
        >
          {user?.isLoggedIn ? (
            <>
              <div className="user-avatar">
                {user.avatar || (user.name ? user.name.charAt(0).toUpperCase() : 'P')}
              </div>
              <span className="user-name">
                Hi, {user.name || 'Prashik'}
              </span>
            </>
          ) : (
            <div className="user-avatar neutral">
              <User size={16} />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
