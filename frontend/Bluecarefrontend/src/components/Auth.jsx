import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function Auth({ setUser }) {
  const navigate = useNavigate();

  const [formType, setFormType] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const switchForm = (target) => {
    setFormType(target);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const nameToUse = username || (email ? email.split('@')[0] : 'Prashik');
    const newUser = {
      isLoggedIn: true,
      name: nameToUse.charAt(0).toUpperCase() + nameToUse.slice(1),
      avatar: nameToUse.charAt(0).toUpperCase()
    };

    localStorage.setItem('blucare_logged_in', 'true');
    localStorage.setItem('blucare_user', JSON.stringify(newUser));
    setUser(newUser);

    navigate('/chat');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between items-center relative z-10 select-none">
      <div className="ambient-background" />

      {/* Auth Back Nav */}
      <div className="w-full max-w-5xl px-6 py-6 flex justify-between items-center z-50">
        <Link to="/" className="brand">
          <div className="brand-dot" />
          <span>BluCare+</span>
        </Link>
        <Link to="/" className="text-sm text-[var(--text-subdued)] hover:text-[var(--accent-lavender)] flex items-center gap-2 no-underline transition-colors">
          <ArrowLeft size={16} />
          <span>Back</span>
        </Link>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-5 py-10 z-10 w-full">
        <div className="auth-card">

          {/* Login Form */}
          {formType === 'login' ? (
            <div className="auth-form active">
              <div className="auth-header">
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Take your time. You're in a safe space.</p>
              </div>

              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                <div className="input-group">
                  <label htmlFor="loginEmail">Email or Username</label>
                  <input
                    type="text"
                    id="loginEmail"
                    className="auth-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="loginPassword">Password</label>
                  <div className="input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="loginPassword"
                      className="auth-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <a href="#forgot" onClick={(e) => e.preventDefault()} className="forgot-link">
                  Forgot password?
                </a>

                <button type="submit" className="auth-btn">
                  Log in
                </button>

                <div className="auth-switch">
                  New to BluCare+?{' '}
                  <span onClick={() => switchForm('register')}>Create an account</span>
                </div>
              </form>
            </div>
          ) : (
            /* Register Form */
            <div className="auth-form active">
              <div className="auth-header">
                <h1 className="auth-title">Begin gently</h1>
                <p className="auth-subtitle">Create a private space for your health journey.</p>
              </div>

              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                <div className="input-group">
                  <label htmlFor="regUsername">Preferred Name</label>
                  <input
                    type="text"
                    id="regUsername"
                    className="auth-input"
                    placeholder="How should we call you?"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="regEmail">Email Address</label>
                  <input
                    type="email"
                    id="regEmail"
                    className="auth-input"
                    placeholder="For account recovery only"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="regPassword">Password</label>
                  <div className="input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="regPassword"
                      className="auth-input"
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-btn">
                  Create account
                </button>

                <div className="auth-switch">
                  Already have an account?{' '}
                  <span onClick={() => switchForm('login')}>Log in</span>
                </div>
              </form>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
