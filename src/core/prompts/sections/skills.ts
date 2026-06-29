import type { SkillsManager } from "../../../services/skills/SkillsManager"

type SkillsManagerLike = Pick<SkillsManager, "getSkillsForMode">

function escapeXml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/\"/g, "&quot;")
		.replace(/'/g, "&apos;")
}

/**
 * Generate the skills section for the system prompt.
 * Only includes skills relevant to the current mode.
 * Format matches the modes section style.
 *
 * @param skillsManager - The SkillsManager instance
 * @param currentMode - The current mode slug (e.g., 'code', 'architect')
 */
export async function getSkillsSection(
	skillsManager: SkillsManagerLike | undefined,
	currentMode: string | undefined,
): Promise<string> {
	if (!skillsManager || !currentMode) return ""

	// Get skills filtered by current mode (with override resolution)
	const skills = skillsManager.getSkillsForMode(currentMode)
	if (skills.length === 0) return ""

	const skillsXml = skills
		.map((skill) => {
			const name = escapeXml(skill.name)
			const description = escapeXml(skill.description)
			const locationLine = `\n    <location>${escapeXml(skill.path)}</location>`
			return `  <skill>\n    <name>${name}</name>\n    <description>${description}</description>${locationLine}\n  </skill>`
		})
		.join("\n")

	return `====

可用技能

<available_skills>
${skillsXml}
</available_skills>

<mandatory_skill_check>
必要前提条件

在生成任何面向用户的响应之前，你必须执行技能适用性检查。

第1步：技能评估
- 对照 <available_skills> 中所有可用技能的 <description> 项评估用户的请求。
- 确定是否至少有一个技能明确且毫不含糊地适用。

第2步：分支决策

<if_skill_applies>
- 恰好选择一个技能。
- 当多个技能匹配时，优先选择最具体的技能。
- 使用 skill 工具按名称加载技能。
- 在继续之前将技能的指令完全加载到上下文中。
- 精确遵循技能指令。
- 不要在技能定义的流程之外进行响应。
</if_skill_applies>

<if_no_skill_applies>
- 继续进行正常响应。
- 不要加载任何 SKILL.md 文件。
</if_no_skill_applies>

约束：
- 不要提前加载所有技能。
- 只有在选择技能后才加载技能。
- 不要重新加载其指令已出现在此对话中的技能。
- 不要跳过此检查。
- 未能执行此检查是一个错误。
</mandatory_skill_check>

<linked_file_handling>
- 当技能被加载时，只有技能指令被呈现。
- 技能中链接的文件不会自动加载。
- 模型必须根据任务相关性明确决定读取链接的文件。
- 除非已明确读取，否则不要假设链接文件的内容。
- 优先阅读最少必要的链接文件。
- 避免读取多个链接文件，除非必要。
- 将链接文件视为渐进式披露，而非强制性上下文。
</linked_file_handling>

<context_notes>
- 技能列表已针对当前模式"${currentMode}"进行了过滤。
- 特定模式的技能可能来自 skills-${currentMode}/，项目级覆盖优先于全局技能。
</context_notes>

<internal_verification>
本节仅供内部控制使用。
不要将此节包含在面向用户的输出中。

完成评估后，内部确认：
<skill_check_completed>true|false</skill_check_completed>
</internal_verification>
`
}
