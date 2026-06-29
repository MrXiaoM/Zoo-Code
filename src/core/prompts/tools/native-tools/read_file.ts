import type OpenAI from "openai"

// ─── Constants ────────────────────────────────────────────────────────────────

/** Default maximum lines to return per file (Codex-inspired predictable limit) */
export const DEFAULT_LINE_LIMIT = 2000

/** Maximum characters per line before truncation */
export const MAX_LINE_LENGTH = 2000

/** Default indentation levels to include above anchor (0 = unlimited) */
export const DEFAULT_MAX_LEVELS = 0

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Generates the file support note, optionally including image format support.
 *
 * @param supportsImages - Whether the model supports image processing
 * @returns Support note string
 */
function getReadFileSupportsNote(supportsImages: boolean): string {
	if (supportsImages) {
		return `Supports text extraction from PDF and DOCX files. Automatically processes and returns image files (PNG, JPG, JPEG, GIF, BMP, SVG, WEBP, ICO, AVIF) for visual analysis. May not handle other binary files properly.`
	}
	return `Supports text extraction from PDF and DOCX files, but may not handle other binary files properly.`
}

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Options for creating the read_file tool definition.
 */
export interface ReadFileToolOptions {
	/** Whether the model supports image processing (default: false) */
	supportsImages?: boolean
}

// ─── Schema Builder ───────────────────────────────────────────────────────────

/**
 * Creates the read_file tool definition with Codex-inspired modes.
 *
 * Two reading modes are supported:
 *
 * 1. **Slice Mode** (default): Simple offset/limit reading
 *    - Reads contiguous lines starting from `offset` (1-based, default: 1)
 *    - Limited to `limit` lines (default: 2000)
 *    - Predictable and efficient for agent planning
 *
 * 2. **Indentation Mode**: Semantic code block extraction
 *    - Anchored on a specific line number (1-based)
 *    - Extracts the block containing that line plus context
 *    - Respects code structure based on indentation hierarchy
 *    - Useful for extracting functions, classes, or logical blocks
 *
 * @param options - Configuration options for the tool
 * @returns Native tool definition for read_file
 */
export function createReadFileTool(options: ReadFileToolOptions = {}): OpenAI.Chat.ChatCompletionTool {
	const { supportsImages = false } = options

	// Build description based on capabilities
	const descriptionIntro =
		"读取文件并返回带有行号的内容，用于 diff 或讨论。重要：此工具每次调用只读取一个文件。如果你需要多个文件，请发出多个并行的 read_file 调用。"

	const modeDescription =
		` 支持两种模式：'slice'（默认）按顺序读取行，使用 offset/limit；'indentation' 基于缩进层级提取锚点行周围的完整语义代码块。` +
		` Slice 模式非常适合初始文件探索、理解整体结构、读取配置/数据文件，或者当你需要特定行范围时。在你没有目标行号时使用它。` +
		` 当你从搜索结果、错误消息或定义查找中获得特定行号时，优先使用 indentation 模式——它保证返回完整、语法有效的代码块，不会在函数中间截断。` +
		` 重要：Indentation 模式需要 anchor_line 才能发挥作用。没有它，只会返回头部内容（导入语句）。`

	const limitNote = ` 默认情况下，每个文件最多返回 ${DEFAULT_LINE_LIMIT} 行。超过 ${MAX_LINE_LENGTH} 个字符的行会被截断。`

	const description =
		descriptionIntro +
		modeDescription +
		limitNote +
		" " +
		getReadFileSupportsNote(supportsImages) +
		` 示例：{ path: 'src/app.ts' }` +
		` 示例（indentation 模式）：{ path: 'src/app.ts', mode: 'indentation', indentation: { anchor_line: 42 } }`

	const indentationProperties: Record<string, unknown> = {
		anchor_line: {
			type: "integer",
			description:
				"1-based 的行号，用于锚定提取。有意义的 indentation 模式结果必需此项。提取器会找到包含该行的语义块（函数、方法、类），并将其完整返回。没有 anchor_line 时，indentation 模式默认从第 1 行开始，只返回导入/头部内容。从以下来源获取 anchor_line：搜索结果、错误堆栈跟踪、定义查找、codebase_search 结果或压缩的文件摘要（例如 '14--28 | export class UserService' 表示 anchor_line=14）。",
		},
		max_levels: {
			type: "integer",
			description: `在锚点之上包含的最大缩进层级（indentation 模式，0 = 无限制（默认））。值越高包含的父上下文越多。`,
		},
		include_siblings: {
			type: "boolean",
			description:
				"包含与锚点块处于同一缩进级别的兄弟块（indentation 模式，默认：false）。用于查看类中的关联方法。",
		},
		include_header: {
			type: "boolean",
			description: "在输出顶部包含文件头部内容（导入、模块级注释）（indentation 模式，默认：true）。",
		},
		max_lines: {
			type: "integer",
			description: "indentation 模式返回行数的硬性上限。作为顶层 'limit' 参数的独立限制。",
		},
	}

	const properties: Record<string, unknown> = {
		path: {
			type: "string",
			description: "要读取的文件路径，相对于工作区",
		},
		mode: {
			type: "string",
			enum: ["slice", "indentation"],
			description:
				"读取模式。'slice'（默认）：使用 offset/limit 按顺序读取行——用于一般文件探索或当你没有目标行号时（可能会在函数中间截断代码）。'indentation'：提取包含 anchor_line 的完整语义代码块——当你有行号时优先使用，因为它保证返回完整、有效的代码块。警告：不要在不指定 indentation.anchor_line 的情况下使用 indentation 模式，否则你只会得到头部内容。",
		},
		offset: {
			type: "integer",
			description: "1-based 行偏移量，从该行开始读取（slice 模式，默认：1）",
		},
		limit: {
			type: "integer",
			description: `返回的最大行数（slice 模式，默认：${DEFAULT_LINE_LIMIT}）`,
		},
		indentation: {
			type: "object",
			description:
				"Indentation 模式选项。仅在 mode='indentation' 时使用。你必须指定 anchor_line 以获取有用的结果——它决定了要提取哪个代码块。",
			properties: indentationProperties,
			required: [],
			additionalProperties: false,
		},
	}

	return {
		type: "function",
		function: {
			name: "read_file",
			description,
			strict: true,
			parameters: {
				type: "object",
				properties,
				required: ["path"],
				additionalProperties: false,
			},
		},
	} satisfies OpenAI.Chat.ChatCompletionTool
}

/**
 * Default read_file tool with all parameters
 */
export const read_file = createReadFileTool()
