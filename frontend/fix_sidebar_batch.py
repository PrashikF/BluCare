import os
import re

sidebar_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/navigation/Sidebar.jsx'
with open(sidebar_path, 'r') as f:
    sb = f.read()

# 1. Update font size of New Chat (from text-sm to text-[13px])
sb = sb.replace('text-sm tracking-wide transition-all', 'text-[13px] tracking-wide transition-all')

# 2. Fix AI Assistant Active
sb = sb.replace('<p className="text-[10px] text-subdued truncate">AI Assistant Active</p>', '')

# 3. Refactor Sidebar to use clipping for flawless animation
# We will make the inner content fixed w-64, and let the outer aside clip it.

# Update outer aside:
old_aside = """    <aside
      role="navigation"
      aria-label="Main Navigation"
      aria-expanded={!isCollapsed}
      className={`relative h-full shrink-0 z-40 bg-transparent transition-[width] duration-250 ease-in-out flex flex-col justify-between ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Section */}
      <div className="flex flex-col h-full overflow-hidden">"""

new_aside = """    <aside
      role="navigation"
      aria-label="Main Navigation"
      aria-expanded={!isCollapsed}
      className={`relative h-full shrink-0 z-40 bg-transparent transition-[width] duration-300 ease-in-out flex flex-col overflow-hidden ${
        isCollapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Fixed Inner Container to prevent reflows */}
      <div className="w-64 h-full flex flex-col justify-between">
      {/* Top Section */}
      <div className="flex flex-col h-full overflow-hidden">"""
sb = sb.replace(old_aside, new_aside)
sb = sb.replace('</aside>', '</div>\n    </aside>')

# Update Header (Brand + Toggle)
old_header = """        <div className="h-16 flex items-center justify-between px-3.5 border-transparent shrink-0">
          {/* BluCare Brand Logo Link (Always routes client-side to Landing Page /) */}
          <BrandLogo collapsed={isCollapsed} className="ml-1" showDot={true} dotId="chatBrandDot" />

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-subdued hover:text-primary hover:bg-bg-card/50 transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-sage"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>"""

new_header = """        <div className="h-16 flex items-center px-5 border-transparent shrink-0 relative">
          <BrandLogo collapsed={false} className="ml-0" showDot={true} dotId="chatBrandDot" />

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute right-4 p-1.5 rounded-lg text-subdued hover:text-primary hover:bg-bg-card/50 transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-sage z-10 bg-bg-base"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>"""
sb = sb.replace(old_header, new_header)

# Update New Chat Button (Fixed Width)
old_new_chat = """        <div className="p-3 shrink-0 flex justify-center">
          <button
            onClick={handleCreateNewChat}
            className={`flex items-center justify-center gap-2 rounded-full bg-sage text-bg-base font-semibold text-[13px] tracking-wide transition-all shadow-[0_0_15px_var(--glow-sage)] hover:brightness-110 cursor-pointer active:scale-95 ${
              isCollapsed ? 'w-10 h-10 p-0' : 'w-full py-3 px-4'
            }`}
            title="New Chat"
          >
            <Plus size={18} className="shrink-0" />
            <div
              className={`transition-all duration-250 ease-in-out ${
                isCollapsed
                  ? 'opacity-0 w-0 overflow-hidden pointer-events-none hidden'
                  : 'opacity-100 w-auto'
              }`}
            >
              <span className="whitespace-nowrap">New Chat</span>
            </div>
          </button>
        </div>"""

new_new_chat = """        <div className="px-4 py-3 shrink-0">
          <button
            onClick={handleCreateNewChat}
            className="flex items-center gap-3 w-full py-3 px-3 rounded-full bg-sage text-bg-base font-semibold text-[13px] tracking-wide transition-all shadow-[0_0_15px_var(--glow-sage)] hover:brightness-110 cursor-pointer active:scale-95"
            title="New Chat"
          >
            <Plus size={18} className="shrink-0 ml-0.5" />
            <span className="whitespace-nowrap truncate">New Chat</span>
          </button>
        </div>"""
sb = sb.replace(old_new_chat, new_new_chat)

# Update Chat History List Items (Fixed padding)
old_navlink = """      <NavLink
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
        </div>"""

new_navlink = """      <NavLink
        key={sess.id}
        to={`/app/chat/${sess.id}`}
        onClick={() => setActiveSessionId(sess.id)}
        title={isCollapsed ? sess.title : undefined}
        className={`group flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-[13px] font-medium transition-all no-underline ${
          isActive
            ? 'bg-sage/15 text-sage border border-sage/30 font-semibold shadow-[0_0_12px_var(--glow-sage)]'
            : 'text-secondary hover:text-primary hover:bg-bg-card/50 border border-transparent'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <MessageSquare size={18} className={`shrink-0 ${isActive ? 'text-sage' : 'text-subdued group-hover:text-primary'}`} />
          <span className="truncate">{sess.title}</span>
        </div>"""
sb = sb.replace(old_navlink, new_navlink)

# Update footer
old_footer = """      {/* Footer Profile & Status */}
      {!isCollapsed && (
        <div className="p-3 border-transparent shrink-0">
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
              <div className="flex flex-col ml-3 overflow-hidden">
                <span className="text-sm font-medium text-primary truncate">
                  {user?.firstName || user?.fullName || 'Patient'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-sage font-mono shrink-0 ml-1">
              <ShieldCheck size={14} />
            </div>
          </div>
        </div>
      )}"""
new_footer = """      {/* Footer Profile & Status */}
        <div className="p-3 border-transparent shrink-0">
          <div className="p-3 rounded-2xl bg-bg-card/50 border border-light flex items-center justify-between text-xs w-full">
            <div className="flex items-center gap-3 min-w-0">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user?.fullName || 'User'}
                  className="w-8 h-8 rounded-full border border-sage/30 object-cover shrink-0 shadow-[0_0_10px_var(--glow-sage)]"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-sage/15 border border-sage/30 text-sage flex items-center justify-center font-semibold text-xs shrink-0 shadow-[0_0_10px_var(--glow-sage)]">
                  {(user?.fullName || user?.firstName || 'P').charAt(0)}
                </div>
              )}
              <div className="flex flex-col overflow-hidden">
                <span className="text-[13px] font-medium text-primary truncate">
                  {user?.firstName || user?.fullName || 'Patient'}
                </span>
              </div>
            </div>
          </div>
        </div>"""
sb = sb.replace(old_footer, new_footer)

with open(sidebar_path, 'w') as f:
    f.write(sb)

print("Sidebar refactored!")
