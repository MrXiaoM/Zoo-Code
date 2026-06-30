import os from "os"

// Mock the modules - must be hoisted before imports
vi.mock("os-name", () => ({
	default: vi.fn(),
}))

vi.mock("../../../../utils/shell", () => ({
	getShellContext: vi.fn(() => ({
		shellPath: "/bin/bash",
		family: "posix",
		pathStyle: "posix",
		commandChainOperator: "&&",
		avoidShellWrapper:
			"不要为了执行普通命令而包一层 cmd.exe/PowerShell；除非用户明确要求跨 Shell 执行，否则直接使用当前 Shell 语法。",
	})),
}))

import { getSystemInfoSection } from "../system-info"
import osName from "os-name"

const mockOsName = osName as unknown as ReturnType<typeof vi.fn>

describe("getSystemInfoSection", () => {
	const mockCwd = "/test/workspace"
	const mockHomeDir = "/home/user"

	beforeEach(() => {
		vi.spyOn(os, "homedir").mockReturnValue(mockHomeDir)
		vi.spyOn(os, "platform").mockReturnValue("linux" as any)
		vi.spyOn(os, "release").mockReturnValue("5.15.0")
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	it("当 os-name 可用时应返回系统信息", () => {
		mockOsName.mockReturnValue("Ubuntu 22.04")

		const result = getSystemInfoSection(mockCwd)

		expect(result).toContain("操作系统：Ubuntu 22.04")
		expect(result).toContain("默认 Shell：/bin/bash")
		expect(result).toContain("命令执行 Shell：/bin/bash")
		expect(result).toContain("命令 Shell 类型：posix")
		expect(result).toContain("Shell 路径风格：posix")
		expect(result).toContain("Shell 命令链接符：&&")
		expect(result).toContain(`主目录：${mockHomeDir}`)
		expect(result).toContain(`当前工作区目录：${mockCwd}`)
	})

	it("当 os-name 抛出错误时应回退到 platform 和 release", () => {
		mockOsName.mockImplementation(() => {
			throw new Error("Command failed with ENOENT: powershell")
		})

		const result = getSystemInfoSection(mockCwd)

		expect(result).toContain("操作系统：linux 5.15.0")
		expect(result).toContain("默认 Shell：/bin/bash")
		expect(result).toContain(`主目录：${mockHomeDir}`)
		expect(result).toContain(`当前工作区目录：${mockCwd}`)
	})

	it("应在回退中处理 Windows 平台", () => {
		mockOsName.mockImplementation(() => {
			throw new Error("Command failed with ENOENT: powershell")
		})
		vi.spyOn(os, "platform").mockReturnValue("win32" as any)
		vi.spyOn(os, "release").mockReturnValue("10.0.19043")

		const result = getSystemInfoSection(mockCwd)

		expect(result).toContain("操作系统：win32 10.0.19043")
	})
})
