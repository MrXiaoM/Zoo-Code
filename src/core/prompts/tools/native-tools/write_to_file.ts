import type OpenAI from "openai"

const WRITE_TO_FILE_DESCRIPTION = `请求将内容写入文件。此工具主要用于创建新文件或需要有意完全重写现有文件的场景。如果文件存在，它将被覆盖。如果不存在，它将被创建。此工具将自动创建写入文件所需的任何目录。

**重要：** 在修改现有文件时，你应该优先使用其他编辑工具而不是 write_to_file，因为 write_to_file 较慢且无法处理大文件。write_to_file 主要用于创建新文件。

使用此工具时，直接使用所需的内容。你不需要在使用工具前显示内容。始终在你的响应中提供完整的文件内容。这是不可协商的。部分更新或占位符如 '// rest of code unchanged' 被严格禁止。不这样做将导致不完整或损坏的代码。

创建新项目时，除非用户另有指定，否则将所有新文件组织在专用项目目录中。按照逻辑结构项目，遵循所创建项目类型的最佳实践。

示例：写入配置文件
{ "path": "frontend-config.json", "content": "{\\n  \\"apiEndpoint\\": \\"https://api.example.com\\",\\n  \\"theme\\": {\\n    \\"primaryColor\\": \\"#007bff\\"\\n  }\\n}" }`

const PATH_PARAMETER_DESCRIPTION = `要写入的文件路径（相对于当前工作区目录）`

const CONTENT_PARAMETER_DESCRIPTION = `要写入文件的内容。始终提供文件的完整预期内容，不得截断或省略。你必须包含文件的所有部分，即使它们未被修改。不要包含行号。`

export default {
	type: "function",
	function: {
		name: "write_to_file",
		description: WRITE_TO_FILE_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				path: {
					type: "string",
					description: PATH_PARAMETER_DESCRIPTION,
				},
				content: {
					type: "string",
					description: CONTENT_PARAMETER_DESCRIPTION,
				},
			},
			required: ["path", "content"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
