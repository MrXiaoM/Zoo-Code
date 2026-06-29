import type OpenAI from "openai"

const APPLY_DIFF_DESCRIPTION = `使用一个或多个 search/replace 块对现有文件应用精确、有针对性的修改。此工具仅用于手术式编辑；'SEARCH' 块必须精确匹配现有内容，包括空白和缩进。要进行多个有针对性的更改，在 'diff' 参数中提供多个 SEARCH/REPLACE 块。如果你不确定要搜索的确切内容，请先使用 'read_file' 工具。`

const DIFF_PARAMETER_DESCRIPTION = `包含一个或多个定义更改的 search/replace 块的字符串。强烈建议使用 ':start_line:'，它表示原始内容的起始行号。不要为替换内容添加起始行。每个块必须遵循以下格式：
<<<<<<< SEARCH
:start_line:[line_number]
-------
[要查找的精确内容]
=======
[替换为的新内容]
>>>>>>> REPLACE

关键：
- 强烈建议使用 ':start_line:[line_number]' 头部以实现精确匹配。提供时必须遵循精确语法 ':start_line:[integer]'（例如 ':start_line:220'）。不要使用简写形式如 ':220' 或变体如 ':start_line=220'。
- 从源文件复制精确的行以实现 100% 字符串匹配，包括所有空白、缩进和换行。
- 确保分隔符 '-------' 紧跟 ':start_line:[line_number]' 单独成行，并带有换行。`

export const apply_diff = {
	type: "function",
	function: {
		name: "apply_diff",
		description: APPLY_DIFF_DESCRIPTION,
		parameters: {
			type: "object",
			properties: {
				path: {
					type: "string",
					description: "要修改的文件路径，相对于当前工作区目录。",
				},
				diff: {
					type: "string",
					description: DIFF_PARAMETER_DESCRIPTION,
				},
			},
			required: ["path", "diff"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
