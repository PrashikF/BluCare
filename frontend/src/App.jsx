// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import gsap from 'gsap';
import { ScrollTrigger, SplitText } from 'gsap/all';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';

// Components & Guard
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import MultiRagChatPage from './pages/MultiRagChatPage';
import HospitalsPage from './pages/HospitalsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';

import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';

gsap.registerPlugin(ScrollTrigger, SplitText);

// Retrieve Publishable Key from environment
const PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  'pk_test_Y2xlcmsuYWNjZXB0ZWQuY2F0ZmlzaC04NC5jbGVyay5hY2NvdW50cy5kZXYk';

const App = () => {
  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing Portal */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<LandingPage />} />
            </Route>

            {/* Authentication Pages */}
            <Route path="/sign-in/*" element={<SignInPage />} />
            <Route path="/sign-up/*" element={<SignUpPage />} />

            {/* Protected Workspace Shell */}
            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Navigate to="/app/chat" replace />} />
                <Route path="chat" element={<MultiRagChatPage />} />
                <Route path="chat/:sessionId" element={<MultiRagChatPage />} />
                <Route path="hospitals" element={<HospitalsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="help" element={<HelpPage />} />
              </Route>

              {/* Direct Route Aliases */}
              <Route path="/chat" element={<Navigate to="/app/chat" replace />} />
              <Route path="/chat/:sessionId" element={<Navigate to="/app/chat" replace />} />
            </Route>

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ClerkProvider>
  </ErrorBoundary>
  );
};

export default App;
