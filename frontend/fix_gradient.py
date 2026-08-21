import os

index_css_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/index.css'
with open(index_css_path, 'r') as f:
    css = f.read()

# Replace the text-gradient definition
old_grad = "    background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent-sage) 50%, var(--accent-lavender) 100%);"
new_grad = "    background: linear-gradient(90deg, #6EE7B7 0%, #93C5FD 100%);"

if old_grad in css:
    css = css.replace(old_grad, new_grad)
else:
    # If it's formatted differently
    import re
    css = re.sub(r'background:\s*linear-gradient\([^;]+\);', new_grad, css, count=1)

with open(index_css_path, 'w') as f:
    f.write(css)

print("Updated text-gradient to be vibrant")
