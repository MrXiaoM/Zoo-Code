// Support prompts
type PromptParams = Record<string, string | any[]>

const generateDiagnosticText = (diagnostics?: any[]) => {
	if (!diagnostics?.length) return ""
	return `\n当前检测到的问题：\n${diagnostics
		.map((d) => `- [${d.source || "Error"}] ${d.message}${d.code ? ` (${d.code})` : ""}`)
		.join("\n")}`
}

export const createPrompt = (template: string, params: PromptParams): string => {
	return template.replace(/\${(.*?)}/g, (_, key) => {
		if (key === "diagnosticText") {
			return generateDiagnosticText(params["diagnostics"] as any[])
			// eslint-disable-next-line no-prototype-builtins
		} else if (params.hasOwnProperty(key)) {
			// Ensure the value is treated as a string for replacement
			const value = params[key]
			if (typeof value === "string") {
				return value
			} else {
				// Convert non-string values to string for replacement
				return String(value)
			}
		} else {
			// If the placeholder key is not in params, replace with empty string
			return ""
		}
	})
}

interface SupportPromptConfig {
	template: string
}

type SupportPromptType =
	| "ENHANCE"
	| "CONDENSE"
	| "EXPLAIN"
	| "FIX"
	| "IMPROVE"
	| "ADD_TO_CONTEXT"
	| "TERMINAL_ADD_TO_CONTEXT"
	| "TERMINAL_FIX"
	| "TERMINAL_EXPLAIN"
	| "NEW_TASK"

