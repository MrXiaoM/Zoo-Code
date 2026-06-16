import { ApplyPatchTool } from "../ApplyPatchTool"
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
	}
})

vi.mock("../../prompts/responses", () => ({
	formatResponse: {
		createPrettyPatch: vi.fn(() => "unified-diff"),
		rooIgnoreError: vi.fn((relPath) => `rooignore_error ${relPath}`),
		toolError: vi.fn((msg) => `tool_error ${msg}`),
	},
}))

vi.mock("../../diff/stats", () => ({
	sanitizeUnifiedDiff: vi.fn((diff) => diff),
	computeDiffStats: vi.fn(() => ({ additions: 1, deletions: 1 })),
}))

vi.mock("../../../utils/fs", () => ({
	fileExistsAtPath: vi.fn().mockResolvedValue(true),
}))

describe("ApplyPatchTool EOL Normalization", () => {
	let tool: ApplyPatchTool
	let mockTask: any
	let mockCallbacks: any

	beforeEach(() => {
		vi.clearAllMocks()
		tool = new ApplyPatchTool()

		mockTask = {
			cwd: "/mock/cwd",
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
			fileContextTracker: { trackFileContext: vi.fn().mockResolvedValue(undefined) },
			recordToolUsage: vi.fn(),
			processQueuedMessages: vi.fn(),
			consecutiveMistakeCount: 0,
			recordToolError: vi.fn(),
			sayAndCreateMissingParamError: vi.fn().mockResolvedValue(undefined),
			say: vi.fn().mockResolvedValue(undefined),
		}

		mockCallbacks = {
			askApproval: vi.fn().mockResolvedValue(true),
			handleError: vi.fn().mockResolvedValue(undefined),
			pushToolResult: vi.fn(),
		}
	})

	it("should restore CRLF when normalizeLineEndings is enabled in ApplyPatchTool even if patch uses CRLF", async () => {
		const filePath = "test.txt"
		const originalContent = "line1\r\nline2\r\n"
		// Patch uses CRLF
		const patch = "*** Begin Patch\r\n*** Update File: test.txt\r\n@@\r\n-line2\r\n+modified\r\n*** End Patch"

		vi.mocked(fs.readFile).mockResolvedValue(originalContent as any)

		await tool.execute({ patch }, mockTask, mockCallbacks)

		// Verify update was called with CRLF
		const updateCalls = mockTask.diffViewProvider.update.mock.calls
		expect(updateCalls.length).toBeGreaterThan(0)

		const targetCall = updateCalls.find((call: any[]) => call[0].includes("\r\n"))
		expect(targetCall).toBeDefined()
		expect(targetCall[0]).toBe("line1\r\nmodified\r\n")
	})
})
