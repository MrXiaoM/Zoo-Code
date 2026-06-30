import os from "os"
import osName from "os-name"

import { getShellContext } from "../../../utils/shell"

export function getSystemInfoSection(cwd: string): string {
	// Try to get detailed OS name, fall back to basic info if it fails
	let osInfo: string
	try {
		osInfo = osName()
	} catch (error) {
		// Fallback when os-name fails (e.g., PowerShell not available on Windows)
		const platform = os.platform()
		const release = os.release()
		osInfo = `${platform} ${release}`
	}

	const shellContext = getShellContext()

	const details = `====

系统信息

操作系统：${osInfo}
默认 Shell：${shellContext.shellPath}
命令执行 Shell：${shellContext.shellPath}
命令 Shell 类型：${shellContext.family}
Shell 路径风格：${shellContext.pathStyle}
Shell 命令链接符：${shellContext.commandChainOperator}
主目录：${os.homedir().toPosix()}
当前工作区目录：${cwd.toPosix()}

当前工作区目录是活动的 VS Code 项目目录，因此是所有工具操作的默认目录。新的终端将在当前工作区目录中创建，但是如果你在终端中切换目录，它将有一个不同的工作目录；在终端中切换目录不会修改工作区目录，因为你没有权限修改工作区目录。当用户最初给你一个任务时，当前工作区目录（'/test/path'）中所有文件路径的递归列表将包含在 environment_details 中。这提供了项目文件结构的概览，通过目录/文件名（开发者如何概念化和组织其代码）和文件扩展名（使用的语言）提供了关键洞察。这也可以指导决定进一步探索哪些文件。如果你需要进一步探索当前工作区目录之外的目录，可以使用 list_files 工具。如果你为 recursive 参数传递 'true'，它将递归列出文件。否则，它将仅列出顶层内容，这更适合通用目录，比如桌面，你不需要嵌套结构。`

	return details
}
