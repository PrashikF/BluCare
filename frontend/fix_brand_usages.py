import os

# 1. Update Navbar.jsx
navbar_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/Navbar.jsx'
with open(navbar_path, 'r') as f:
    nav = f.read()

nav = nav.replace("import { Link } from 'react-router-dom';", "import { Link } from 'react-router-dom';\nimport { BrandLogo } from './ui/BrandLogo';")
# Remove old Link
old_nav_link = """          <Link
            to="/"
            className="flex items-center gap-3 no-underline text-primary font-medium text-[1.1rem] tracking-[-0.01em] shrink-0 group"
          >
            <div className="brand-dot shrink-0" />
            <span>BluCare+</span>
          </Link>"""
nav = nav.replace(old_nav_link, "          <BrandLogo />")

with open(navbar_path, 'w') as f:
    f.write(nav)

# 2. Update Sidebar.jsx
sidebar_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/navigation/Sidebar.jsx'
with open(sidebar_path, 'r') as f:
    sb = f.read()

sb = sb.replace("import { NavLink, useNavigate, useParams, useLocation } from 'react-router-dom';", "import { NavLink, useNavigate, useParams, useLocation } from 'react-router-dom';\nimport { BrandLogo } from '../ui/BrandLogo';")
old_sb_link = """          <NavLink
            to="/"
            className="flex items-center gap-2.5 no-underline shrink-0 group focus-visible:outline-2 focus-visible:outline-sage"
            title="BluCare+ Home (Public Landing)"
          >
            {/* Logo Badge Container (Fixed aspect-square, flex-shrink-0, subtle hover motion & glow) */}
            <div className="brand-dot shrink-0 ml-2" />

            {/* Smooth Animated Brand Text (Opacity, translateX, width transition over 250ms) */}
            <div
              className={`transition-all duration-250 ease-in-out flex items-center ${
                isCollapsed
                  ? 'opacity-0 -translate-x-2 w-0 overflow-hidden pointer-events-none'
                  : 'opacity-100 translate-x-0 w-auto'
              }`}
            >
              <span className="text-primary font-semibold text-base tracking-tight whitespace-nowrap">
                BluCare<span className="text-sage">+</span>
              </span>
            </div>
          </NavLink>"""
sb = sb.replace(old_sb_link, "          <BrandLogo collapsed={isCollapsed} className=\"ml-1\" />")
with open(sidebar_path, 'w') as f:
    f.write(sb)

# 3. Update SignInPage.jsx
signin_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/pages/SignInPage.jsx'
if os.path.exists(signin_path):
    with open(signin_path, 'r') as f:
        si = f.read()
    si = si.replace("import { SignIn } from '@clerk/clerk-react';", "import { SignIn } from '@clerk/clerk-react';\nimport { BrandLogo } from '../components/ui/BrandLogo';")
    old_si_brand = """          <div className="flex items-center gap-3 no-underline group outline-none">
            <div className="brand-dot" />
            <h1 className="text-primary font-semibold text-2xl tracking-tight">
              BluCare<span className="text-sage">+</span>
            </h1>
          </div>"""
    si = si.replace(old_si_brand, "          <BrandLogo noLink />")
    with open(signin_path, 'w') as f:
        f.write(si)

# 4. Update SignUpPage.jsx
signup_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/pages/SignUpPage.jsx'
if os.path.exists(signup_path):
    with open(signup_path, 'r') as f:
        su = f.read()
    su = su.replace("import { SignUp } from '@clerk/clerk-react';", "import { SignUp } from '@clerk/clerk-react';\nimport { BrandLogo } from '../components/ui/BrandLogo';")
    old_su_brand = """          <div className="flex items-center gap-3 no-underline group outline-none">
            <div className="brand-dot" />
            <h1 className="text-primary font-semibold text-2xl tracking-tight">
              BluCare<span className="text-sage">+</span>
            </h1>
          </div>"""
    su = su.replace(old_su_brand, "          <BrandLogo noLink />")
    with open(signup_path, 'w') as f:
        f.write(su)

print("Updated usages!")
