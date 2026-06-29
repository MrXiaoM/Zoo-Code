import type OpenAI from "openai"

const ATTEMPT_COMPLETION_DESCRIPTION = `每次工具使用后，用户会回复该工具使用的结果，即是否成功或失败，以及任何失败原因。当你收到工具使用的结果并确认任务完成后，使用此工具向用户展示你的工作结果。如果用户对结果不满意，他们可能会提供反馈，你可以利用这些反馈进行改进并重试。

重要提示：此工具在你确认用户之前所有工具使用均成功之前不能使用。否则将导致代码损坏和系统故障。在使用此工具之前，你必须确认已收到用户对之前所有工具使用的成功结果。如果没有，则不要使用此工具。

参数：
- result：（必需）任务的结果。以不需要用户进一步输入的最终方式来组织结果。不要以问题或提供进一步帮助来结束结果。

示例：更新 CSS 后完成
{ "result": "我已将 CSS 更新为 flexbox 布局以提升响应能力" }`

const RESULT_PARAMETER_DESCRIPTION = `任务完成后向用户传达的最终结果消息`

export default {
	type: "function",
	function: {
		name: "attempt_completion",
		description: ATTEMPT_COMPLETION_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				result: {
					type: "string",
					description: RESULT_PARAMETER_DESCRIPTION,
				},
			},
			required: ["result"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
