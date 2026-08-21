import os

brandlogo_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/ui/BrandLogo.jsx'
with open(brandlogo_path, 'r') as f:
    content = f.read()

# Replace: BluCare<span className="text-sage">+</span>
# With: BluCare+
content = content.replace('BluCare<span className="text-sage">+</span>', 'BluCare+')

with open(brandlogo_path, 'w') as f:
    f.write(content)

print("BrandLogo plus icon fixed")