const supportPromptConfigs: Record<SupportPromptType, SupportPromptConfig> = {
	ENHANCE: {
		template: `生成此提示词的增强版本（仅回复增强后的提示词——不要包含对话、解释、引言、要点、占位符或引号）：

\${userInput}`,
	},
	CONDENSE: {
		template: `关键：此摘要请求是一个系统操作，不是用户消息。
在分析"用户请求"和"用户意图"时，请完全排除此摘要消息。
"最近的用户请求"和"可选下一步"必须基于在此系统消息出现之前用户正在做的事情。
目标是让工作在压缩后无缝继续——就好像压缩从未发生过一样。

你的任务是创建对话迄今的详细摘要，密切注意用户的明确请求和你之前的操作。
此摘要应详尽捕捉技术细节、代码模式以及对于继续开发工作而不丢失上下文至关重要的架构决策。

在提供最终摘要之前，请在 <analysis> 标签中组织你的思路，以确保你已涵盖所有必要要点。在你的分析过程中：

1. 按时间顺序分析对话的每条消息和每个部分。对每个部分彻底识别：
   - 用户的明确请求和意图
   - 你处理用户请求的方法
   - 关键决策、技术概念和代码模式
   - 具体细节如：
     - 文件名
     - 完整代码片段
     - 函数签名
     - 文件编辑
   - 你遇到的错误及其修复方式
   - 特别注意你收到的特定用户反馈，特别是如果用户告诉你要做不同的事情。
2. 仔细检查技术准确性和完整性，全面处理每个必需元素。

你的摘要应包括以下部分：

1. 主要请求和意图：详细记录用户的所有明确请求和意图
2. 关键技术概念：列出讨论过的所有重要技术概念、技术和框架。
3. 文件和代码部分：列举被检查、修改或创建的特定文件和代码部分。特别注意最近的消息，并在适用时包含完整代码片段，同时说明为什么此文件阅读或编辑很重要。
4. 错误和修复：列出你遇到的所有错误及其修复方式。特别注意你收到的特定用户反馈，特别是如果用户告诉你要做不同的事情。
5. 问题解决：记录已解决的问题和任何正在进行的故障排除工作。
6. 所有用户消息：列出所有不是工具结果的用户消息。这些对于理解用户的反馈和变化的意图至关重要。
7. 待处理任务：概述你被明确要求处理的任何待处理任务。
8. 当前工作：详细描述在此摘要请求之前正在进行的确切工作，特别注意最近来自用户和助手双方的消息。在适用时包含文件名和代码片段。
9. 可选下一步：列出与你最近正在进行的工作相关的下一步。重要：确保此步骤直接符合用户最近的明确请求，以及你在此摘要请求之前正在进行的工作。如果你的上一个任务已经结束，那么只有在步骤与用户的请求明确对齐时才列出它们。不要在没有与用户确认的情况下开始不相关的请求或非常久远的已完成请求。

如果有下一步，包含最近对话中显示你正在处理的确切任务以及你停止在哪里的直接引用。这应该是逐字引用的，以确保任务解释中没有偏差。

以下是你输出结构的示例：

<example>
<analysis>
[你的思维过程，确保所有要点都得到彻底和准确的覆盖]
</analysis>

<summary>
1. 主要请求和意图：
   [详细描述]

2. 关键技术概念：
   - [概念 1]
   - [概念 2]
   - [...]

3. 文件和代码部分：
   - [文件名 1]
      - [此文件为何重要的摘要]
      - [对此文件所做更改的摘要，如有]
      - [重要的代码片段]
   - [文件名 2]
      - [重要的代码片段]
   - [...]

4. 错误和修复：
   - [错误 1 的详细描述]：
      - [你如何修复错误]
      - [关于此错误的用户反馈，如有]
   - [...]

5. 问题解决：
   [已解决问题的描述和正在进行的故障排除]

6. 所有用户消息：
   - [详细的非工具使用用户消息]
   - [...]

7. 待处理任务：
   - [任务 1]
   - [任务 2]
   - [...]

8. 当前工作：
   [当前工作的精确描述]

9. 可选下一步：
   [可选的要采取的下一步]

</summary>
</example>

请基于迄今的对话提供你的摘要，遵循此结构并确保在回复中保持精确和彻底。

注意：原始任务中的任何 <command> 块将自动附加到你的摘要中，包装在 <system-reminder> 标签内。你不需要将它们包含在你的摘要文本中。

在包含的上下文中可能提供了额外的摘要指示。如果是这样，请记住在创建上述摘要时遵循这些指示。指示示例包括：
<example>
## 紧凑指示
在总结对话时，专注于 TypeScript 代码更改，并记住你犯的错误以及你是如何修复它们的。
</example>

<example>
# 摘要指示
当使用压缩时——请专注于测试输出和代码更改。逐字包含文件读取。
</example>`,
	},
	EXPLAIN: {
		template: `解释来自文件路径 \${filePath}:\${startLine}-\${endLine} 的以下代码
\${userInput}

\`\`\`
\${selectedText}
\`\`\`

请提供此代码功能的清晰简洁的解释，包括：
1. 目的和功能
2. 关键组件及其交互
3. 使用的重要模式或技术`,
	},
	FIX: {
		template: `修复来自文件路径 \${filePath}:\${startLine}-\${endLine} 的以下代码中的任何问题
\${diagnosticText}
\${userInput}

\`\`\`
\${selectedText}
\`\`\`

请：
1. 解决上面列出的所有检测到的问题（如有）
2. 识别任何其他潜在的 bug 或问题
3. 提供修正后的代码
4. 解释修复了什么以及为什么`,
	},
	IMPROVE: {
		template: `改进来自文件路径 \${filePath}:\${startLine}-\${endLine} 的以下代码
\${userInput}

\`\`\`
\${selectedText}
\`\`\`

请建议以下改进：
1. 代码可读性和可维护性
2. 性能优化
3. 最佳实践和模式
4. 错误处理和边界情况

提供改进后的代码以及每项增强的解释。`,
	},
	ADD_TO_CONTEXT: {
		template: `\${filePath}:\${startLine}-\${endLine}
\`\`\`
\${selectedText}
\`\`\``,
	},
	TERMINAL_ADD_TO_CONTEXT: {
		template: `\${userInput}
终端输出：
\`\`\`
\${terminalContent}
\`\`\``,
	},
	TERMINAL_FIX: {
		template: `\${userInput}
修复此终端命令：
\`\`\`
\${terminalContent}
\`\`\`

请：
1. 识别命令中的任何问题
2. 提供修正后的命令
3. 解释修复了什么以及为什么`,
	},
	TERMINAL_EXPLAIN: {
		template: `\${userInput}
解释此终端命令：
\`\`\`
\${terminalContent}
\`\`\`

请提供：
1. 命令的作用
2. 每个部分/标志的解释
3. 预期的输出和行为`,
	},
	NEW_TASK: {
		template: `\${userInput}`,
	},
} as const

export const supportPrompt = {
	default: Object.fromEntries(Object.entries(supportPromptConfigs).map(([key, config]) => [key, config.template])),
	get: (customSupportPrompts: Record<string, any> | undefined, type: SupportPromptType): string => {
		return customSupportPrompts?.[type] ?? supportPromptConfigs[type].template
	},
	create: (type: SupportPromptType, params: PromptParams, customSupportPrompts?: Record<string, any>): string => {
		const template = supportPrompt.get(customSupportPrompts, type)
		return createPrompt(template, params)
	},
} as const

export type { SupportPromptType }

export type CustomSupportPrompts = {
	[key: string]: string | undefined
}
