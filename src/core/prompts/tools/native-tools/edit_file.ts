import type OpenAI from "openai"

const EDIT_FILE_DESCRIPTION = `使用此工具替换现有文件中的文本，或创建新文件。

此工具执行字面字符串替换，支持多次出现。

为抵抗轻微的格式漂移，该工具会规范化行尾符（CRLF/LF）进行匹配，并在精确字面匹配失败时回退到确定性匹配策略（精确 → 空白容忍匹配 → 基于 token 的匹配）。原始文件的行尾符在写入时被保留。

使用模式：

1. 修改现有文件（默认）：
   - 提供 file_path、old_string（要查找的文本）和 new_string（替换文本）
   - 默认情况下，期望 old_string 恰好出现 1 次
   - 使用 expected_replacements 替换多次出现

2. 创建新文件：
   - 将 old_string 设置为空字符串 ""
   - new_string 成为整个文件内容
   - 文件必须尚未存在

关键要求：

1. 精确匹配（最佳）：old_string 应精确匹配文件内容，包括：
     - 所有空白字符（空格、制表符、换行符）
     - 所有缩进
     - 所有标点符号和特殊字符

2. 唯一性上下文：对于单次替换（默认），在目标文本前后包含至少 3 行上下文以确保唯一性。

3. 多次替换：如果你需要替换多个相同的出现：
    - 将 expected_replacements 设置为你期望替换的精确数量
    - 所有出现都将被替换

4. 无需转义：提供字面文本——不要转义特殊字符。`

const edit_file = {
	type: "function",
	function: {
		name: "edit_file",
		description: EDIT_FILE_DESCRIPTION,
		parameters: {
			type: "object",
			properties: {
				file_path: {
					type: "string",
					description:
						"要修改或创建的文件路径。你可以使用工作区中的相对路径或绝对路径。如果提供了绝对路径，它将按原样保留。",
				},
				old_string: {
					type: "string",
					description:
						"要替换的精确字面文本（必须精确匹配文件内容，包括所有空白和缩进）。对于单次替换（默认），在目标文本前后包含至少 3 行上下文。使用空字符串来创建新文件。",
				},
				new_string: {
					type: "string",
					description: "替换 old_string 的精确字面文本。创建新文件时（old_string 为空），此项成为文件内容。",
				},
				expected_replacements: {
					type: "number",
					description: "预期替换次数。默认值为 1（如果未指定）。当你想替换同一文本的多次出现时使用。",
					minimum: 1,
				},
			},
			required: ["file_path", "old_string", "new_string"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool

export default edit_file
