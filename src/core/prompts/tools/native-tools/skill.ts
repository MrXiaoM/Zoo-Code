import type OpenAI from "openai"

const SKILL_DESCRIPTION = `按名称加载并执行一个技能。技能为诸如创建 MCP 服务器或自定义模式等常见任务提供专门的指令。

当你需要遵循技能中记录的特定流程时使用此工具。可用技能列在系统提示的 AVAILABLE SKILLS 部分中。`

const SKILL_PARAMETER_DESCRIPTION = `要加载的技能名称（例如 create-mcp-server、create-mode）。必须与可用技能列表中的技能名称匹配。`

const ARGS_PARAMETER_DESCRIPTION = `传递给技能的可选上下文或参数`

export default {
	type: "function",
	function: {
		name: "skill",
		description: SKILL_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				skill: {
					type: "string",
					description: SKILL_PARAMETER_DESCRIPTION,
				},
				args: {
					type: ["string", "null"],
					description: ARGS_PARAMETER_DESCRIPTION,
				},
			},
			required: ["skill", "args"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
