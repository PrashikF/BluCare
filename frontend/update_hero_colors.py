import os

hero_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/Hero.jsx'
with open(hero_path, 'r') as f:
    hero = f.read()

old_html = """								<p className="subtitle font-medium text-xl md:text-2xl">
									Advanced Diagnostics <br className="hidden md:block" /> Gentle Human Care
								</p>"""

new_html = """								<div className="subtitle font-medium text-xl md:text-2xl">
									<div className="text-sage">Advanced Diagnostics</div>
									<div className="text-aqua/90">Gentle Human Care</div>
								</div>"""

hero = hero.replace(old_html, new_html)

with open(hero_path, 'w') as f:
    f.write(hero)

print("Updated Hero text colors")
