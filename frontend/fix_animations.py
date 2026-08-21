import os
import re

def fix_file(path):
    if not os.path.exists(path): return
    with open(path, 'r') as f: content = f.read()
    # Replace yPercent with y: 30 / y: 0
    content = content.replace('yPercent: 100', 'y: 30')
    content = content.replace('yPercent: 50', 'y: 20')
    content = content.replace('yPercent: 0', 'y: 0')
    with open(path, 'w') as f: f.write(content)

fix_file('/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/Architecture.jsx')
fix_file('/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/About.jsx')
fix_file('/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/Features.jsx')
fix_file('/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/Contact.jsx')
print("Animations fixed!")
