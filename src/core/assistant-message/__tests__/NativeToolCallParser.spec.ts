import { NativeToolCallParser } from "../NativeToolCallParser"

describe("NativeToolCallParser", () => {
	beforeEach(() => {
		NativeToolCallParser.clearAllStreamingToolCalls()
		NativeToolCallParser.clearRawChunkState()
	})

	describe("parseToolCall", () => {
		describe("read_file tool", () => {
			it("should parse minimal single-file read_file args", () => {
				const toolCall = {
					id: "toolu_123",
					name: "read_file" as const,
					arguments: JSON.stringify({
						path: "src/core/task/Task.ts",
					}),
				}

				const result = NativeToolCallParser.parseToolCall(toolCall)

				expect(result).not.toBeNull()
				expect(result?.type).toBe("tool_use")
				if (result?.type === "tool_use") {
					expect(result.nativeArgs).toBeDefined()
					const nativeArgs = result.nativeArgs as { path: string }
					expect(nativeArgs.path).toBe("src/core/task/Task.ts")
				}
			})

			it("should parse slice-mode params", () => {
				const toolCall = {
					id: "toolu_123",
					name: "read_file" as const,
					arguments: JSON.stringify({
						path: "src/core/task/Task.ts",
						mode: "slice",
						offset: 10,
						limit: 20,
					}),
				}

				const result = NativeToolCallParser.parseToolCall(toolCall)

				expect(result).not.toBeNull()
				expect(result?.type).toBe("tool_use")
				if (result?.type === "tool_use") {
					const nativeArgs = result.nativeArgs as {
						path: string
						mode?: string
						offset?: number
						limit?: number
					}
					expect(nativeArgs.path).toBe("src/core/task/Task.ts")
					expect(nativeArgs.mode).toBe("slice")
					expect(nativeArgs.offset).toBe(10)
					expect(nativeArgs.limit).toBe(20)
				}
			})

			it("should parse indentation-mode params", () => {
				const toolCall = {
					id: "toolu_123",
					name: "read_file" as const,
					arguments: JSON.stringify({
						path: "src/utils.ts",
						mode: "indentation",
						indentation: {
							anchor_line: 123,
							max_levels: 2,
							include_siblings: true,
							include_header: false,
						},
					}),
				}

				const result = NativeToolCallParser.parseToolCall(toolCall)

				expect(result).not.toBeNull()
				expect(result?.type).toBe("tool_use")
				if (result?.type === "tool_use") {
					const nativeArgs = result.nativeArgs as {
						path: string
						mode?: string
						indentation?: {
							anchor_line?: number
							max_levels?: number
							include_siblings?: boolean
							include_header?: boolean
						}
					}
					expect(nativeArgs.path).toBe("src/utils.ts")
					expect(nativeArgs.mode).toBe("indentation")
					expect(nativeArgs.indentation?.anchor_line).toBe(123)
					expect(nativeArgs.indentation?.include_siblings).toBe(true)
					expect(nativeArgs.indentation?.include_header).toBe(false)
				}
			})

			// Legacy format backward compatibility tests
			describe("legacy format backward compatibility", () => {
				it("should parse legacy files array format with single file", () => {
					const toolCall = {
						id: "toolu_legacy_1",
						name: "read_file" as const,
						arguments: JSON.stringify({
							files: [{ path: "src/legacy/file.ts" }],
						}),
					}

					const result = NativeToolCallParser.parseToolCall(toolCall)

					expect(result).not.toBeNull()
					expect(result?.type).toBe("tool_use")
					if (result?.type === "tool_use") {
						expect(result.usedLegacyFormat).toBe(true)
						const nativeArgs = result.nativeArgs as { files: Array<{ path: string }>; _legacyFormat: true }
						expect(nativeArgs._legacyFormat).toBe(true)
						expect(nativeArgs.files).toHaveLength(1)
						expect(nativeArgs.files[0].path).toBe("src/legacy/file.ts")
					}
				})

				it("should parse legacy files array format with multiple files", () => {
					const toolCall = {
						id: "toolu_legacy_2",
						name: "read_file" as const,
						arguments: JSON.stringify({
							files: [{ path: "src/file1.ts" }, { path: "src/file2.ts" }, { path: "src/file3.ts" }],
						}),
					}

					const result = NativeToolCallParser.parseToolCall(toolCall)

					expect(result).not.toBeNull()
					expect(result?.type).toBe("tool_use")
					if (result?.type === "tool_use") {
						expect(result.usedLegacyFormat).toBe(true)
						const nativeArgs = result.nativeArgs as { files: Array<{ path: string }>; _legacyFormat: true }
						expect(nativeArgs.files).toHaveLength(3)
						expect(nativeArgs.files[0].path).toBe("src/file1.ts")
						expect(nativeArgs.files[1].path).toBe("src/file2.ts")
						expect(nativeArgs.files[2].path).toBe("src/file3.ts")
					}
				})

				it("should parse legacy line_ranges as tuples", () => {
					const toolCall = {
						id: "toolu_legacy_3",
						name: "read_file" as const,
						arguments: JSON.stringify({
							files: [
								{
									path: "src/task.ts",
									line_ranges: [
										[1, 50],
										[100, 150],
									],
								},
							],
						}),
					}

					const result = NativeToolCallParser.parseToolCall(toolCall)

					expect(result).not.toBeNull()
					expect(result?.type).toBe("tool_use")
					if (result?.type === "tool_use") {
						expect(result.usedLegacyFormat).toBe(true)
						const nativeArgs = result.nativeArgs as {
							files: Array<{ path: string; lineRanges?: Array<{ start: number; end: number }> }>
							_legacyFormat: true
						}
						expect(nativeArgs.files[0].lineRanges).toHaveLength(2)
						expect(nativeArgs.files[0].lineRanges?.[0]).toEqual({ start: 1, end: 50 })
						expect(nativeArgs.files[0].lineRanges?.[1]).toEqual({ start: 100, end: 150 })
					}
				})

				it("should parse legacy line_ranges as objects", () => {
					const toolCall = {
						id: "toolu_legacy_4",
						name: "read_file" as const,
						arguments: JSON.stringify({
							files: [
								{
									path: "src/task.ts",
									line_ranges: [
										{ start: 10, end: 20 },
										{ start: 30, end: 40 },
									],
								},
							],
						}),
					}

					const result = NativeToolCallParser.parseToolCall(toolCall)

					expect(result).not.toBeNull()
					expect(result?.type).toBe("tool_use")
					if (result?.type === "tool_use") {
						expect(result.usedLegacyFormat).toBe(true)
						const nativeArgs = result.nativeArgs as {
							files: Array<{ path: string; lineRanges?: Array<{ start: number; end: number }> }>
						}
						expect(nativeArgs.files[0].lineRanges).toHaveLength(2)
						expect(nativeArgs.files[0].lineRanges?.[0]).toEqual({ start: 10, end: 20 })
						expect(nativeArgs.files[0].lineRanges?.[1]).toEqual({ start: 30, end: 40 })
					}
				})

				it("should parse legacy line_ranges as strings", () => {
					const toolCall = {
						id: "toolu_legacy_5",
						name: "read_file" as const,
						arguments: JSON.stringify({
							files: [
								{
									path: "src/task.ts",
									line_ranges: ["1-50", "100-150"],
								},
							],
						}),
					}

					const result = NativeToolCallParser.parseToolCall(toolCall)

					expect(result).not.toBeNull()
					expect(result?.type).toBe("tool_use")
					if (result?.type === "tool_use") {
						expect(result.usedLegacyFormat).toBe(true)
						const nativeArgs = result.nativeArgs as {
							files: Array<{ path: string; lineRanges?: Array<{ start: number; end: number }> }>
						}
						expect(nativeArgs.files[0].lineRanges).toHaveLength(2)
						expect(nativeArgs.files[0].lineRanges?.[0]).toEqual({ start: 1, end: 50 })
						expect(nativeArgs.files[0].lineRanges?.[1]).toEqual({ start: 100, end: 150 })
					}
				})

				it("should parse double-stringified files array (model quirk)", () => {
					// This tests the real-world case where some models double-stringify the files array
					// e.g., { files: "[{\"path\": \"...\"}]" } instead of { files: [{path: "..."}] }
					const toolCall = {
						id: "toolu_double_stringify",
						name: "read_file" as const,
						arguments: JSON.stringify({
							files: JSON.stringify([
								{ path: "src/services/example/service.ts" },
								{ path: "src/services/mcp/McpServerManager.ts" },
							]),
						}),
					}

					const result = NativeToolCallParser.parseToolCall(toolCall)

					expect(result).not.toBeNull()
					expect(result?.type).toBe("tool_use")
					if (result?.type === "tool_use") {
						expect(result.usedLegacyFormat).toBe(true)
						const nativeArgs = result.nativeArgs as {
							files: Array<{ path: string }>
							_legacyFormat: true
						}
						expect(nativeArgs._legacyFormat).toBe(true)
						expect(nativeArgs.files).toHaveLength(2)
						expect(nativeArgs.files[0].path).toBe("src/services/example/service.ts")
						expect(nativeArgs.files[1].path).toBe("src/services/mcp/McpServerManager.ts")
					}
				})

				it("should NOT set usedLegacyFormat for new format", () => {
					const toolCall = {
						id: "toolu_new",
						name: "read_file" as const,
						arguments: JSON.stringify({
							path: "src/new/format.ts",
							mode: "slice",
							offset: 1,
							limit: 100,
						}),
					}

					const result = NativeToolCallParser.parseToolCall(toolCall)

					expect(result).not.toBeNull()
					expect(result?.type).toBe("tool_use")
					if (result?.type === "tool_use") {
						expect(result.usedLegacyFormat).toBeUndefined()
					}
				})
			})
		})

		describe("apply_diff tool", () => {
			// Build diff markers via concatenation so the test source never contains
			// contiguous conflict-marker tokens.
			const MARK_SEARCH = `${"<".repeat(7)} SEARCH`
			const MARK_SEP = "=".repeat(7)
			const MARK_REPLACE = `${">".repeat(7)} REPLACE`

			it("should parse standard apply_diff args with explicit path and diff", () => {
				const diff = `${MARK_SEARCH}\n:start_line:1\nfoo\n${MARK_SEP}\nbar\n${MARK_REPLACE}`
				const toolCall = {
					id: "toolu_apply_1",
					name: "apply_diff" as const,
					arguments: JSON.stringify({ path: "src/foo.ts", diff }),
				}

				const result = NativeToolCallParser.parseToolCall(toolCall)

				expect(result).not.toBeNull()
				expect(result?.type).toBe("tool_use")
				if (result?.type === "tool_use") {
					const nativeArgs = result.nativeArgs as { path: string; diff: string }
					expect(nativeArgs.path).toBe("src/foo.ts")
					expect(nativeArgs.diff).toBe(diff)
				}
			})

			it("should recover a path appended to the diff tail via a full-width DSML marker", () => {
				// Reproduces a model that omits the `path` field and appends a path
				// marker (using full-width vertical bars) to the end of the diff.
				const fullWidthBar = "\uFF5C"
				const diffBody = `${MARK_SEARCH}\n:start_line:233\n.foo {}\n${MARK_SEP}\n.bar {}\n${MARK_REPLACE}`
				const appendedDiff =
					diffBody +
					`\n<${fullWidthBar}${fullWidthBar}DSML${fullWidthBar}${fullWidthBar}parameter name="path" string="true">frontend/src/pages/admin/ProjectLevelSettings.vue`

				const toolCall = {
					id: "toolu_apply_2",
					name: "apply_diff" as const,
					arguments: JSON.stringify({ diff: appendedDiff }),
				}

				const result = NativeToolCallParser.parseToolCall(toolCall)

				expect(result).not.toBeNull()
				expect(result?.type).toBe("tool_use")
				if (result?.type === "tool_use") {
					const nativeArgs = result.nativeArgs as { path: string; diff: string }
					expect(nativeArgs.path).toBe("frontend/src/pages/admin/ProjectLevelSettings.vue")
					// Marker must be stripped, leaving the original diff body intact.
					expect(nativeArgs.diff).toBe(diffBody)
				}
			})

			it("should recover a path appended to the diff tail via a half-width DSML marker", () => {
				const diffBody = `${MARK_SEARCH}\n:start_line:1\nfoo\n${MARK_SEP}\nbar\n${MARK_REPLACE}`
				const appendedDiff = diffBody + `\n<||DSML||parameter name="path" string="true">src/foo.ts`

				const toolCall = {
					id: "toolu_apply_3",
					name: "apply_diff" as const,
					arguments: JSON.stringify({ diff: appendedDiff }),
				}

				const result = NativeToolCallParser.parseToolCall(toolCall)

				expect(result).not.toBeNull()
				if (result?.type === "tool_use") {
					const nativeArgs = result.nativeArgs as { path: string; diff: string }
					expect(nativeArgs.path).toBe("src/foo.ts")
					expect(nativeArgs.diff).toBe(diffBody)
				}
			})

			it("should NOT alter a normal call when path is present", () => {
				// When the path field is supplied, the diff must be passed through untouched.
				const diff = `${MARK_SEARCH}\nfoo\n${MARK_SEP}\nbar\n${MARK_REPLACE}`
				const toolCall = {
					id: "toolu_apply_4",
					name: "apply_diff" as const,
					arguments: JSON.stringify({ path: "src/explicit.ts", diff }),
				}

				const result = NativeToolCallParser.parseToolCall(toolCall)

				expect(result).not.toBeNull()
				if (result?.type === "tool_use") {
					const nativeArgs = result.nativeArgs as { path: string; diff: string }
					expect(nativeArgs.path).toBe("src/explicit.ts")
					expect(nativeArgs.diff).toBe(diff)
				}
			})

			it("should treat the call as invalid when path is missing and no marker is present", () => {
				const diff = `${MARK_SEARCH}\nfoo\n${MARK_SEP}\nbar\n${MARK_REPLACE}`
				const toolCall = {
					id: "toolu_apply_5",
					name: "apply_diff" as const,
					arguments: JSON.stringify({ diff }),
				}

				const result = NativeToolCallParser.parseToolCall(toolCall)

				// No path could be recovered, so the call must not produce nativeArgs.
				expect(result).toBeNull()
			})
		})
	})

	describe("processStreamingChunk", () => {
		describe("read_file tool", () => {
			it("should emit a partial ToolUse with nativeArgs.path during streaming", () => {
				const id = "toolu_streaming_123"
				NativeToolCallParser.startStreamingToolCall(id, "read_file")

				// Simulate streaming chunks
				const fullArgs = JSON.stringify({ path: "src/test.ts" })

				// Process the complete args as a single chunk for simplicity
				const result = NativeToolCallParser.processStreamingChunk(id, fullArgs)

				expect(result).not.toBeNull()
				expect(result?.nativeArgs).toBeDefined()
				const nativeArgs = result?.nativeArgs as { path: string }
				expect(nativeArgs.path).toBe("src/test.ts")
			})
		})
	})

	describe("finalizeStreamingToolCall", () => {
		describe("read_file tool", () => {
			it("should parse read_file args on finalize", () => {
				const id = "toolu_finalize_123"
				NativeToolCallParser.startStreamingToolCall(id, "read_file")

				// Add the complete arguments
				NativeToolCallParser.processStreamingChunk(
					id,
					JSON.stringify({
						path: "finalized.ts",
						mode: "slice",
						offset: 1,
						limit: 10,
					}),
				)

				const result = NativeToolCallParser.finalizeStreamingToolCall(id)

				expect(result).not.toBeNull()
				expect(result?.type).toBe("tool_use")
				if (result?.type === "tool_use") {
					const nativeArgs = result.nativeArgs as { path: string; offset?: number; limit?: number }
					expect(nativeArgs.path).toBe("finalized.ts")
					expect(nativeArgs.offset).toBe(1)
					expect(nativeArgs.limit).toBe(10)
				}
			})
		})

		describe("apply_diff tool", () => {
			it("should recover an appended path on finalize when the path field is omitted", () => {
				const id = "toolu_finalize_apply_diff"
				NativeToolCallParser.startStreamingToolCall(id, "apply_diff")

				const fullWidthBar = "\uFF5C"
				const MARK_SEARCH2 = `${"<".repeat(7)} SEARCH`
				const MARK_SEP2 = "=".repeat(7)
				const MARK_REPLACE2 = `${">".repeat(7)} REPLACE`
				const diffBody = `${MARK_SEARCH2}\n:start_line:1\nfoo\n${MARK_SEP2}\nbar\n${MARK_REPLACE2}`
				const appendedDiff =
					diffBody +
					`\n<${fullWidthBar}${fullWidthBar}DSML${fullWidthBar}${fullWidthBar}parameter name="path" string="true">src/recovered.ts`

				NativeToolCallParser.processStreamingChunk(id, JSON.stringify({ diff: appendedDiff }))

				const result = NativeToolCallParser.finalizeStreamingToolCall(id)

				expect(result).not.toBeNull()
				expect(result?.type).toBe("tool_use")
				if (result?.type === "tool_use") {
					const nativeArgs = result.nativeArgs as { path: string; diff: string }
					expect(nativeArgs.path).toBe("src/recovered.ts")
					expect(nativeArgs.diff).toBe(diffBody)
				}
			})
		})
	})

	describe("normalizePathParams (via parseToolCall)", () => {
		describe("path tools accept file_path as fallback", () => {
			it("normalizes file_path to path for write_to_file when path is absent", () => {
				const result = NativeToolCallParser.parseToolCall({
					id: "toolu_np_01",
					name: "write_to_file" as const,
					arguments: JSON.stringify({ file_path: "src/test.ts", content: "test" }),
				})
				expect(result).not.toBeNull()
				if (result?.type === "tool_use") {
					const na = result.nativeArgs as { path: string; content: string }
					expect(na.path).toBe("src/test.ts")
				}
			})

			it("keeps path when both path and file_path are present (canonical wins)", () => {
				const result = NativeToolCallParser.parseToolCall({
					id: "toolu_np_02",
					name: "write_to_file" as const,
					arguments: JSON.stringify({
						path: "src/canonical.ts",
						file_path: "src/fallback.ts",
						content: "test",
					}),
				})
				expect(result).not.toBeNull()
				if (result?.type === "tool_use") {
					const na = result.nativeArgs as { path: string; content: string }
					expect(na.path).toBe("src/canonical.ts")
				}
			})

			it("normalizes file_path to path for apply_diff when path is absent", () => {
				const MARK_SEARCH3 = `${"<".repeat(7)} SEARCH`
				const MARK_SEP3 = "=".repeat(7)
				const MARK_REPLACE3 = `${">".repeat(7)} REPLACE`
				const diff = `${MARK_SEARCH3}\ntest\n${MARK_SEP3}\nnew\n${MARK_REPLACE3}`
				const result = NativeToolCallParser.parseToolCall({
					id: "toolu_np_03",
					name: "apply_diff" as const,
					arguments: JSON.stringify({ file_path: "src/test.ts", diff }),
				})
				expect(result).not.toBeNull()
				if (result?.type === "tool_use") {
					const na = result.nativeArgs as { path: string; diff: string }
					expect(na.path).toBe("src/test.ts")
				}
			})

			it("normalizes file_path to path for search_files when path is absent", () => {
				const result = NativeToolCallParser.parseToolCall({
					id: "toolu_np_04",
					name: "search_files" as const,
					arguments: JSON.stringify({ file_path: "src", regex: "function" }),
				})
				expect(result).not.toBeNull()
				if (result?.type === "tool_use") {
					const na = result.nativeArgs as { path: string; regex: string }
					expect(na.path).toBe("src")
				}
			})

			it("normalizes file_path to path for list_files when path is absent", () => {
				const result = NativeToolCallParser.parseToolCall({
					id: "toolu_np_05",
					name: "list_files" as const,
					arguments: JSON.stringify({ file_path: "src", recursive: true }),
				})
				expect(result).not.toBeNull()
				if (result?.type === "tool_use") {
					const na = result.nativeArgs as { path: string; recursive: boolean }
					expect(na.path).toBe("src")
				}
			})

			it("normalizes file_path to path for read_file when path is absent", () => {
				const result = NativeToolCallParser.parseToolCall({
					id: "toolu_np_06",
					name: "read_file" as const,
					arguments: JSON.stringify({ file_path: "src/test.ts" }),
				})
				expect(result).not.toBeNull()
				if (result?.type === "tool_use") {
					const na = result.nativeArgs as { path: string }
					expect(na.path).toBe("src/test.ts")
				}
			})

			it("normalizes file_path to path for codebase_search when path is absent", () => {
				const result = NativeToolCallParser.parseToolCall({
					id: "toolu_np_07",
					name: "codebase_search" as const,
					arguments: JSON.stringify({ file_path: "src/auth", query: "login" }),
				})
				expect(result).not.toBeNull()
				if (result?.type === "tool_use") {
					const na = result.nativeArgs as { path: string; query: string }
					expect(na.path).toBe("src/auth")
				}
			})
		})

		describe("file_path tools accept path as fallback", () => {
			it("normalizes path to file_path for edit when file_path is absent", () => {
				const result = NativeToolCallParser.parseToolCall({
					id: "toolu_np_08",
					name: "edit" as const,
					arguments: JSON.stringify({ path: "src/test.ts", old_string: "old", new_string: "new" }),
				})
				expect(result).not.toBeNull()
				if (result?.type === "tool_use") {
					const na = result.nativeArgs as { file_path: string; old_string: string; new_string: string }
					expect(na.file_path).toBe("src/test.ts")
				}
			})

			it("keeps file_path when both file_path and path are present (canonical wins)", () => {
				const result = NativeToolCallParser.parseToolCall({
					id: "toolu_np_09",
					name: "edit" as const,
					arguments: JSON.stringify({
						file_path: "src/canonical.ts",
						path: "src/fallback.ts",
						old_string: "old",
						new_string: "new",
					}),
				})
				expect(result).not.toBeNull()
				if (result?.type === "tool_use") {
					const na = result.nativeArgs as { file_path: string; old_string: string; new_string: string }
					expect(na.file_path).toBe("src/canonical.ts")
				}
			})

			it("normalizes path to file_path for edit_file when file_path is absent", () => {
				const result = NativeToolCallParser.parseToolCall({
					id: "toolu_np_10",
					name: "edit_file" as const,
					arguments: JSON.stringify({ path: "src/test.ts", old_string: "old", new_string: "new" }),
				})
				expect(result).not.toBeNull()
				if (result?.type === "tool_use") {
					const na = result.nativeArgs as { file_path: string; old_string: string; new_string: string }
					expect(na.file_path).toBe("src/test.ts")
				}
			})

			it("normalizes path to file_path for search_replace when file_path is absent", () => {
				const result = NativeToolCallParser.parseToolCall({
					id: "toolu_np_11",
					name: "search_replace" as const,
					arguments: JSON.stringify({ path: "src/test.ts", old_string: "old", new_string: "new" }),
				})
				expect(result).not.toBeNull()
				if (result?.type === "tool_use") {
					const na = result.nativeArgs as { file_path: string; old_string: string; new_string: string }
					expect(na.file_path).toBe("src/test.ts")
				}
			})
		})

		describe("tools not in path/file_path sets are unaffected", () => {
			it("passes through args unchanged for execute_command", () => {
				const result = NativeToolCallParser.parseToolCall({
					id: "toolu_np_12",
					name: "execute_command" as const,
					arguments: JSON.stringify({ command: "npm test", path: "should-be-ignored" }),
				})
				expect(result).not.toBeNull()
				if (result?.type === "tool_use") {
					const na = result.nativeArgs as { command: string; cwd?: string }
					expect(na.command).toBe("npm test")
					expect((na as Record<string, unknown>).cwd).toBeUndefined()
				}
			})
		})
	})
})
