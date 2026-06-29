import type { RooCodeAPI } from "@roo-code/types"

declare global {
	// eslint-disable-next-line no-var -- `var` is required for global declarations in .d.ts files
	var api: RooCodeAPI
}

export {}
