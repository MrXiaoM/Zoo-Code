import { getObjectiveSection } from "../objective"

describe("getObjectiveSection", () => {
	it("应该包含正确的编号结构", () => {
		const objective = getObjectiveSection()

		// 检查所有编号项都存在
		expect(objective).toContain("1. 分析用户的任务")
		expect(objective).toContain("2. 按顺序执行这些目标")
		expect(objective).toContain("3. 请记住，你拥有广泛的能力")
		expect(objective).toContain("4. 完成用户的任务后")
		expect(objective).toContain("5. 用户可能会提供反馈")
	})

	it("应该包含分析指导", () => {
		const objective = getObjectiveSection()

		expect(objective).toContain("在调用工具之前，先做一些分析")
		expect(objective).toContain("分析 environment_details 中提供的文件结构")
		expect(objective).toContain("思考提供的工具中哪个是最相关的工具")
	})

	it("应该包含参数推断指导", () => {
		const objective = getObjectiveSection()

		expect(objective).toContain("遍历相关工具的每个必需参数")
		expect(objective).toContain("确定用户是否直接提供了足够的信息来推断值")
		expect(objective).toContain("不要调用该工具（即使使用占位符填充缺失参数也不行）")
		expect(objective).toContain("ask_followup_question 工具")
	})

	it("应该包含不要进行无意义来回对话的指导", () => {
		const objective = getObjectiveSection()

		expect(objective).toContain("不要继续进行无意义的来回对话")
		expect(objective).toContain("不要以问题或提供进一步帮助来结束你的响应")
	})

	it("应该包含 OBJECTIVE 头部", () => {
		const objective = getObjectiveSection()

		expect(objective).toContain("目标")
		expect(objective).toContain("你以迭代的方式完成给定的任务")
	})
})
