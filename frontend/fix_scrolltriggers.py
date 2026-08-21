import os

files_to_check = [
    '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/About.jsx',
    '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/Architecture.jsx',
    '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/Features.jsx',
    '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/Contact.jsx'
]

for filepath in files_to_check:
    if not os.path.exists(filepath): continue
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Replace top center with top 85%
    content = content.replace("start: 'top center'", "start: 'top 85%'")
    content = content.replace('start: "top center"', 'start: "top 85%"')
    
    with open(filepath, 'w') as f:
        f.write(content)

print("Updated ScrollTrigger start values to top 85%")
