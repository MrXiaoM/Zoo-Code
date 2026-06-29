import type OpenAI from "openai"

const SWITCH_MODE_DESCRIPTION = `请求切换到不同的模式。此工具允许模式在需要时请求切换到另一个模式，例如切换到 Code 模式进行代码修改。用户必须批准模式切换。`

const MODE_SLUG_PARAMETER_DESCRIPTION = `要切换到的模式 slug（例如 code、ask、architect）`

const REASON_PARAMETER_DESCRIPTION = `为什么需要模式切换的解释说明`

export default {
	type: "function",
	function: {
		name: "switch_mode",
		description: SWITCH_MODE_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				mode_slug: {
					type: "string",
					description: MODE_SLUG_PARAMETER_DESCRIPTION,
				},
				reason: {
					type: "string",
					description: REASON_PARAMETER_DESCRIPTION,
				},
			},
			required: ["mode_slug", "reason"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
