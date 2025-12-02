import { cn } from "@/lib/utils";

export function BlockDisplay({
	children,
	className,
	style,
}: {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
}) {
	return (
		<div
			className={cn(
				"theme-container mx-auto",
				"bg-card border-border/50 border",
				"p-4 shadow-sm md:p-6",
				className,
			)}
			style={{
				borderRadius: "calc(var(--radius) * 1.5)",
				...style,
			}}
		>
			{children}
		</div>
	);
}
