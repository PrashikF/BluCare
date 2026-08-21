// src/layouts/AppLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import TopHeader from '../components/navigation/TopHeader';

const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-bg-base text-primary font-sans overflow-hidden relative">
      {/* Background Ambient Glows & Noise Texture */}
      <div className="noisy fixed inset-0 pointer-events-none z-0 opacity-15" />
      <div className="fixed top-1/4 left-1/3 w-96 h-96 rounded-full bg-sage/5 blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-lavender/5 blur-3xl pointer-events-none z-0" />

      {/* Sidebar Navigation Shell */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative z-10">
        {/* Top Navigation Header */}
        <TopHeader isCollapsed={isCollapsed} />

        {/* Scrollable Main Workspace Content Canvas */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-10 pt-6 pb-12">
          <div className="w-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
