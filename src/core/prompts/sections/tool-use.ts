export function getSharedToolUseSection(): string {
	return `====

工具使用

你可以使用一组工具，这些工具在用户批准后执行。使用提供商原生的工具调用机制。不要包含 XML 标记或示例。你必须在每个助手响应中至少调用一个工具。优先在单次响应中调用尽可能多的合理需要的工具，以减少往返并更快地完成任务。`
}
