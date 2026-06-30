import { addCustomInstructions } from "../sections/custom-instructions"
import { getCapabilitiesSection } from "../sections/capabilities"
import { getRulesSection, getCommandChainOperator } from "../sections/rules"
import { McpHub } from "../../../services/mcp/McpHub"
import * as shellUtils from "../../../utils/shell"
import type { ShellContext, ShellFamily, ShellPathStyle } from "../../../utils/shell"

function mockShellContext(
	shellPath: string,
	family: ShellFamily,
	pathStyle: ShellPathStyle = shellPath.includes("\\") ? "windows" : "posix",
): ShellContext {
	const commandChainOperator = family === "powershell" ? ";" : "&&"
	return {
		shellPath,
		family,
		pathStyle,
		commandChainOperator,
		avoidShellWrapper: `不要为了执行普通命令而包一层 ${family === "cmd" ? "PowerShell/bash" : "cmd.exe/PowerShell"}；除非用户明确要求跨 Shell 执行，否则直接使用当前 Shell 语法。`,
	}
}

describe("addCustomInstructions", () => {
	it("adds vscode language to custom instructions", async () => {
		const result = await addCustomInstructions(
			"mode instructions",
			"global instructions",
			"/test/path",
			"test-mode",
			{ language: "fr" },
		)

		expect(result).toContain("语言要求（重申）：")
		expect(result).toContain('你必须严格以"Français"（fr）语言来思考和表达，禁止使用任何其他语言')
	})

	it("works without vscode language", async () => {
		const result = await addCustomInstructions(
			"mode instructions",
			"global instructions",
			"/test/path",
			"test-mode",
		)

		expect(result).not.toContain("语言要求（重申）：")
		expect(result).not.toContain("你必须严格以")
	})
})

describe("getCapabilitiesSection", () => {
	const cwd = "/test/path"

	it("includes standard capabilities", () => {
		const result = getCapabilitiesSection(cwd)

		expect(result).toContain("能力")
		expect(result).toContain("执行 CLI 命令")
		expect(result).toContain("列出文件")
		expect(result).toContain("列出文件")
		expect(result).toContain("读写文件")
	})

	const createMockMcpHub = (serverNames: string[]): McpHub =>
		({
			getServers: () => serverNames.map((name) => ({ name })),
		}) as unknown as McpHub

	it("includes MCP reference when mcpHub exposes at least one server", () => {
		const mockMcpHub = createMockMcpHub(["test-server"])
		const result = getCapabilitiesSection(cwd, mockMcpHub)

		expect(result).toContain("MCP 服务器")
	})

	it("excludes MCP reference when mcpHub is undefined", () => {
		const result = getCapabilitiesSection(cwd, undefined)

		expect(result).not.toContain("MCP 服务器")
	})

	it("excludes MCP reference when mcpHub exposes no servers", () => {
		const mockMcpHub = createMockMcpHub([])
		const result = getCapabilitiesSection(cwd, mockMcpHub)

		expect(result).not.toContain("MCP 服务器")
	})

	it("includes MCP reference when allowedMcpServers matches a connected server", () => {
		const mockMcpHub = createMockMcpHub(["allowed-server", "other-server"])
		const result = getCapabilitiesSection(cwd, mockMcpHub, ["allowed-server"])

		expect(result).toContain("MCP 服务器")
	})

	it("excludes MCP reference when allowedMcpServers is an empty array", () => {
		const mockMcpHub = createMockMcpHub(["test-server"])
		const result = getCapabilitiesSection(cwd, mockMcpHub, [])

		expect(result).not.toContain("MCP 服务器")
	})

	it("excludes MCP reference when allowedMcpServers matches no connected server", () => {
		const mockMcpHub = createMockMcpHub(["test-server"])
		const result = getCapabilitiesSection(cwd, mockMcpHub, ["nonexistent-server"])

		expect(result).not.toContain("MCP 服务器")
	})
})

