import os

# 1. Update index.css to remove focus-visible
index_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/index.css'
with open(index_path, 'r') as f:
    css = f.read()

css = css.replace("""*:focus-visible {
    outline: 2px solid var(--accent-sage) !important;
    outline-offset: 2px !important;
}""", "")

with open(index_path, 'w') as f:
    f.write(css)

# 2. Update MultiRagChatPage.jsx (Dynamic Name)
chat_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/pages/MultiRagChatPage.jsx'
with open(chat_path, 'r') as f:
    chat = f.read()

chat = chat.replace("const { getToken } = useAuth();", "const { getToken } = useAuth();\n  const { user } = useUser();")
chat = chat.replace("import { useAuth } from '@clerk/clerk-react';", "import { useAuth, useUser } from '@clerk/clerk-react';")

chat = chat.replace("const displayName = 'Prashik';", "")
chat = chat.replace("{msg.role === 'user' ? 'Prashik' : 'Yukti'}", "{msg.role === 'user' ? (user?.firstName || user?.fullName || 'Patient') : 'Yukti'}")

with open(chat_path, 'w') as f:
    f.write(chat)

# 3. Rewrite Sidebar.jsx
sidebar_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/navigation/Sidebar.jsx'
with open(sidebar_path, 'r') as f:
    sb = f.read()

# Remove brand-dot border wrapper
sb = sb.replace("""<div className="w-8 h-8 rounded-xl bg-sage/15 border border-sage/30 text-sage flex items-center justify-center font-bold text-xs aspect-square shrink-0 shadow-[0_0_10px_var(--glow-sage)] group-hover:shadow-[0_0_18px_var(--glow-sage)] group-hover:-translate-y-0.5 transition-all duration-200 ease-in-out cursor-pointer">
              <div className="brand-dot shrink-0" />
            </div>""", '<div className="brand-dot shrink-0 ml-2" />')

# Unify background and remove border
sb = sb.replace("bg-bg-surface/90 backdrop-blur-xl border-r border-light", "bg-transparent")
sb = sb.replace("border-b border-light", "border-transparent")
sb = sb.replace("border-t border-light", "border-transparent")

# Redesign New Chat Button
sb = sb.replace("rounded-2xl bg-sage text-bg-base font-semibold text-xs", "rounded-full bg-[#7FE1C3] text-black font-semibold text-sm tracking-wide")
sb = sb.replace("shadow-[0_0_20px_var(--glow-sage)]", "shadow-[0_0_15px_rgba(127,225,195,0.4)]")

with open(sidebar_path, 'w') as f:
    f.write(sb)

# 4. Redesign TopHeader.jsx Emergency SOS Button
header_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/navigation/TopHeader.jsx'
with open(header_path, 'r') as f:
    th = f.read()

th = th.replace("bg-nav-bg/90 backdrop-blur-xl border-b border-light", "bg-transparent")
th = th.replace("rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400", "rounded-full bg-[#F29B9B] text-black border-none")
th = th.replace("shadow-[0_0_10px_rgba(244,63,94,0.2)]", "shadow-[0_0_15px_rgba(242,155,155,0.4)]")

# Ensure Emergency SOS button doesn't have white text on hover (match new chat style)
th = th.replace("hover:bg-rose-500 hover:text-white", "hover:brightness-110")

with open(header_path, 'w') as f:
    f.write(th)

print("Done.")
