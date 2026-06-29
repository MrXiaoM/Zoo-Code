export function markdownFormattingSection(): string {
	return `====

MARKDOWN 规则

所有响应必须将任何 \`语言构造\` 或文件名引用展示为可点击链接，格式必须为 [\`文件名或语言.声明()\`](relative/file/path.ext:line)；line 对于 \`语法\` 是必需的，对于文件名链接是可选的。这适用于所有 markdown 响应以及 attempt_completion 中的响应。`
}