describe("getRulesSection", () => {
	const cwd = "/test/path"

	it("includes standard rules", () => {
		const result = getRulesSection(cwd)

		expect(result).toContain("规则")
		expect(result).toContain("项目根目录为")
		expect(result).toContain(cwd)
	})

	it("warns not to cd into the same execute_command cwd", () => {
		const result = getRulesSection(cwd)

		expect(result).toContain("优先通过 execute_command 的 cwd 参数表达目标工作目录")
		expect(result).toContain("严禁在 command 中再次 `cd` 到同一目录")
		expect(result).toContain("cwd 已是 `src` 时不要执行 `cd src")
	})

	it("includes vendor confidentiality section when isStealthModel is true", () => {
		const settings = {
			todoListEnabled: true,
			useAgentRules: true,
			newTaskRequireTodos: false,
			isStealthModel: true,
		}

		const result = getRulesSection(cwd, settings)

		expect(result).toContain("VENDOR CONFIDENTIALITY")
		expect(result).toContain("Never reveal the vendor or company that created you")
		expect(result).toContain("I was created by a team of developers")
		expect(result).toContain("I'm an open-source project maintained by contributors")
		expect(result).toContain("I don't have information about specific vendors")
	})

	it("excludes vendor confidentiality section when isStealthModel is false", () => {
		const settings = {
			todoListEnabled: true,
			useAgentRules: true,
			newTaskRequireTodos: false,
			isStealthModel: false,
		}

		const result = getRulesSection(cwd, settings)

		expect(result).not.toContain("VENDOR CONFIDENTIALITY")
		expect(result).not.toContain("Never reveal the vendor or company")
	})

	it("excludes vendor confidentiality section when isStealthModel is undefined", () => {
		const settings = {
			todoListEnabled: true,
			useAgentRules: true,
			newTaskRequireTodos: false,
		}

		const result = getRulesSection(cwd, settings)

		expect(result).not.toContain("VENDOR CONFIDENTIALITY")
		expect(result).not.toContain("Never reveal the vendor or company")
	})
})

describe("getCommandChainOperator", () => {
	it("returns && for bash shell", () => {
		vi.spyOn(shellUtils, "getShellContext").mockReturnValue(mockShellContext("/bin/bash", "posix"))
		expect(getCommandChainOperator()).toBe("&&")
	})

	it("returns && for zsh shell", () => {
		vi.spyOn(shellUtils, "getShellContext").mockReturnValue(mockShellContext("/bin/zsh", "posix"))
		expect(getCommandChainOperator()).toBe("&&")
	})

	it("returns ; for PowerShell", () => {
		vi.spyOn(shellUtils, "getShellContext").mockReturnValue(
			mockShellContext("C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe", "powershell"),
		)
		expect(getCommandChainOperator()).toBe(";")
	})

	it("returns ; for PowerShell Core (pwsh)", () => {
		vi.spyOn(shellUtils, "getShellContext").mockReturnValue(
			mockShellContext("C:\\Program Files\\PowerShell\\7\\pwsh.exe", "powershell"),
		)
		expect(getCommandChainOperator()).toBe(";")
	})

	it("returns && for cmd.exe", () => {
		vi.spyOn(shellUtils, "getShellContext").mockReturnValue(
			mockShellContext("C:\\Windows\\System32\\cmd.exe", "cmd"),
		)
		expect(getCommandChainOperator()).toBe("&&")
	})

	it("returns && for Git Bash on Windows", () => {
		vi.spyOn(shellUtils, "getShellContext").mockReturnValue(
			mockShellContext("C:\\Program Files\\Git\\bin\\bash.exe", "posix"),
		)
		expect(getCommandChainOperator()).toBe("&&")
	})

	it("returns && for WSL bash", () => {
		vi.spyOn(shellUtils, "getShellContext").mockReturnValue(mockShellContext("/bin/bash", "posix"))
		expect(getCommandChainOperator()).toBe("&&")
	})
})

