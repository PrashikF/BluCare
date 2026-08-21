import os

brand_component = """import React from 'react';
import { Link } from 'react-router-dom';

export const BrandLogo = ({ collapsed = false, className = "", noLink = false }) => {
  const content = (
    <div className={`flex items-center gap-2.5 shrink-0 ${className}`}>
      <div className="brand-dot shrink-0" style={{ boxShadow: 'none' }} />
      <span
        className={`text-primary font-semibold text-base tracking-tight whitespace-nowrap transition-all duration-250 ease-in-out ${
          collapsed ? 'opacity-0 w-0 overflow-hidden pointer-events-none' : 'opacity-100 w-auto'
        }`}
      >
        BluCare<span className="text-sage">+</span>
      </span>
    </div>
  );

  if (noLink) return content;

  return (
    <Link to="/" className="no-underline group focus-visible:outline-2 focus-visible:outline-sage">
      {content}
    </Link>
  );
};
"""

os.makedirs('/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/ui', exist_ok=True)
with open('/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/ui/BrandLogo.jsx', 'w') as f:
    f.write(brand_component)

print("Created BrandLogo.jsx")
