import os

hero_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/components/Hero.jsx'
with open(hero_path, 'r') as f:
    hero = f.read()

# Add SplitText import
if 'import { SplitText } from "gsap/all";' not in hero:
    hero = hero.replace('import gsap from "gsap";', 'import gsap from "gsap";\nimport { SplitText } from "gsap/all";')

old_init = """		const initAnimations = () => {
			const scope = containerRef.current;
			if (!scope) return;

			const titleEl = scope.querySelector(".title");
			const subtitleEl = scope.querySelector(".subtitle");

			if (titleEl) {
				gsap.fromTo(titleEl, 
					{ opacity: 0, y: 30 },
					{ opacity: 1, y: 0, duration: 1.5, ease: "power3.out" }
				);
			}

			if (subtitleEl) {
				gsap.fromTo(subtitleEl, 
					{ opacity: 0, y: 30 },
					{ opacity: 1, y: 0, duration: 1.5, ease: "power3.out", delay: 0.2 }
				);
			}"""

new_init = """		const initAnimations = () => {
			const scope = containerRef.current;
			if (!scope) return;

			const titleEl = scope.querySelector(".title");
			const subtitleEl = scope.querySelector(".subtitle");

			if (titleEl) {
				heroSplit = new SplitText(titleEl, { type: "chars, words" });
				heroSplit.chars.forEach((char) => char.classList.add("text-gradient"));
				gsap.from(heroSplit.chars, {
					y: 50,
                    opacity: 0,
					duration: 1.8,
					ease: "expo.out",
					stagger: 0.06,
				});
			}

			if (subtitleEl) {
				paragraphSplit = new SplitText(subtitleEl, { type: "lines" });
				paragraphSplit.lines.forEach((line) => line.classList.add("text-gradient"));
				gsap.from(paragraphSplit.lines, {
					opacity: 0,
					y: 40,
					duration: 1.8,
					ease: "expo.out",
					stagger: 0.1,
				});
			}"""

hero = hero.replace(old_init, new_init)

# Fix cleanup
old_cleanup = """		return () => {
		};"""
new_cleanup = """		return () => {
			if (heroSplit) heroSplit.revert();
			if (paragraphSplit) paragraphSplit.revert();
		};"""
hero = hero.replace(old_cleanup, new_cleanup)

with open(hero_path, 'w') as f:
    f.write(hero)

print("Hero animations fixed")