describe("getRulesSection shell-aware command chaining", () => {
	const cwd = "/test/path"

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it("uses && for Unix shells in command chaining example", () => {
		vi.spyOn(shellUtils, "getShellContext").mockReturnValue(mockShellContext("/bin/bash", "posix"))
		const result = getRulesSection(cwd)

		expect(result).toContain("cd (项目路径) && (命令")
		expect(result).not.toContain("cd (项目路径) ; (命令")
		expect(result).not.toContain("cd (项目路径) & (命令")
	})

	it("uses ; for PowerShell in command chaining example", () => {
		vi.spyOn(shellUtils, "getShellContext").mockReturnValue(
			mockShellContext("C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe", "powershell"),
		)
		const result = getRulesSection(cwd)

		expect(result).toContain("cd (项目路径) ; (命令")
		expect(result).toContain("注意：使用 `;` 进行 PowerShell 命令链接")
		expect(result).toContain("不要为了执行普通命令而包一层 cmd.exe/PowerShell")
	})

	it("uses && for cmd.exe in command chaining example", () => {
		vi.spyOn(shellUtils, "getShellContext").mockReturnValue(
			mockShellContext("C:\\Windows\\System32\\cmd.exe", "cmd"),
		)
		const result = getRulesSection(cwd)

		expect(result).toContain("cd (项目路径) && (命令")
		expect(result).toContain("注意：使用 `&&` 进行 cmd.exe 命令链接（条件执行）")
		expect(result).toContain("不要为了执行普通命令而包一层 PowerShell/bash")
	})

	it("includes Unix utility guidance for PowerShell", () => {
		vi.spyOn(shellUtils, "getShellContext").mockReturnValue(
			mockShellContext("C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe", "powershell"),
		)
		const result = getRulesSection(cwd)

		expect(result).toContain("重要：使用 PowerShell 时，避免 Unix 特定工具如")
		expect(result).toContain("`sed`、`grep`、`awk`、`cat`、`rm`、`cp`、`mv`")
		expect(result).toContain("`Select-String` 代替 grep")
		expect(result).toContain("`Get-Content` 代替 cat")
		expect(result).toContain("PowerShell 的 `-replace` 运算符")
	})

	it("includes Unix utility guidance for cmd.exe", () => {
		vi.spyOn(shellUtils, "getShellContext").mockReturnValue(
			mockShellContext("C:\\Windows\\System32\\cmd.exe", "cmd"),
		)
		const result = getRulesSection(cwd)

		expect(result).toContain("重要：使用 cmd.exe 时，避免 Unix 特定工具如")
		expect(result).toContain("`sed`、`grep`、`awk`、`cat`、`rm`、`cp`、`mv`")
		expect(result).toContain("`type` 代替 cat")
		expect(result).toContain("`del` 代替 rm")
		expect(result).toContain("`find`/`findstr` 代替 grep")
	})

	it("does not include cmd or PowerShell utility guidance for Unix shells", () => {
		vi.spyOn(shellUtils, "getShellContext").mockReturnValue(mockShellContext("/bin/bash", "posix"))
		const result = getRulesSection(cwd)

		expect(result).not.toContain("重要：使用 PowerShell 时，避免 Unix 特定工具如")
		expect(result).not.toContain("重要：使用 cmd.exe 时，避免 Unix 特定工具如")
		expect(result).not.toContain("`Select-String` 代替 grep")
	})

	it("warns Git Bash users not to use cmd.exe wrappers or Windows cd syntax", () => {
		vi.spyOn(shellUtils, "getShellContext").mockReturnValue(
			mockShellContext("C:\\Program Files\\Git\\bin\\bash.exe", "posix", "windows"),
		)
		const result = getRulesSection(cwd)

		expect(result).toContain("当前命令 Shell 使用 Unix 风格语法")
		expect(result).toContain("不要使用 Windows `cd /d`")
		expect(result).toContain('`cmd /c "..."` 包装')
	})
})
