// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger, SplitText } from 'gsap/all';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';

// Pages
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import MultiRagChatPage from './pages/MultiRagChatPage';
import HospitalsPage from './pages/HospitalsPage';
import JournalPage from './pages/JournalPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import HelpPage from './pages/HelpPage';
import { ToastProvider } from './contexts/ToastContext';

gsap.registerPlugin(ScrollTrigger, SplitText);

const App = () => {
  return (
    <ToastProvider>
      <BrowserRouter>
      <Routes>
        {/* Public Landing Portal */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
        </Route>

        {/* Protected App Workspace Shell */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="chat" element={<MultiRagChatPage />} />
          <Route path="chat/:engineId" element={<MultiRagChatPage />} />
          <Route path="hospitals" element={<HospitalsPage />} />
          <Route path="journal" element={<JournalPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="help" element={<HelpPage />} />
        </Route>

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;
