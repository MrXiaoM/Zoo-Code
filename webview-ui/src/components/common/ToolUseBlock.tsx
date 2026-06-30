import { cn } from "@/lib/utils"

export const ToolUseBlock = ({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn("overflow-hidden rounded-md p-2 cursor-pointer", className)}
		style={{
			backgroundColor: "color-mix(in srgb, var(--vscode-editor-background) 75%, transparent)",
			...style,
		}}
		{...props}
	/>
)

export const ToolUseBlockHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn("flex font-mono items-center select-none text-sm text-vscode-descriptionForeground", className)}
		{...props}
	/>
)
