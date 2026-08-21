import os

app_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/App.jsx'
with open(app_path, 'r') as f:
    app = f.read()

if 'import { SplitText }' not in app:
    app = app.replace("import { ScrollTrigger } from 'gsap/all';", "import { ScrollTrigger, SplitText } from 'gsap/all';")
    app = app.replace("gsap.registerPlugin(ScrollTrigger);", "gsap.registerPlugin(ScrollTrigger, SplitText);")

with open(app_path, 'w') as f:
    f.write(app)

print("Registered SplitText in App.jsx")
