import os

hero_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/Hero.jsx'
with open(hero_path, 'r') as f:
    hero = f.read()

# Remove the line that adds text-gradient to subtitle lines
target = 'paragraphSplit.lines.forEach((line) => line.classList.add("text-gradient"));'
hero = hero.replace(target, '// Removed text-gradient class addition that was causing invisibility')

with open(hero_path, 'w') as f:
    f.write(hero)

print("Hero subtitle gradient fixed")
