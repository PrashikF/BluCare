// src/components/Hero.jsx
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/all";

import { useRef } from "react";
import { useMediaQuery } from "react-responsive";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const Hero = () => {
	const { isSignedIn } = useAuth();
	const containerRef = useRef(null);
	const videoRef = useRef(null);
	const isMobile = useMediaQuery({ maxWidth: 767 });

	useGSAP(() => {
		let heroSplit = null;
		let paragraphSplit = null;

		const initAnimations = () => {
			const scope = containerRef.current;
			if (!scope) return;

			const titleEl = scope.querySelector(".title");
			const subtitleEl = scope.querySelector(".subtitle");

			if (titleEl) {
				heroSplit = new SplitText(titleEl, { type: "chars, words" });
				// Removed per-char text-gradient to allow parent gradient to flow across word
				gsap.fromTo(heroSplit.chars,
					{ y: 50, opacity: 0 },
					{
						y: 0,
						opacity: 1,
						duration: 1.8,
						ease: "expo.out",
						stagger: 0.06,
					}
				);
			}

			if (subtitleEl) {
				paragraphSplit = new SplitText(subtitleEl, { type: "lines" });
				paragraphSplit.lines.forEach((line) => line.classList.add("text-gradient"));
				gsap.fromTo(paragraphSplit.lines,
					{ opacity: 0, y: 40 },
					{
						opacity: 1,
						y: 0,
						duration: 1.8,
						ease: "expo.out",
						stagger: 0.1,
					}
				);
			}

			const heroSec = scope.querySelector("#hero");
			if (heroSec) {
				const leafTl = gsap.timeline({
					scrollTrigger: {
						trigger: heroSec,
						start: "top top",
						end: "bottom top",
						scrub: true,
					},
				});
				const rightLeaf = scope.querySelector(".right-leaf");
				const leftLeaf = scope.querySelector(".left-leaf");
				if (rightLeaf) leafTl.to(rightLeaf, { y: 200, opacity: 0.2 }, 0);
				if (leftLeaf) leafTl.to(leftLeaf, { y: -200, opacity: 0.2 }, 0);
			}

			/*
			if (videoRef.current) {
				const startValue = isMobile ? "top 50%" : "center 60%";
				const endValue = isMobile ? "120% top" : "bottom top";

				const videoTl = gsap.timeline({
					scrollTrigger: {
						trigger: videoRef.current,
						start: startValue,
						end: endValue,
						scrub: true,
						pin: true,
					},
				});

				videoRef.current.onloadedmetadata = () => {
					videoTl.to(videoRef.current, {
						currentTime: videoRef.current.duration,
					});
				};
			}
			*/

			const btn = scope.querySelector(".hero-btn");
			if (btn) {
				gsap.fromTo(btn,
					{ opacity: 0, y: 20 },
					{ opacity: 1, y: 0, duration: 1.5, ease: "power3.out", delay: 0.4 }
				);
			}
		};

		initAnimations();

		return () => {
			if (heroSplit) heroSplit.revert();
			if (paragraphSplit) paragraphSplit.revert();
		};
	}, { scope: containerRef });

	return (
		<div ref={containerRef}>
			<section id="hero" className="relative overflow-hidden min-h-dvh flex flex-col justify-center py-20">
				<div className="relative z-10 flex flex-col items-center w-full px-5">
					<h1 className="title font-bold text-gradient leading-tight -translate-y-3 md:-translate-y-9">
						BluCare+
					</h1>

					<div className="hero-btn -mt-4 md:-mt-12 z-20">
						<div className="persistent-btn-glow">
							<Link
								to={isSignedIn ? "/app/chat" : "/sign-in"}
								className="badge flex items-center justify-center backdrop-blur-md bg-sage/10 border border-sage/20 text-sage px-8 py-3 rounded-full text-sm font-semibold uppercase tracking-widest hover:bg-sage hover:text-bg-base hover:scale-105 transition-all duration-300 transform cursor-pointer no-underline"
							>
								Start AI Chat
							</Link>
						</div>
					</div>
				</div>

				<img
					src="/images/cocktail-left-leaf.png"
					alt="left-leaf"
					className="left-leaf opacity-40 z-0 pointer-events-none"
				/>
				<img
					src="/images/hero-right-leaf.png"
					alt="right-leaf"
					className="right-leaf opacity-40 z-0 pointer-events-none"
				/>

				<div className="body relative md:absolute w-full px-5 mt-20 md:mt-0 md:bottom-20">
					<div className="content container mx-auto">
						<div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-10 w-full">
							<div className="space-y-5 text-center lg:text-left">
								<p className="text-secondary uppercase tracking-[0.2em] font-medium text-xs">
									Clinical Intelligence Platform
								</p>
								<p className="subtitle font-medium text-xl md:text-2xl">
									Advanced Diagnostics <br className="hidden md:block" /> Gentle Human Care
								</p>
							</div>

							<div className="view-cocktails lg:max-w-xs text-center lg:text-left">
								<p className="hero-desc text-sm md:text-base mb-6 text-secondary">
									BluCare+ harmonizes medical precision with empathetic understanding, providing a safe and intelligent space for your health journey.
								</p>
								<a
									href="#cocktails"
									className="group inline-flex items-center gap-3 text-sage font-medium hover:text-aqua transition-colors"
								>
									<span>Explore Architecture</span>
									<div className="w-8 h-[1px] bg-sage group-hover:w-12 group-hover:bg-aqua transition-all" />
								</a>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Hero;