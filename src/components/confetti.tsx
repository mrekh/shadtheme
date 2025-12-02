"use client";

import { useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "motion/react";

interface ConfettiPiece {
	id: number;
	x: number;
	color: string;
	delay: number;
	rotation: number;
	scale: number;
}

interface ConfettiProps {
	isActive: boolean;
	duration?: number;
	pieceCount?: number;
	colors?: string[];
	onComplete?: () => void;
}

// Deterministic piece generation using a seed
function generatePieces(
	pieceCount: number,
	colors: string[],
	seed: number,
): ConfettiPiece[] {
	const pieces: ConfettiPiece[] = [];
	// Use a simple seeded random for determinism
	let s = seed;
	const seededRandom = () => {
		s = (s * 9301 + 49297) % 233280;
		return s / 233280;
	};

	for (let i = 0; i < pieceCount; i++) {
		pieces.push({
			id: i,
			x: seededRandom() * 100,
			color: colors[Math.floor(seededRandom() * colors.length)],
			delay: seededRandom() * 0.3,
			rotation: seededRandom() * 360,
			scale: 0.5 + seededRandom() * 0.5,
		});
	}
	return pieces;
}

export function Confetti({
	isActive,
	duration = 1500,
	pieceCount = 50,
	colors = [
		"var(--primary)",
		"var(--secondary)",
		"var(--accent)",
		"var(--destructive)",
	],
	onComplete,
}: ConfettiProps) {
	const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
	const seedRef = useRef(1);

	// Handle activation and deactivation - generate pieces in effect
	// This effect synchronizes confetti state with the external isActive prop
	/* eslint-disable react-hooks/set-state-in-effect */
	useEffect(() => {
		if (!isActive) {
			setPieces([]);
			return;
		}

		// Check for reduced motion preference
		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		if (prefersReducedMotion) {
			onComplete?.();
			return;
		}

		// Generate pieces with current seed and increment for next activation
		const currentSeed = seedRef.current;
		seedRef.current += 1;
		setPieces(generatePieces(pieceCount, colors, currentSeed));

		const timer = setTimeout(() => {
			setPieces([]);
			onComplete?.();
		}, duration);

		return () => clearTimeout(timer);
	}, [isActive, duration, onComplete, pieceCount, colors]);
	/* eslint-enable react-hooks/set-state-in-effect */

	if (pieces.length === 0) return null;

	return (
		<div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
			<AnimatePresence>
				{pieces.map((piece) => (
					<motion.div
						key={piece.id}
						className="absolute size-2 rounded-sm"
						style={{
							left: `${piece.x}%`,
							top: -20,
							backgroundColor: piece.color,
							transform: `scale(${piece.scale})`,
						}}
						initial={{
							y: -20,
							rotate: 0,
							opacity: 1,
						}}
						animate={{
							y: typeof window !== "undefined" ? window.innerHeight + 20 : 800,
							rotate: piece.rotation + 720,
							opacity: [1, 1, 0],
						}}
						transition={{
							duration: duration / 1000,
							delay: piece.delay,
							ease: [0.25, 0.46, 0.45, 0.94],
						}}
					/>
				))}
			</AnimatePresence>
		</div>
	);
}
