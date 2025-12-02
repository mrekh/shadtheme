"use client";

import { motion } from "motion/react";

export function AnimatedOrb() {
	return (
		<div className="pointer-events-none relative flex h-40 w-full items-center justify-center sm:h-48 md:h-56">
			{/* Main gradient orb */}
			<motion.div
				className="absolute size-32 rounded-full blur-3xl sm:size-40 md:size-48"
				style={{
					background:
						"radial-gradient(circle, oklch(from var(--primary) l c h / 0.6) 0%, oklch(from var(--primary) l c h / 0.3) 40%, transparent 70%)",
				}}
				animate={{
					scale: [1, 1.1, 1],
					opacity: [0.8, 1, 0.8],
				}}
				transition={{
					duration: 4,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>

			{/* Secondary accent orb */}
			<motion.div
				className="absolute size-24 rounded-full blur-2xl sm:size-28 md:size-32"
				style={{
					background:
						"radial-gradient(circle, oklch(from var(--secondary) l c h / 0.5) 0%, oklch(from var(--secondary) l c h / 0.2) 50%, transparent 70%)",
					transform: "translate(-30%, -20%)",
				}}
				animate={{
					x: [0, 20, 0],
					y: [0, -15, 0],
					scale: [1, 1.15, 1],
				}}
				transition={{
					duration: 5,
					repeat: Infinity,
					ease: "easeInOut",
					delay: 0.5,
				}}
			/>

			{/* Accent orb */}
			<motion.div
				className="absolute size-20 rounded-full blur-xl sm:size-24 md:size-28"
				style={{
					background:
						"radial-gradient(circle, oklch(from var(--accent) l c h / 0.4) 0%, transparent 60%)",
					transform: "translate(40%, 30%)",
				}}
				animate={{
					x: [0, -15, 0],
					y: [0, 10, 0],
					scale: [1, 1.2, 1],
				}}
				transition={{
					duration: 6,
					repeat: Infinity,
					ease: "easeInOut",
					delay: 1,
				}}
			/>

			{/* Core bright spot */}
			<motion.div
				className="absolute size-8 rounded-full blur-md sm:size-10 md:size-12"
				style={{
					background:
						"radial-gradient(circle, oklch(from var(--primary) calc(l + 0.2) c h / 0.8) 0%, transparent 70%)",
				}}
				animate={{
					scale: [1, 1.3, 1],
					opacity: [0.6, 1, 0.6],
				}}
				transition={{
					duration: 3,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>
		</div>
	);
}
