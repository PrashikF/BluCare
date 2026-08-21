// src/components/Contact.jsx
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';

import gsap from 'gsap';

const Contact = () => {
	const containerRef = useRef(null);

	useGSAP(() => {
		let titleSplit = null;

		const initAnimations = () => {
			const scope = containerRef.current;
			if (!scope) return;

			const heading = scope.querySelector('#contact h2') || scope.querySelector('h2');
			if (!heading) return;
			
			const timeline = gsap.timeline({
				scrollTrigger: {
					trigger: scope,
					toggleActions: "play none none reverse",
					start: 'top 85%',
				},
				ease: 'power2.out',
			});

			if (heading) {
				timeline.fromTo(heading, 
					{ opacity: 0, y: 20 },
					{
						opacity: 1,
						y: 0,
						duration: 1.2,
						ease: 'expo.out',
					}
				);
			}

			const footerInfo = scope.querySelector('.footer-info');
			if (footerInfo) {
				timeline.fromTo(footerInfo, 
					{ opacity: 0, y: 20 },
					{
						opacity: 1,
						y: 0,
						duration: 1,
					}, '-=0.5'
				);
			}
		};

		initAnimations();

		return () => {
		};
	}, { scope: containerRef });

	return (
		<footer ref={containerRef} id="contact" className="relative py-24 bg-base border-t border-light overflow-hidden">
			<div className="noisy absolute inset-0 z-0 pointer-events-none"></div>
			<img src="/images/footer-left-leaf.png" alt="leaf-left" id="f-left-leaf" className="opacity-10 absolute -left-20 bottom-0 pointer-events-none" />
			<img src="/images/footer-right-leaf.png" alt="leaf-right" id="f-right-leaf" className="opacity-10 absolute -right-20 top-0 pointer-events-none" />

			<div className="content container mx-auto px-5 text-center relative z-10">
				<p className="text-secondary uppercase tracking-[0.3em] font-medium text-xs mb-8">Get In Touch</p>
				<h2 className="text-5xl md:text-8xl font-sans font-light leading-none mb-8 text-primary">
					Start Your <span className="text-lavender">Journey</span> <br /> With <span className="font-medium text-gradient">BluCare+</span>
				</h2>

				<div className="footer-info grid grid-cols-1 md:grid-cols-3 gap-12 mt-20 border-t border-light pt-20">
					<div className="text-center md:text-left">
						<h4 className="text-subdued uppercase tracking-widest text-xs font-semibold mb-4">Availability</h4>
						<p className="text-primary font-light">24/7 Intelligent AI Support</p>
						<p className="text-secondary font-light">Global Clinical Access</p>
					</div>
					<div className="text-center">
						<h4 className="text-subdued uppercase tracking-widest text-xs font-semibold mb-4">System Status</h4>
						<div className="flex items-center justify-center gap-2">
							<div className="brand-dot"></div>
							<p className="text-primary font-light">All Systems Operational</p>
						</div>
					</div>
					<div className="text-center md:text-right">
						<h4 className="text-subdued uppercase tracking-widest text-xs font-semibold mb-4">Contact</h4>
						<p className="text-primary font-light">support@ragblucare.ai</p>
						<p className="text-secondary font-light">+91 9403871129</p>
					</div>
				</div>

				<div className="mt-24 pt-8 border-t border-light flex flex-col md:flex-row justify-between items-center gap-6">
					<p className="text-subdued text-xs tracking-wider">© 2026 BLUCARE+ SYSTEMS. ALL RIGHTS RESERVED.</p>
					<div className="flex gap-8">
						<a href="#" className="text-subdued hover:text-lavender transition-colors text-xs uppercase tracking-widest font-medium">Privacy</a>
						<a href="#" className="text-subdued hover:text-lavender transition-colors text-xs uppercase tracking-widest font-medium">Clinical Terms</a>
						<a href="#" className="text-subdued hover:text-lavender transition-colors text-xs uppercase tracking-widest font-medium">Security</a>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Contact;
