import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type SectionWidth = "lg" | "xl" | "2xl" | "full";

const widthClassNames: Record<SectionWidth, string> = {
	lg: "max-w-5xl",
	xl: "max-w-6xl",
	"2xl": "max-w-screen-2xl",
	full: "max-w-full",
};

export interface SectionContainerProps extends HTMLAttributes<HTMLDivElement> {
	width?: SectionWidth;
	padded?: boolean;
	bleed?: boolean;
}

export function SectionContainer({
	children,
	className,
	width = "2xl",
	padded = true,
	bleed = false,
	...rest
}: SectionContainerProps) {
	return (
		<div
			className={cn(
				"w-full",
				!bleed && "mx-auto",
				!bleed && widthClassNames[width],
				padded && "px-4 md:px-6",
				className,
			)}
			{...rest}
		>
			{children}
		</div>
	);
}
