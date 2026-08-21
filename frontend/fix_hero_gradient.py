import os

hero_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/Hero.jsx'
with open(hero_path, 'r') as f:
    hero = f.read()

target = 'heroSplit.chars.forEach((char) => char.classList.add("text-gradient"));'
hero = hero.replace(target, '// Removed per-char text-gradient to allow parent gradient to flow across word')

with open(hero_path, 'w') as f:
    f.write(hero)

print("Fixed hero split text gradient")
