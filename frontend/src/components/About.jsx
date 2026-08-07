// src/components/About.jsx
import { useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/all';
import { useGSAP } from '@gsap/react';

const About = () => {
	const containerRef = useRef(null);

	useGSAP(() => {
		let titleSplit = null;

		const initAnimations = () => {
			const scope = containerRef.current;
			if (!scope) return;

			const heading = scope.querySelector('#about h2') || scope.querySelector('h2');
			if (!heading) return;

			titleSplit = SplitText.create(heading, {
				type: 'words',
			});

			const scrollTimeline = gsap.timeline({
				scrollTrigger: {
					trigger: scope,
					start: 'top center',
				},
			});

			if (titleSplit.words && titleSplit.words.length > 0) {
				scrollTimeline.from(titleSplit.words, {
					opacity: 0,
					duration: 1,
					yPercent: 100,
					ease: 'expo.out',
					stagger: 0.02,
				});
			}

			const gridItems = scope.querySelectorAll('.top-grid div, .bottom-grid div');
			if (gridItems && gridItems.length > 0) {
				scrollTimeline.from(gridItems, {
					opacity: 0,
					duration: 1,
					ease: 'power2.out',
					stagger: 0.1,
				}, '-=0.5');
			}
		};

		if (document.fonts && document.fonts.ready) {
			document.fonts.ready.then(() => {
				initAnimations();
			});
		} else {
			initAnimations();
		}

		return () => {
			if (titleSplit) titleSplit.revert();
		};
	}, { scope: containerRef });

	return (
		<div ref={containerRef} id="about" className="py-10">
			<div className="mb-16 md:px-0 px-5">
				<div className="content container mx-auto">
					<div className="md:col-span-8">
						<p className="badge backdrop-blur-md bg-sage/10 border border-sage/20 text-sage px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider inline-block mb-6">Medical Precision</p>
						<h2 className="text-5xl md:text-7xl font-sans font-light leading-tight text-primary">
							Where every detail matters <span className="text-subdued">-</span> from <span className="text-sage">symptom</span> to <span className="text-lavender">solution</span>
						</h2>
					</div>

					<div className="sub-content flex flex-col justify-end">
						<p className="text-secondary text-lg font-light leading-relaxed max-w-md mb-8">
							Every care journey we design is rooted in thoughtful analysis, from symptom input to recovery strategy. That focus is what elevates healthcare from reactive to proactive.
						</p>

						<div className="flex items-end gap-4">
							<p className="md:text-5xl text-3xl font-bold text-primary">
								<span className="text-gradient">120k+</span>
							</p>
							<p className="text-xs text-subdued uppercase tracking-widest mb-2">
								Verified tokens by WHO
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className="top-grid container mx-auto px-5">
				<div className="xl:col-span-3 rounded-3xl overflow-hidden border border-light h-72">
					<div className="noisy" />
					<img src="/images/abt1.webp" alt="grid-img-1" className="object-cover w-full h-full opacity-80" />
				</div>

				<div className="xl:col-span-6 rounded-3xl overflow-hidden border border-light h-72">
					<div className="noisy" />
					<img src="/images/abt2.jpg" alt="grid-img-2" className="object-cover w-full h-full opacity-80" />
				</div>

				<div className="xl:col-span-3 rounded-3xl overflow-hidden border border-light h-72">
					<div className="noisy" />
					<img src="/images/abt5.webp" alt="grid-img-5" className="object-cover w-full h-full opacity-80" />
				</div>
			</div>

			<div className="bottom-grid container mx-auto px-5 mt-5">
				<div className="md:col-span-8 rounded-3xl overflow-hidden border border-light h-72">
					<div className="noisy" />
					<img src="/images/abt3.webp" alt="grid-img-3" className="object-cover w-full h-full opacity-80" />
				</div>

				<div className="md:col-span-4 rounded-3xl overflow-hidden border border-light h-72">
					<div className="noisy" />
					<img src="/images/abt4.webp" alt="grid-img-4" className="object-cover w-full h-full opacity-80" />
				</div>
			</div>
		</div>
	);
};

export default About;
