import type OpenAI from "openai"

const ASK_FOLLOWUP_QUESTION_DESCRIPTION = `向用户提问以收集完成任务所需的额外信息。当你需要澄清或更多细节以有效推进时使用。

参数：
- question：（必需）一个清晰、具体的问题，针对所需的信息
- follow_up：（必需）包含 2-4 个建议答案的列表。建议必须是完整、可执行的答案，不包含占位符。可选地包含模式切换（code/architect/etc.）

示例：询问文件路径
{ "question": "frontend-config.json 文件的路径是什么？", "follow_up": [{ "text": "./src/frontend-config.json", "mode": null }, { "text": "./config/frontend-config.json", "mode": null }, { "text": "./frontend-config.json", "mode": null }] }

示例：带模式切换的提问
{ "question": "你希望我实现这个功能吗？", "follow_up": [{ "text": "是的，现在就实现", "mode": "code" }, { "text": "不，只做规划", "mode": "architect" }] }`

const QUESTION_PARAMETER_DESCRIPTION = `捕获你所需缺失信息的清晰、具体的问题`

const FOLLOW_UP_PARAMETER_DESCRIPTION = `必需的 2-4 个建议回复列表；每个建议必须是完整、可执行的答案，可以包含模式切换`

const FOLLOW_UP_TEXT_DESCRIPTION = `用户可选择的建议答案`

const FOLLOW_UP_MODE_DESCRIPTION = `如果选择了此建议，可选的切换模式 slug（例如 code、architect）`

export default {
	type: "function",
	function: {
		name: "ask_followup_question",
		description: ASK_FOLLOWUP_QUESTION_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				question: {
					type: "string",
					description: QUESTION_PARAMETER_DESCRIPTION,
				},
				follow_up: {
					type: "array",
					description: FOLLOW_UP_PARAMETER_DESCRIPTION,
					items: {
						type: "object",
						properties: {
							text: {
								type: "string",
								description: FOLLOW_UP_TEXT_DESCRIPTION,
							},
							mode: {
								type: ["string", "null"],
								description: FOLLOW_UP_MODE_DESCRIPTION,
							},
						},
						required: ["text", "mode"],
						additionalProperties: false,
					},
					minItems: 1,
					maxItems: 4,
				},
			},
			required: ["question", "follow_up"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
