import os
import re

def fix_file(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Remove the document.fonts.ready wrapper
    # Replace:
    # if (document.fonts && document.fonts.ready) {
    #     document.fonts.ready.then(() => {
    #         initAnimations();
    #     });
    # } else {
    #     initAnimations();
    # }
    # With just:
    # initAnimations();
    pattern_fonts = r"if\s*\(document\.fonts\s*&&\s*document\.fonts\.ready\)\s*\{\s*document\.fonts\.ready\.then\(\(\)\s*=>\s*\{\s*initAnimations\(\);\s*\}\);\s*\}\s*else\s*\{\s*initAnimations\(\);\s*\}"
    content = re.sub(pattern_fonts, "initAnimations();", content)

    with open(filepath, 'w') as f:
        f.write(content)


files_to_fix = [
    '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/About.jsx',
    '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/Contact.jsx',
    '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/Hero.jsx'
]

for fp in files_to_fix:
    fix_file(fp)

print("Removed async font loading wrappers from GSAP hooks")
