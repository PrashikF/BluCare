import os

topheader_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/navigation/TopHeader.jsx'
with open(topheader_path, 'r') as f:
    th = f.read()

# Replace the Dropdown code with Temporary Chat button
old_dropdown_start = "        {/* User Account Menu Dropdown */}"
new_dropdown_replacement = """        {/* Temporary Chat Control */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-light text-subdued hover:bg-bg-card/50 hover:text-primary transition-colors cursor-pointer text-xs font-medium focus-visible:outline-2 focus-visible:outline-sage"
          title="Temporary Chat (Not saved)"
        >
          <Sparkles size={14} />
          <span className="hidden sm:inline">Temporary Chat</span>
        </button>
      </div>"""

# Find the index of the start of the dropdown and the end of the header
start_idx = th.find(old_dropdown_start)
end_idx = th.find("    </header>")

if start_idx != -1 and end_idx != -1:
    th = th[:start_idx] + new_dropdown_replacement + "\n" + th[end_idx:]

with open(topheader_path, 'w') as f:
    f.write(th)

print("TopHeader updated")
