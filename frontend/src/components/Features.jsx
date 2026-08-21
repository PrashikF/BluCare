// src/components/Cocktails.jsx - Clinical Workflow Showcase
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { workflowSteps, coreIntelligence } from '../../constants/index.js';

const Cocktails = () => {
	const containerRef = useRef(null);

	useGSAP(() => {
		const section = containerRef.current;
		if (!section) return;

		const leftLeaf = section.querySelector('#c-left-leaf');
		const rightLeaf = section.querySelector('#c-right-leaf');

		if (leftLeaf || rightLeaf) {
			const parallaxTimeline = gsap.timeline({
				scrollTrigger: {
					trigger: section,
					start: 'top 30%',
					end: 'bottom 80%',
					scrub: true,
				},
			});

			if (leftLeaf) {
				parallaxTimeline.fromTo(leftLeaf, { x: -100, y: 100, opacity: 0 }, { x: 0, y: 0, opacity: 0.2, ease: 'none' }, 0);
			}
			if (rightLeaf) {
				parallaxTimeline.fromTo(rightLeaf, { x: 100, y: 100, opacity: 0 }, { x: 0, y: 0, opacity: 0.2, ease: 'none' }, 0);
			}
		}
	}, { scope: containerRef });

	return (
		<section ref={containerRef} id="cocktails" className="relative overflow-hidden bg-surface py-20">
			<div className="noisy absolute inset-0 z-0 pointer-events-none"></div>
			<img src="/images/cocktail-left-leaf.png" alt="l-leaf" id="c-left-leaf" className="opacity-20" />
			<img src="/images/cocktail-right-leaf.png" alt="r-leaf" id="c-right-leaf" className="opacity-20" />

			<div className="list container mx-auto relative z-10 px-5">
				<div className="popular">
					<h2 className="text-lavender uppercase tracking-widest text-sm font-semibold mb-8">Clinical Workflow</h2>

					<ul className="space-y-6">
						{workflowSteps.map(({ name, country, detail, price }) => (
							<li key={name} className="border-b border-light pb-4 group">
								<div className="md:me-28">
									<h3 className="text-sage text-2xl font-light group-hover:text-aqua transition-colors">{name}</h3>
									<p className="text-subdued text-xs mt-1 uppercase tracking-wider">{country} | {detail}</p>
								</div>
								<span className="text-secondary font-medium">{price}</span>
							</li>
						))}
					</ul>
				</div>

				<div className="loved">
					<h2 className="text-lavender uppercase tracking-widest text-sm font-semibold mb-8">Core Intelligence</h2>

					<ul className="space-y-6">
						{coreIntelligence.map(({ name, country, detail, price }) => (
							<li key={name} className="border-b border-light pb-4 group">
								<div className="me-28">
									<h3 className="text-sage text-2xl font-light group-hover:text-aqua transition-colors">{name}</h3>
									<p className="text-subdued text-xs mt-1 uppercase tracking-wider">{country} | {detail}</p>
								</div>
								<span className="text-secondary font-medium">{price}</span>
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	);
};

export default Cocktails;
