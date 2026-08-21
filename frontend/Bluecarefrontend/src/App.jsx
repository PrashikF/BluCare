import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Landing from './components/Landing.jsx';
import Chat from './components/Chat.jsx';
import Voice from './components/Voice.jsx';
import Auth from './components/Auth.jsx';
import About from './components/About.jsx';

function AppContent() {
  const location = useLocation();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('blucare_theme') || 'dark';
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('blucare_user');
    if (savedUser) {
      try { return JSON.parse(savedUser); } catch (e) {}
    }
    const isLoggedIn = localStorage.getItem('blucare_logged_in') === 'true';
    if (isLoggedIn) {
      return { isLoggedIn: true, name: 'Prashik', avatar: 'P' };
    }
    return { isLoggedIn: false, name: '', avatar: '' };
  });

  const [statusDotClass, setStatusDotClass] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('blucare_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const triggerHistoryToast = () => {
    const saved = localStorage.getItem('blucare_chat_history');
    let count = 0;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        count = (parsed.sessions || []).filter(s => !s.isTemporary).length;
      } catch (e) {}
    }
    setToastMessage(`Journal active. You have ${count} saved session${count === 1 ? '' : 's'}.`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleStartNewSession = () => {
    const saved = localStorage.getItem('blucare_chat_history');
    let appState = { sessions: [] };
    if (saved) {
      try { appState = JSON.parse(saved); } catch (e) {}
    }
    appState.sessions = (appState.sessions || []).filter(s => !s.isTemporary);
    const newSession = {
      id: 'sess_' + Date.now(),
      timestamp: Date.now(),
      isTemporary: false,
      messages: [{
        role: 'ai',
        content: "Hello, I'm Yukti. I'm here to listen and help you navigate how you're feeling today. Take your time—whenever you're ready, you can type, upload a file, or speak to me."
      }]
    };
    appState.sessions.push(newSession);
    appState.currentSessionId = newSession.id;
    localStorage.setItem('blucare_chat_history', JSON.stringify(appState));
    window.location.reload();
  };

  const handleStartTemporarySession = () => {
    const saved = localStorage.getItem('blucare_chat_history');
    let appState = { sessions: [] };
    if (saved) {
      try { appState = JSON.parse(saved); } catch (e) {}
    }
    appState.sessions = (appState.sessions || []).filter(s => !s.isTemporary);
    const tempSession = {
      id: 'temp_' + Date.now(),
      timestamp: Date.now(),
      isTemporary: true,
      messages: [{
        role: 'ai',
        content: "This is a Temporary Session. Messages here are not saved and will be deleted when you leave or refresh."
      }]
    };
    appState.sessions.push(tempSession);
    appState.currentSessionId = tempSession.id;
    // Don't write temporary session to localStorage
    window.location.reload();
  };

  const isVoicePage = location.pathname === '/voice';

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] relative font-sans">
      {!isVoicePage && (
        <Navbar
          theme={theme}
          toggleTheme={toggleTheme}
          user={user}
          statusDotClass={statusDotClass}
          onStartNewSession={handleStartNewSession}
          onStartTemporarySession={handleStartTemporarySession}
          onShowHistoryToast={triggerHistoryToast}
        />
      )}

      <div className={`history-toast ${showToast ? 'show' : ''}`}>
        {toastMessage}
      </div>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/chat" element={<Chat setStatusDotClass={setStatusDotClass} user={user} />} />
        <Route path="/voice" element={<Voice user={user} />} />
        <Route path="/auth" element={<Auth setUser={setUser} />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
