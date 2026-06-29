import * as vscode from "vscode"

import type { ModeConfig } from "@roo-code/types"

import { getAllModesWithPrompts } from "../../../shared/modes"
import { ensureSettingsDirectoryExists } from "../../../utils/globalContext"

export async function getModesSection(context: vscode.ExtensionContext): Promise<string> {
	// Make sure path gets created
	await ensureSettingsDirectoryExists(context)

	// Get all modes with their overrides from extension state
	const allModes = await getAllModesWithPrompts(context)

	const modesContent = `====

模式

- 这些是当前可用的模式：
${allModes
	.map((mode: ModeConfig) => {
		let description: string
		if (mode.whenToUse && mode.whenToUse.trim() !== "") {
			// 使用 whenToUse 作为主要描述，缩进后续行以提高可读性
			description = mode.whenToUse.replace(/\n/g, "\n    ")
		} else {
			// 如果 whenToUse 不可用，回退到 roleDefinition 的第一句话
			description = mode.roleDefinition.split(".")[0]
		}
		return `  * "${mode.name}" 模式 (${mode.slug}) - ${description}`
	})
	.join("\n")}`

	return modesContent
}
