import os

filepath = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/Features.jsx'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace("parallaxTimeline.from(leftLeaf, { x: -100, y: 100, opacity: 0 }, 0);", "parallaxTimeline.fromTo(leftLeaf, { x: -100, y: 100, opacity: 0 }, { x: 0, y: 0, opacity: 0.2, ease: 'none' }, 0);")
content = content.replace("parallaxTimeline.from(rightLeaf, { x: 100, y: 100, opacity: 0 }, 0);", "parallaxTimeline.fromTo(rightLeaf, { x: 100, y: 100, opacity: 0 }, { x: 0, y: 0, opacity: 0.2, ease: 'none' }, 0);")

with open(filepath, 'w') as f:
    f.write(content)

print("Features.jsx gsap fixed")
