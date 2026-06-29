import type OpenAI from "openai"

const CODEBASE_SEARCH_DESCRIPTION = `使用语义搜索查找与搜索查询最相关的文件。基于含义而非精确的文本匹配进行搜索。默认搜索整个工作区。除非有明确原因不使用，否则重用用户的确切措辞——他们的表述通常有助于语义搜索。查询必须使用英文（如需要请翻译）。

**关键：对于你在此对话中尚未检查过的任何代码探索，你必须首先使用此工具，然后再使用任何其他搜索或文件探索工具。** 这适用于整个对话过程，而不仅仅是开始。此工具使用语义搜索基于含义而非仅仅是关键词来查找相关代码，使其比基于正则的 search_files 更有效地理解实现。即使你已经探索了一些代码，任何新的探索领域都需要首先使用 codebase_search。

参数：
- query：（必需）搜索查询。除非有明确原因不使用，否则重用用户的确切措辞/问题格式。
- path：（可选）将搜索限制到特定子目录（相对于当前工作区目录）。留空则搜索整个工作区。

示例：搜索用户认证代码
{ "query": "User login and password hashing", "path": "src/auth" }

示例：搜索整个工作区
{ "query": "database connection pooling", "path": null }`

const QUERY_PARAMETER_DESCRIPTION = `描述你所需信息的基于含义的搜索查询`

const PATH_PARAMETER_DESCRIPTION = `可选的子目录（相对于工作区）以限制搜索范围`

export default {
	type: "function",
	function: {
		name: "codebase_search",
		description: CODEBASE_SEARCH_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				query: {
					type: "string",
					description: QUERY_PARAMETER_DESCRIPTION,
				},
				path: {
					type: ["string", "null"],
					description: PATH_PARAMETER_DESCRIPTION,
				},
			},
			required: ["query", "path"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
