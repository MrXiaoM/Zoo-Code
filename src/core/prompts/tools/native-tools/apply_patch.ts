import type OpenAI from "openai"

const apply_patch_DESCRIPTION = `使用精简的、面向文件的 diff 格式对文件应用补丁。此工具支持创建新文件、删除文件和以精确更改更新现有文件。

补丁格式使用简单、人类可读的结构：

*** Begin Patch
[ 一个或多个文件部分 ]
*** End Patch

每个文件部分以以下三种头部之一开头：
- *** Add File: <path> - 创建新文件。接下来的每一行都是 + 行（初始内容）。
- *** Delete File: <path> - 删除现有文件。之后无内容。
- *** Update File: <path> - 就地修补现有文件。

对于 Update File 操作：
- 可以紧接着 *** Move to: <new path> 如果要重命名文件。
- 然后是一个或多个"块"，每个由 @@ 引入（可选地后跟类名或函数名等上下文）。
- 在块内，每行以：
  - ' '（空格）开头表示上下文行（未更改）
  - '-' 开头表示要删除的行
  - '+' 开头表示要添加的行

上下文指南：
- 在每个更改上下显示 3 行代码。
- 如果 3 行上下文不足以唯一标识位置，使用带有类/函数名的 @@。
- 对于深度嵌套的代码，可以使用多个 @@ 语句。

示例补丁：
*** Begin Patch
*** Add File: hello.txt
+Hello world
*** Update File: src/app.py
*** Move to: src/main.py
@@ def greet():
-print("Hi")
+print("Hello, world!")
*** Delete File: obsolete.txt
*** End Patch`

const apply_patch = {
	type: "function",
	function: {
		name: "apply_patch",
		description: apply_patch_DESCRIPTION,
		parameters: {
			type: "object",
			properties: {
				patch: {
					type: "string",
					description: "apply_patch 格式的完整补丁文本，以 '*** Begin Patch' 开头并以 '*** End Patch' 结尾。",
				},
			},
			required: ["patch"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool

export default apply_patch
