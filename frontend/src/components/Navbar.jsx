// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from './ui/BrandLogo';
import { useAuth, useUser } from '@clerk/clerk-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const Navbar = () => {
  const [theme, setTheme] = useState(localStorage.getItem('blucare_theme') || 'dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('blucare_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useGSAP(() => {
    if (isMobileMenuOpen) {
      gsap.to('.mobile-shelf', { x: 0, duration: 0.5, ease: 'power3.out' });
    } else {
      gsap.to('.mobile-shelf', { x: '100%', duration: 0.5, ease: 'power3.in' });
    }
  }, [isMobileMenuOpen]);

  useGSAP(() => {
    const navTween = gsap.timeline({
      scrollTrigger: {
        trigger: 'nav',
        start: 'bottom top',
      },
    });

    navTween.fromTo(
      'nav',
      { backgroundColor: 'transparent', backdropFilter: 'blur(0px)' },
      {
        backgroundColor: 'var(--nav-bg)',
        backdropFilter: 'blur(10px)',
        duration: 0.6,
        ease: 'power2.inOut',
      }
    );
  });

  return (
    <>
      <nav className="fixed z-50 w-full transition-all duration-300 h-20 px-5 md:px-10 flex items-center justify-between">
        <div className="flex items-center justify-between w-full">
          {/* Logo brand link pointing to Landing Page / */}
          <BrandLogo showDot={true} textSize="text-3xl md:text-4xl" />

          <div className="flex items-center gap-4 lg:gap-8">
            <div className="nav-links flex items-center gap-6">
              <Link
                to={isSignedIn ? '/app/chat' : '/sign-in'}
                className="cursor-pointer text-nowrap text-[0.9rem] transition-colors text-subdued hover:text-lavender no-underline"
              >
                {isSignedIn ? 'AI Assistant Workspace' : 'Start AI Chat'}
              </Link>

              {isSignedIn ? (
                <Link
                  to="/app/hospitals"
                  className="cursor-pointer text-nowrap text-[0.9rem] transition-colors text-subdued hover:text-lavender no-underline"
                >
                  Ambulance Assistance
                </Link>
              ) : (
                <Link
                  to="/sign-in"
                  className="cursor-pointer text-nowrap text-[0.9rem] transition-colors text-sage hover:underline no-underline font-semibold"
                >
                  Sign In
                </Link>
              )}

              <button onClick={toggleTheme} className="theme-toggle" title="Toggle Theme">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {theme === 'light' ? (
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  ) : (
                    <>
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </>
                  )}
                </svg>
              </button>
            </div>

            <div className="user-profile hidden md:flex items-center gap-2">
              {isSignedIn ? (
                <Link to="/app/chat" className="flex items-center gap-2 no-underline">
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user?.fullName || 'User'}
                      className="w-8 h-8 rounded-full border border-sage/30 object-cover shadow-[0_0_10px_var(--glow-sage)]"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-sage/15 border border-sage/30 text-sage flex items-center justify-center font-semibold text-xs shadow-[0_0_10px_var(--glow-sage)]">
                      {(user?.fullName || user?.firstName || 'P').charAt(0)}
                    </div>
                  )}
                  <span className="text-[0.85rem] text-secondary">
                    Hi, {user?.firstName || user?.fullName || 'Patient'}
                  </span>
                </Link>
              ) : (
                <Link
                  to="/sign-in"
                  className="px-4 py-1.5 rounded-full bg-sage/15 border border-sage/30 text-sage text-xs font-semibold hover:bg-sage hover:text-bg-base transition-all no-underline shadow-[0_0_12px_var(--glow-sage)]"
                >
                  Sign In
                </Link>
              )}
            </div>

            <button onClick={toggleMobileMenu} className="mobile-menu-btn" aria-label="Toggle Menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isMobileMenuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Shelf */}
      <div
        className={`mobile-shelf fixed inset-y-0 right-0 w-64 bg-bg-surface/95 backdrop-blur-xl z-[60] transform translate-x-full border-l border-light md:hidden`}
      >
        <div className="flex flex-col h-full p-8 pt-24 space-y-8">
          <Link to={isSignedIn ? '/app/chat' : '/sign-in'} className="text-xl font-medium text-primary no-underline" onClick={toggleMobileMenu}>
            {isSignedIn ? 'AI Assistant Workspace' : 'Start AI Chat'}
          </Link>
          {isSignedIn ? (
            <Link to="/app/hospitals" className="text-xl font-medium text-primary no-underline" onClick={toggleMobileMenu}>
              Ambulance Assistance
            </Link>
          ) : (
            <Link to="/sign-in" className="text-xl font-semibold text-sage no-underline" onClick={toggleMobileMenu}>
              Sign In
            </Link>
          )}
          <div className="pt-8 border-t border-light mt-auto">
            {isSignedIn ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sage/15 border border-sage/30 text-sage flex items-center justify-center font-semibold text-xs">
                  {(user?.fullName || 'P').charAt(0)}
                </div>
                <div className="text-sm text-primary font-medium">{user?.fullName || 'Patient'}</div>
              </div>
            ) : (
              <Link to="/sign-in" className="text-sage font-semibold no-underline" onClick={toggleMobileMenu}>
                Sign In to BluCare+
              </Link>
            )}

            <button onClick={toggleTheme} className="flex items-center gap-3 mt-8 text-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {theme === 'light' ? <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /> : <circle cx="12" cy="12" r="5" />}
              </svg>
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-[55] md:hidden" onClick={toggleMobileMenu} />
      )}
    </>
  );
};

export default Navbar;
