import type OpenAI from "openai"

const NEW_TASK_DESCRIPTION = `使用你提供的消息和初始待办事项清单（如需要）在所选模式中创建一个新的任务实例。

关键：此工具必须单独调用。不要在同一轮消息中与其他工具一起调用此工具。如果你需要在委派之前收集信息，请先在单独的一轮中使用其他工具，然后在下一轮中单独调用 new_task。`

const MODE_PARAMETER_DESCRIPTION = `要开始新任务的模式 slug（例如 code、debug、architect）`

const MESSAGE_PARAMETER_DESCRIPTION = `新任务的初始用户指令或上下文`

const TODOS_PARAMETER_DESCRIPTION = `可选的初始待办事项清单，以 markdown 清单格式编写；工作区要求使用待办事项时此项为必需`

export default {
	type: "function",
	function: {
		name: "new_task",
		description: NEW_TASK_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				mode: {
					type: "string",
					description: MODE_PARAMETER_DESCRIPTION,
				},
				message: {
					type: "string",
					description: MESSAGE_PARAMETER_DESCRIPTION,
				},
				todos: {
					type: ["string", "null"],
					description: TODOS_PARAMETER_DESCRIPTION,
				},
			},
			required: ["mode", "message", "todos"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
