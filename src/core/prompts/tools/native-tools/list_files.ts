import type OpenAI from "openai"

const LIST_FILES_DESCRIPTION = `请求列出指定目录中的文件和目录。如果 recursive 为 true，它将递归列出所有文件和目录。如果 recursive 为 false 或未提供，它将仅列出顶层内容。不要使用此工具来确认你可能已创建的文件的存不存在，因为用户会通知你文件是否已成功创建。

参数：
- path：（必需）要列出内容的目录路径（相对于当前工作区目录）
- recursive：（必需）是否递归列出文件。true 表示递归列出，false 表示仅列出顶层。

示例：列出当前目录中的所有文件（仅顶层）
{ "path": ".", "recursive": false }

示例：递归列出 src 目录中的所有文件
{ "path": "src", "recursive": true }`

const PATH_PARAMETER_DESCRIPTION = `要检查的目录路径，相对于工作区`

const RECURSIVE_PARAMETER_DESCRIPTION = `设为 true 递归列出内容；false 仅显示顶层`

export default {
	type: "function",
	function: {
		name: "list_files",
		description: LIST_FILES_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				path: {
					type: "string",
					description: PATH_PARAMETER_DESCRIPTION,
				},
				recursive: {
					type: "boolean",
					description: RECURSIVE_PARAMETER_DESCRIPTION,
				},
			},
			required: ["path", "recursive"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
