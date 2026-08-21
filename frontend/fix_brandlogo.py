import os

brandlogo_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/ui/BrandLogo.jsx'
with open(brandlogo_path, 'r') as f:
    brand = f.read()

brand = brand.replace(
    'export const BrandLogo = ({ collapsed = false, className = "", noLink = false, showDot = false, chatState = "idle", dotId }) => {',
    'export const BrandLogo = ({ collapsed = false, className = "", noLink = false, showDot = false, chatState = "idle", dotId, textSize = "text-xl md:text-2xl" }) => {'
)

brand = brand.replace(
    'className={`font-sans font-medium tracking-tight text-primary transition-opacity duration-400 ease-in-out ${',
    'className={`font-sans font-medium tracking-tight text-primary transition-opacity duration-400 ease-in-out ${textSize} ${'
)

with open(brandlogo_path, 'w') as f:
    f.write(brand)

navbar_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/Navbar.jsx'
with open(navbar_path, 'r') as f:
    nav = f.read()

nav = nav.replace('<BrandLogo showDot={true} />', '<BrandLogo showDot={true} textSize="text-3xl md:text-4xl" />')

with open(navbar_path, 'w') as f:
    f.write(nav)

print("BrandLogo and Navbar updated")
