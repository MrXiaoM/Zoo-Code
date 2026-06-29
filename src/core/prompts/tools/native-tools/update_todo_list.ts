import type OpenAI from "openai"

const UPDATE_TODO_LIST_DESCRIPTION = `用反映当前状态的更新清单替换整个 TODO 列表。始终提供完整列表；系统将覆盖先前的列表。此工具旨在进行逐步任务跟踪，允许你在更新前确认每步已完成，一次性更新多个任务状态（例如将一个标记为已完成并开始下一个），以及在长时间或复杂任务期间动态添加新发现的待办事项。

清单格式：
- 使用单级 markdown 清单（无嵌套或子任务）
- 按预期执行顺序列出待办事项
- 状态选项：[ ]（待处理）、[x]（已完成）、[-]（进行中）

核心原则：
- 在更新前，始终确认哪些待办事项已完成
- 你可以在单次更新中更新多个状态
- 发现新的可执行项时即时添加
- 只有在完全完成后才将任务标记为已完成
- 保留所有未完成的任务，除非明确指示移除

示例：初始任务列表
{ "todos": "[x] 分析需求\\n[x] 设计架构\\n[-] 实现核心逻辑\\n[ ] 编写测试\\n[ ] 更新文档" }

示例：完成实现后
{ "todos": "[x] 分析需求\\n[x] 设计架构\\n[x] 实现核心逻辑\\n[-] 编写测试\\n[ ] 更新文档\\n[ ] 添加性能基准" }

何时使用：
- 任务涉及多个步骤或需要持续跟踪
- 需要一次性更新多个待办事项的状态
- 在执行过程中发现新的可执行项
- 任务复杂且受益于逐步进度跟踪

何时不使用：
- 只有一个单一的简单任务
- 任务可以在一两个简单步骤内完成
- 请求纯粹是对话或信息性的`

const TODOS_PARAMETER_DESCRIPTION = `按执行顺序排列的完整 markdown 清单，使用 [ ] 表示待处理，[x] 表示已完成，[-] 表示进行中`

export default {
	type: "function",
	function: {
		name: "update_todo_list",
		description: UPDATE_TODO_LIST_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				todos: {
					type: "string",
					description: TODOS_PARAMETER_DESCRIPTION,
				},
			},
			required: ["todos"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
