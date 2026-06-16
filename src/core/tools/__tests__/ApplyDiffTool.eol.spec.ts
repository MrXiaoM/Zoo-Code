import { ApplyDiffTool } from "../ApplyDiffTool"
import { EXPERIMENT_IDS } from "../../../shared/experiments"
import fs from "fs/promises"
import path from "path"

vi.mock("fs/promises")
vi.mock("path", async () => {
	const actual = (await vi.importActual("path")) as any
	return {
		...actual,
		resolve: vi.fn((...args) => args[args.length - 1]),
		isAbsolute: vi.fn(() => false),
		relative: vi.fn((from, to) => to),
	}
})

vi.mock("../../prompts/responses", () => ({
	formatResponse: {
		createPrettyPatch: vi.fn(() => "unified-diff"),
		rooIgnoreError: vi.fn((relPath) => `rooignore_error ${relPath}`),
	},
}))

vi.mock("../../diff/stats", () => ({
	sanitizeUnifiedDiff: vi.fn((diff) => diff),
	computeDiffStats: vi.fn(() => ({ additions: 1, deletions: 1 })),
}))

vi.mock("../../../utils/fs", () => ({
	fileExistsAtPath: vi.fn().mockResolvedValue(true),
}))

describe("ApplyDiffTool EOL Normalization", () => {
	let tool: ApplyDiffTool
	let mockTask: any
	let mockCallbacks: any

	beforeEach(() => {
		vi.clearAllMocks()
		tool = new ApplyDiffTool()

		mockTask = {
			taskId: "test-task",
			cwd: "/mock/cwd",
			api: {
				getModel: vi.fn().mockReturnValue({ id: "claude-3-5-sonnet" }),
			},
			providerRef: {
				deref: vi.fn().mockReturnValue({
					getState: vi.fn().mockResolvedValue({
						experiments: { [EXPERIMENT_IDS.NORMALIZE_LINE_ENDINGS]: true },
						diagnosticsEnabled: true,
						writeDelayMs: 0,
					}),
				}),
			},
			rooIgnoreController: { validateAccess: vi.fn().mockReturnValue(true) },
			rooProtectedController: { isWriteProtected: vi.fn().mockReturnValue(false) },
			diffViewProvider: {
				editType: "",
				originalContent: "",
				open: vi.fn().mockResolvedValue(undefined),
				update: vi.fn().mockResolvedValue(undefined),
				saveChanges: vi.fn().mockResolvedValue(undefined),
				saveDirectly: vi.fn().mockResolvedValue(undefined),
				reset: vi.fn().mockResolvedValue(undefined),
				pushToolWriteResult: vi.fn().mockResolvedValue("Success"),
				scrollToFirstDiff: vi.fn(),
				revertChanges: vi.fn(),
			},
			diffStrategy: {
				applyDiff: vi.fn().mockImplementation(async (original: string, diff: string) => {
					if (original.includes("\r\n")) {
						return { success: false, error: "Original content should be normalized to LF" }
					}
					if (diff.includes("\r\n")) {
						return { success: false, error: "Diff content should be normalized to LF" }
					}

					if (original.includes("line1\nline2")) {
						return { success: true, content: "line1\nmodified\n" }
					}
					return { success: false, error: "Match failed" }
				}),
			},
			fileContextTracker: { trackFileContext: vi.fn().mockResolvedValue(undefined) },
			recordToolUsage: vi.fn(),
			processQueuedMessages: vi.fn(),
			consecutiveMistakeCount: 0,
			consecutiveMistakeCountForApplyDiff: new Map(),
			recordToolError: vi.fn(),
			say: vi.fn().mockResolvedValue(undefined),
			sayAndCreateMissingParamError: vi.fn().mockResolvedValue(undefined),
		}

		mockCallbacks = {
			askApproval: vi.fn().mockResolvedValue(true),
			handleError: vi.fn().mockResolvedValue(undefined),
			pushToolResult: vi.fn(),
		}
	})

	it("should restore CRLF when normalizeLineEndings is enabled in ApplyDiffTool even if diff uses CRLF", async () => {
		const filePath = "test.txt"
		const originalContent = "line1\r\nline2\r\n"
		const diff = "<<<<<<< SEARCH\r\nline1\r\nline2\r\n=======\r\nline1\r\nmodified\r\n>>>>>>> REPLACE"

		vi.mocked(fs.readFile).mockResolvedValue(originalContent as any)

		await tool.execute({ path: filePath, diff }, mockTask, mockCallbacks)

		const updateCalls = mockTask.diffViewProvider.update.mock.calls
		expect(updateCalls.length).toBeGreaterThan(0)

		const targetCall = updateCalls.find((call: any[]) => call[0].includes("\r\n"))
		expect(targetCall).toBeDefined()
		expect(targetCall[0]).toBe("line1\r\nmodified\r\n")
	})
})
