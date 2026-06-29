import type OpenAI from "openai"

const SEARCH_FILES_DESCRIPTION = `请求在指定目录中的文件之间执行正则表达式搜索，提供上下文丰富的结果。此工具搜索跨多个文件的模式或特定内容，显示每个匹配项及其上下文。

仔细编写你的正则表达式模式，以平衡特殊性和灵活性。使用此工具查找代码模式、TODO 注释、函数定义或项目中的任何基于文本的信息。结果包含周围上下文，因此分析周围代码以更好地理解匹配项。将此工具与其他工具结合使用以进行更全面的分析。

参数：
- path：（必需）要搜索的目录路径（相对于当前工作区目录）。此目录将被递归搜索。
- regex：（必需）要搜索的正则表达式模式。使用 Rust regex 语法。
- file_pattern：（可选）用于过滤文件的 Glob 模式（例如 '*.ts' 用于 TypeScript 文件）。如果未提供，将搜索所有文件（*）。

示例：在当前目录中搜索所有 .ts 文件
{ "path": ".", "regex": ".*", "file_pattern": "*.ts" }

示例：在 JavaScript 文件中搜索函数定义
{ "path": "src", "regex": "function\\s+\\w+", "file_pattern": "*.js" }`

const PATH_PARAMETER_DESCRIPTION = `要递归搜索的目录，相对于工作区`

const REGEX_PARAMETER_DESCRIPTION = `要匹配的 Rust 兼容正则表达式模式`

const FILE_PATTERN_PARAMETER_DESCRIPTION = `可选的 Glob 模式，限制搜索哪些文件（例如 *.ts）`

export default {
	type: "function",
	function: {
		name: "search_files",
		description: SEARCH_FILES_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				path: {
					type: "string",
					description: PATH_PARAMETER_DESCRIPTION,
				},
				regex: {
					type: "string",
					description: REGEX_PARAMETER_DESCRIPTION,
				},
				file_pattern: {
					type: ["string", "null"],
					description: FILE_PATTERN_PARAMETER_DESCRIPTION,
				},
			},
			required: ["path", "regex", "file_pattern"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
