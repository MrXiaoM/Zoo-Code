import type OpenAI from "openai"

const SEARCH_REPLACE_DESCRIPTION = `使用此工具对现有文件进行搜索和替换操作。

该工具将替换指定文件中 old_string 的一次出现为 new_string。

使用此工具的关键要求：

1. 唯一性：old_string 必须唯一地标识你要更改的特定实例。这意味着：
   - 在更改点之前包含至少 3-5 行上下文
   - 在更改点之后包含至少 3-5 行上下文
   - 包含所有空白、缩进和周围代码，与文件中完全一致

2. 单次实例：此工具每次只能更改一个实例。如果你需要更改多个实例：
   - 为每个实例分别调用此工具
   - 每次调用必须使用大量上下文唯一地标识其特定实例

3. 验证：在使用此工具之前：
   - 如果存在多个实例，收集足够的上下文以唯一地标识每个实例
   - 为每个实例计划单独的调用`

const search_replace = {
	type: "function",
	function: {
		name: "search_replace",
		description: SEARCH_REPLACE_DESCRIPTION,
		parameters: {
			type: "object",
			properties: {
				file_path: {
					type: "string",
					description:
						"要在其中执行搜索和替换操作的文件路径。你可以使用工作区中的相对路径或绝对路径。如果提供了绝对路径，它将按原样保留。",
				},
				old_string: {
					type: "string",
					description: "要替换的文本（必须在文件中唯一，并且必须精确匹配文件内容，包括所有空白和缩进）",
				},
				new_string: {
					type: "string",
					description: "替换 old_string 的编辑后文本（必须与 old_string 不同）",
				},
			},
			required: ["file_path", "old_string", "new_string"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool

export default search_replace
