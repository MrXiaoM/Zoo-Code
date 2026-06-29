import { getToolUseGuidelinesSection } from "../tool-use-guidelines"

describe("getToolUseGuidelinesSection", () => {
	it("应该包含正确的编号指南", () => {
		const guidelines = getToolUseGuidelinesSection()

		expect(guidelines).toContain("1. 评估你已经拥有什么信息")
		expect(guidelines).toContain("2. 根据任务和提供的工具描述选择最合适的工具")
		expect(guidelines).toContain("3. 如果需要多个操作")
	})

	it("应该包含多条消息使用工具的指导", () => {
		const guidelines = getToolUseGuidelinesSection()

		expect(guidelines).toContain("在单条消息中使用多个工具")
		expect(guidelines).not.toContain("use one tool at a time per message")
	})

	it("应该使用简化的页脚，不使用逐步语言", () => {
		const guidelines = getToolUseGuidelinesSection()

		expect(guidelines).toContain("仔细考虑用户在工具执行后的响应")
		expect(guidelines).not.toContain("It is crucial to proceed step-by-step")
		expect(guidelines).not.toContain("ALWAYS wait for user confirmation after each tool use")
	})

	it("应该包含通用指导", () => {
		const guidelines = getToolUseGuidelinesSection()
		expect(guidelines).toContain("评估你已经拥有什么信息")
		expect(guidelines).toContain("选择最合适的工具")
		expect(guidelines).not.toContain("<actual_tool_name>")
	})

	it("不应包含每个工具确认的指南", () => {
		const guidelines = getToolUseGuidelinesSection()

		expect(guidelines).not.toContain("After each tool use, the user will respond with the result")
	})
})
