import os
import re

# 1. Update index.css for Dark Mode Theme-Aware colors
index_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/index.css'
with open(index_path, 'r') as f:
    idx = f.read()

# Replace Dark Mode variables
idx = idx.replace('--accent-sage: #7FE1C3;', '--accent-sage: #45b393;')
idx = idx.replace('--accent-lavender: #B6C4FF;', '--accent-lavender: #90a5f5;')
idx = idx.replace('--accent-aqua: #A3E8ED;', '--accent-aqua: #70cbd2;')
idx = idx.replace('--status-risk: #F29B9B;', '--status-risk: #e07474;')
idx = idx.replace('--glow-sage: rgba(127, 225, 195, 0.4);', '--glow-sage: rgba(69, 179, 147, 0.25);')
idx = idx.replace('--glow-lavender: rgba(182, 196, 255, 0.4);', '--glow-lavender: rgba(144, 165, 245, 0.25);')

with open(index_path, 'w') as f:
    f.write(idx)

# 2. Update Sidebar.jsx (User Info & Collapsed New Chat Button)
sidebar_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/navigation/Sidebar.jsx'
with open(sidebar_path, 'r') as f:
    sb = f.read()

# Update User Info
old_user_info = """          <div className="flex flex-col ml-3 overflow-hidden">
            <span className="text-sm font-medium text-primary truncate">
              {user?.fullName || 'Patient'}
            </span>
            <span className="text-[10px] text-sage font-semibold uppercase tracking-wider">
              AI Assistant Active
            </span>
          </div>"""
new_user_info = """          <div className="flex flex-col ml-3 overflow-hidden">
            <span className="text-sm font-medium text-primary truncate">
              {user?.firstName || user?.fullName || 'Patient'}
            </span>
          </div>"""
sb = sb.replace(old_user_info, new_user_info)

# Update New Chat Button alignment and sizing for collapsed state
old_new_chat_btn = """        <div className="p-3 shrink-0">
          <button
            onClick={handleCreateNewChat}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#7FE1C3] text-black font-semibold text-sm tracking-wide transition-all shadow-[0_0_15px_rgba(127,225,195,0.4)] hover:brightness-110 cursor-pointer active:scale-95 ${
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
        </div>"""

new_new_chat_btn = """        <div className="p-3 shrink-0 flex justify-center">
          <button
            onClick={handleCreateNewChat}
            className={`flex items-center justify-center gap-2 rounded-full bg-sage text-bg-base font-semibold text-sm tracking-wide transition-all shadow-[0_0_15px_var(--glow-sage)] hover:brightness-110 cursor-pointer active:scale-95 ${
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
sb = sb.replace(old_new_chat_btn, new_new_chat_btn)

with open(sidebar_path, 'w') as f:
    f.write(sb)

print("Batch 2 completed!")
