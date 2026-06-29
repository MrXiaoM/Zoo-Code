import { Anthropic } from "@anthropic-ai/sdk"
import * as path from "path"
import * as diff from "diff"
import { RooIgnoreController, LOCK_TEXT_SYMBOL } from "../ignore/RooIgnoreController"
import { RooProtectedController } from "../protect/RooProtectedController"

export const formatResponse = {
	toolDenied: () =>
		JSON.stringify({
			status: "denied",
			message: "用户拒绝了此操作。",
		}),

	toolDeniedWithFeedback: (feedback?: string) =>
		JSON.stringify({
			status: "denied",
			feedback,
		}),

	toolApprovedWithFeedback: (feedback?: string) =>
		JSON.stringify({
			status: "approved",
			feedback,
		}),

	toolError: (error?: string) =>
		JSON.stringify({
			status: "error",
			message: "工具执行失败",
			error,
		}),

	rooIgnoreError: (path: string) =>
		JSON.stringify({
			status: "error",
			type: "access_denied",
			message: "访问被 .rooignore 阻止",
			path,
			suggestion: "尝试在没有此文件的情况下继续，或要求用户更新 .rooignore 文件",
		}),

	noToolsUsed: () => {
		const instructions = getToolInstructionsReminder()

		return `[错误] 你在上一轮响应中没有使用工具！请重试并使用工具。

${instructions}

# 后续步骤

如果你已完成用户的任务，使用 attempt_completion 工具。
如果你需要用户提供额外信息，使用 ask_followup_question 工具。
否则，如果你尚未完成任务且不需要额外信息，则继续执行任务的下一步。
（这是一条自动消息，请不要以对话方式回复。）`
	},

	tooManyMistakes: (feedback?: string) =>
		JSON.stringify({
			status: "guidance",
			feedback,
		}),

	missingToolParameterError: (paramName: string) => {
		const instructions = getToolInstructionsReminder()

		return `缺少必需参数 '${paramName}' 的值。请以完整响应重试。\n\n${instructions}`
	},

	invalidMcpToolArgumentError: (serverName: string, toolName: string) =>
		JSON.stringify({
			status: "error",
			type: "invalid_argument",
			message: "无效的 JSON 参数",
			server: serverName,
			tool: toolName,
			suggestion: "请使用格式正确的 JSON 参数重试",
		}),

	unknownMcpToolError: (serverName: string, toolName: string, availableTools: string[]) =>
		JSON.stringify({
			status: "error",
			type: "unknown_tool",
			message: "服务器上不存在该工具",
			server: serverName,
			tool: toolName,
			available_tools: availableTools.length > 0 ? availableTools : [],
			suggestion: "请使用其中一个可用工具，或检查服务器是否已正确配置",
		}),

	unknownMcpServerError: (serverName: string, availableServers: string[]) =>
		JSON.stringify({
			status: "error",
			type: "unknown_server",
			message: "服务器未配置",
			server: serverName,
			available_servers: availableServers.length > 0 ? availableServers : [],
		}),

	toolResult: (
		text: string,
		images?: string[],
	): string | Array<Anthropic.TextBlockParam | Anthropic.ImageBlockParam> => {
		if (images && images.length > 0) {
			const textBlock: Anthropic.TextBlockParam = { type: "text", text }
			const imageBlocks: Anthropic.ImageBlockParam[] = formatImagesIntoBlocks(images)
			// Placing images after text leads to better results
			return [textBlock, ...imageBlocks]
		} else {
			return text
		}
	},

	imageBlocks: (images?: string[]): Anthropic.ImageBlockParam[] => {
		return formatImagesIntoBlocks(images)
	},

	formatFilesList: (
		absolutePath: string,
		files: string[],
		didHitLimit: boolean,
		rooIgnoreController: RooIgnoreController | undefined,
		showRooIgnoredFiles: boolean,
		rooProtectedController?: RooProtectedController,
	): string => {
		const sorted = files
			.map((file) => {
				// convert absolute path to relative path
				const relativePath = path.relative(absolutePath, file).toPosix()
				return file.endsWith("/") ? relativePath + "/" : relativePath
			})
			// Sort so files are listed under their respective directories to make it clear what files are children of what directories. Since we build file list top down, even if file list is truncated it will show directories that cline can then explore further.
			.sort((a, b) => {
				const aParts = a.split("/") // only works if we use toPosix first
				const bParts = b.split("/")
				for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
					if (aParts[i] !== bParts[i]) {
						// If one is a directory and the other isn't at this level, sort the directory first
						if (i + 1 === aParts.length && i + 1 < bParts.length) {
							return -1
						}
						if (i + 1 === bParts.length && i + 1 < aParts.length) {
							return 1
						}
						// Otherwise, sort alphabetically
						return aParts[i].localeCompare(bParts[i], undefined, { numeric: true, sensitivity: "base" })
					}
				}
				// If all parts are the same up to the length of the shorter path,
				// the shorter one comes first
				return aParts.length - bParts.length
			})

		let rooIgnoreParsed: string[] = sorted

		if (rooIgnoreController) {
			rooIgnoreParsed = []
			for (const filePath of sorted) {
				// path is relative to absolute path, not cwd
				// validateAccess expects either path relative to cwd or absolute path
				// otherwise, for validating against ignore patterns like "assets/icons", we would end up with just "icons", which would result in the path not being ignored.
				const absoluteFilePath = path.resolve(absolutePath, filePath)
				const isIgnored = !rooIgnoreController.validateAccess(absoluteFilePath)

				if (isIgnored) {
					// If file is ignored and we're not showing ignored files, skip it
					if (!showRooIgnoredFiles) {
						continue
					}
					// Otherwise, mark it with a lock symbol
					rooIgnoreParsed.push(LOCK_TEXT_SYMBOL + " " + filePath)
				} else {
					// Check if file is write-protected (only for non-ignored files)
					const isWriteProtected = rooProtectedController?.isWriteProtected(absoluteFilePath) || false
					if (isWriteProtected) {
						rooIgnoreParsed.push("🛡️ " + filePath)
					} else {
						rooIgnoreParsed.push(filePath)
					}
				}
			}
		}
		if (didHitLimit) {
			return `${rooIgnoreParsed.join(
				"\n",
			)}\n\n(File list truncated. Use list_files on specific subdirectories if you need to explore further.)`
		} else if (rooIgnoreParsed.length === 0 || (rooIgnoreParsed.length === 1 && rooIgnoreParsed[0] === "")) {
			return "No files found."
		} else {
			return rooIgnoreParsed.join("\n")
		}
	},

	createPrettyPatch: (filename = "file", oldStr?: string, newStr?: string) => {
		// strings cannot be undefined or diff throws exception
		const patch = diff.createPatch(filename.toPosix(), oldStr || "", newStr || "", undefined, undefined, {
			context: 3,
		})
		const lines = patch.split("\n")
		const prettyPatchLines = lines.slice(4)
		return prettyPatchLines.join("\n")
	},
}

// to avoid circular dependency
const formatImagesIntoBlocks = (images?: string[]): Anthropic.ImageBlockParam[] => {
	return images
		? images.map((dataUrl) => {
				// data:image/png;base64,base64string
				const [rest, base64] = dataUrl.split(",")
				const mimeType = rest.split(":")[1].split(";")[0]
				return {
					type: "image",
					source: { type: "base64", media_type: mimeType, data: base64 },
				} as Anthropic.ImageBlockParam
			})
		: []
}

const toolUseInstructionsReminderNative = `# 提醒：工具使用说明

工具使用平台原生工具调用机制来调用。每个工具需要工具描述中定义的特定参数。请参考系统指令中提供的工具定义，获取正确的参数结构和使用示例。

始终确保你为想要使用的工具提供所有必需的参数。`

/**
 * Gets the tool use instructions reminder.
 */
function getToolInstructionsReminder(): string {
	return toolUseInstructionsReminderNative
}
