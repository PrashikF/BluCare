import os
import re

files_to_check = [
    '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/About.jsx',
    '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/Architecture.jsx',
    '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/Features.jsx',
    '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/Contact.jsx',
    '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/Hero.jsx',
]

for filepath in files_to_check:
    if not os.path.exists(filepath): continue
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Inject toggleActions to all ScrollTriggers that don't have scrub: true
    # We want standard animations to replay
    
    # We'll replace start: 'something', with start: 'something',\n\t\t\t\t\ttoggleActions: 'play none none reverse',
    
    def add_toggle_actions(match):
        trigger_block = match.group(0)
        if 'scrub: true' in trigger_block or 'toggleActions' in trigger_block:
            return trigger_block
        if 'start:' in trigger_block:
            return trigger_block.replace('start:', 'toggleActions: "play none none reverse",\n\t\t\t\t\tstart:')
        return trigger_block

    content = re.sub(r'scrollTrigger:\s*\{[^}]+\}', add_toggle_actions, content)

    # Change any `.from(` to `.fromTo(` if it's animating text, but from() is usually fine if we just want it to animate from a state.
    # Actually, from() can sometimes get stuck if the element already has a transform applied via css.
    # Let's ensure yPercent is completely gone.
    content = content.replace('yPercent: 100', 'y: 30')
    content = content.replace('yPercent: 50', 'y: 20')
    
    with open(filepath, 'w') as f:
        f.write(content)

print("Injected toggleActions into all ScrollTriggers")
