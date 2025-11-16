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
		<div className={cn("theme-container mx-auto", className)} style={style}>
			{children}
		</div>
	);
}
