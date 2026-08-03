// src/components/navigation/Sidebar.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Stethoscope,
  BookOpen,
  FileText,
  Pill,
  Hospital,
  BookMarked,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  HelpCircle,
} from 'lucide-react';
import { RAG_MODULES } from '../../config/ragModules';

const iconMap = {
  Stethoscope,
  BookOpen,
  FileText,
  Pill,
};

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();

  const mainNav = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
  ];

  const networkNav = [
    { name: 'Hospital Finder', path: '/app/hospitals', icon: Hospital },
    { name: 'Medical Journal', path: '/app/journal', icon: BookMarked },
    { name: 'Health Analytics', path: '/app/analytics', icon: TrendingUp },
  ];

  const systemNav = [
    { name: 'Patient Profile', path: '/app/profile', icon: User },
    { name: 'Settings & Preferences', path: '/app/settings', icon: Settings },
    { name: 'Help & Support', path: '/app/help', icon: HelpCircle },
  ];

  return (
    <aside
      role="navigation"
      aria-label="Main Navigation"
      aria-expanded={!isCollapsed}
      className={`relative h-full shrink-0 z-40 bg-bg-surface/90 backdrop-blur-xl border-r border-light transition-[width] duration-300 flex flex-col justify-between ${isCollapsed ? 'w-20' : 'w-64'
        }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-20 flex items-center justify-between px-5 border-b border-light">
          <NavLink to="/" className="flex items-center gap-3 no-underline" title="BluCare+ Home">
            <div className="brand-dot shrink-0" />
            {!isCollapsed && (
              <span className="text-primary font-semibold text-lg tracking-tight">
                BluCare<span className="text-sage">+</span>
              </span>
            )}
          </NavLink>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-subdued hover:text-primary hover:bg-bg-card/50 transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-sage"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="py-6 px-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {/* Main */}
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-semibold text-subdued uppercase tracking-widest mb-2">
                Overview
              </p>
            )}
            {mainNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.name : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 no-underline focus-visible:outline-2 focus-visible:outline-sage ${isActive
                      ? 'bg-sage/15 text-sage border border-sage/30 shadow-[0_0_15px_var(--glow-sage)]'
                      : 'text-secondary hover:text-primary hover:bg-bg-card/40'
                    }`
                  }
                >
                  <Icon size={20} className="shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </NavLink>
              );
            })}
          </div>

          {/* Clinical Care Services */}
          <div>
            {!isCollapsed && (
              <div className="flex items-center justify-between px-3 mb-2">
                <p className="text-[10px] font-semibold text-subdued uppercase tracking-widest">
                  Clinical Services
                </p>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-sage/10 text-sage border border-sage/20 font-mono">
                  {RAG_MODULES.length} Active
                </span>
              </div>
            )}
            {RAG_MODULES.map((module) => {
              const IconComponent = iconMap[module.icon] || Stethoscope;
              const modulePath = `/app/chat/${module.id}`;
              const isActive = location.pathname === modulePath;

              return (
                <NavLink
                  key={module.id}
                  to={modulePath}
                  title={isCollapsed ? module.name : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 no-underline mb-1 focus-visible:outline-2 focus-visible:outline-sage ${isActive
                      ? 'bg-lavender/15 text-lavender border border-lavender/30 shadow-[0_0_15px_var(--glow-lavender)]'
                      : 'text-secondary hover:text-primary hover:bg-bg-card/40'
                    }`}
                >
                  <IconComponent size={20} className="shrink-0" />
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 flex items-center justify-between">
                      <span className="truncate">{module.name}</span>
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Care & Analytics */}
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-semibold text-subdued uppercase tracking-widest mb-2">
                Care & Analytics
              </p>
            )}
            {networkNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.name : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 no-underline focus-visible:outline-2 focus-visible:outline-sage ${isActive
                      ? 'bg-sage/15 text-sage border border-sage/30'
                      : 'text-secondary hover:text-primary hover:bg-bg-card/40'
                    }`
                  }
                >
                  <Icon size={20} className="shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </NavLink>
              );
            })}
          </div>

          {/* System & Account */}
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-semibold text-subdued uppercase tracking-widest mb-2">
                Account & Support
              </p>
            )}
            {systemNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.name : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 no-underline focus-visible:outline-2 focus-visible:outline-sage ${isActive
                      ? 'bg-sage/15 text-sage border border-sage/30'
                      : 'text-secondary hover:text-primary hover:bg-bg-card/40'
                    }`
                  }
                >
                  <Icon size={20} className="shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* System Status Footer */}
      {!isCollapsed && (
        <div className="p-4 m-3 rounded-2xl bg-bg-card/50 border border-light text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-sage" />
            <span className="text-secondary font-medium">HIPAA Certified</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
