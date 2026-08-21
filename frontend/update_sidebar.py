import os

# Update Sidebar.jsx to include showDot={true} and an id for the dot
sidebar_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/navigation/Sidebar.jsx'
with open(sidebar_path, 'r') as f:
    sb = f.read()
sb = sb.replace('<BrandLogo collapsed={isCollapsed} className="ml-1" />', '<BrandLogo collapsed={isCollapsed} className="ml-1" showDot={true} dotId="chatBrandDot" />')
with open(sidebar_path, 'w') as f:
    f.write(sb)

# Update BrandLogo.jsx to accept dotId
brand_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/ui/BrandLogo.jsx'
with open(brand_path, 'r') as f:
    brand = f.read()

brand = brand.replace(
    'export const BrandLogo = ({ collapsed = false, className = "", noLink = false, showDot = false, chatState = "idle" }) => {',
    'export const BrandLogo = ({ collapsed = false, className = "", noLink = false, showDot = false, chatState = "idle", dotId }) => {'
)
brand = brand.replace('className={`brand-dot', 'id={dotId} className={`brand-dot')
with open(brand_path, 'w') as f:
    f.write(brand)

print("Updated Sidebar and BrandLogo!")
