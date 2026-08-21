import os
import re

# 1. Update BrandLogo.jsx
brand_logo_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/ui/BrandLogo.jsx'
with open(brand_logo_path, 'r') as f:
    brand = f.read()

# Add showDot prop and chatState prop
brand = brand.replace(
    'export const BrandLogo = ({ collapsed = false, className = "", noLink = false }) => {',
    'export const BrandLogo = ({ collapsed = false, className = "", noLink = false, showDot = false, chatState = "idle" }) => {'
)

dot_logic = """
      {showDot && (
        <div 
          className={`brand-dot shrink-0 transition-all duration-400 ease-in-out ${
            chatState === 'typing' ? 'bg-lavender shadow-[0_0_15px_var(--glow-lavender)]' : 
            chatState === 'generating' ? 'bg-status-normal shadow-[0_0_15px_var(--glow-normal)]' : 
            'bg-sage shadow-[0_0_15px_var(--glow-sage)]'
          }`}
          style={{ boxShadow: chatState === 'idle' ? 'none' : undefined }}
        />
      )}
"""
brand = brand.replace('<div className="brand-dot shrink-0" style={{ boxShadow: \'none\' }} />', dot_logic)
with open(brand_logo_path, 'w') as f:
    f.write(brand)

# 2. Update Navbar.jsx to pass showDot={true}
navbar_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/Navbar.jsx'
with open(navbar_path, 'r') as f:
    nav = f.read()
nav = nav.replace('<BrandLogo />', '<BrandLogo showDot={true} />')
with open(navbar_path, 'w') as f:
    f.write(nav)

# 3. Update Hero.jsx (Restore big title and fix animations)
hero_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/Hero.jsx'
with open(hero_path, 'r') as f:
    hero = f.read()
hero = hero.replace('import { BrandLogo } from "./ui/BrandLogo";\n', '')
hero_title_old = """					<div className="title leading-tight -translate-y-3 md:-translate-y-9 transform-gpu scale-150 md:scale-[2.5]">
						<BrandLogo noLink />
					</div>"""
hero_title_new = """					<h1 className="title font-bold text-gradient leading-tight -translate-y-3 md:-translate-y-9">
						BluCare+
					</h1>"""
hero = hero.replace(hero_title_old, hero_title_new)
with open(hero_path, 'w') as f:
    f.write(hero)

# 4. Update TopHeader.jsx (Remove New Chat button, fix Emergency SOS button styling)
topheader_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/navigation/TopHeader.jsx'
with open(topheader_path, 'r') as f:
    th = f.read()

# Remove New Chat Button
th_new_chat = """        {/* New Chat Quick Action */}
        <button
          onClick={handleNewChat}
          className="px-3 py-1.5 rounded-full bg-[#7FE1C3] text-black border-none hover:brightness-110 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(127,225,195,0.4)]"
          title="Start New Chat"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">New Chat</span>
        </button>"""
th = th.replace(th_new_chat, '')

# Fix Emergency SOS Button
sos_old = 'bg-[#F29B9B] text-black border-none hover:brightness-110 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(242,155,155,0.4)]'
sos_new = 'bg-transparent border border-rose-400/50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:shadow-[0_0_15px_rgba(242,155,155,0.3)] dark:hover:bg-rose-600 dark:hover:border-rose-600'
th = th.replace(sos_old, sos_new)

with open(topheader_path, 'w') as f:
    f.write(th)

print("Batch 1 completed!")
