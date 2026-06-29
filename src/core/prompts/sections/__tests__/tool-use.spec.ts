import { getSharedToolUseSection } from "../tool-use"

describe("getSharedToolUseSection", () => {
	it("应该包含原生工具调用说明", () => {
		const section = getSharedToolUseSection()

		expect(section).toContain("提供商原生的工具调用机制")
		expect(section).toContain("不要包含 XML 标记或示例")
	})

	it("应该包含每条消息使用多个工具的指导", () => {
		const section = getSharedToolUseSection()

		expect(section).toContain("你必须在每个助手响应中至少调用一个工具")
		expect(section).toContain("优先在单次响应中调用尽可能多的合理需要的工具")
	})

	it("不应包含每条消息限制单个工具的限制", () => {
		const section = getSharedToolUseSection()

		expect(section).not.toContain("You must use exactly one tool call per assistant response")
		expect(section).not.toContain("Do not call zero tools or more than one tool")
	})

	it("不应包含 XML 格式说明", () => {
		const section = getSharedToolUseSection()

		expect(section).not.toContain("<actual_tool_name>")
		expect(section).not.toContain("</actual_tool_name>")
	})
})
