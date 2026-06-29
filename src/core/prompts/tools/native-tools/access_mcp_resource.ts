import type OpenAI from "openai"

const ACCESS_MCP_RESOURCE_DESCRIPTION = `请求访问由连接的 MCP 服务器提供的资源。资源代表可以用作上下文的数据源，例如文件、API 响应或系统信息。

参数：
- server_name：（必需）提供资源的 MCP 服务器的名称
- uri：（必需）标识要访问的特定资源的 URI

示例：访问天气资源
{ "server_name": "weather-server", "uri": "weather://san-francisco/current" }

示例：从 MCP 服务器访问文件资源
{ "server_name": "filesystem-server", "uri": "file:///path/to/data.json" }`

const SERVER_NAME_PARAMETER_DESCRIPTION = `提供资源的 MCP 服务器的名称`

const URI_PARAMETER_DESCRIPTION = `标识要访问的特定资源的 URI`

export default {
	type: "function",
	function: {
		name: "access_mcp_resource",
		description: ACCESS_MCP_RESOURCE_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				server_name: {
					type: "string",
					description: SERVER_NAME_PARAMETER_DESCRIPTION,
				},
				uri: {
					type: "string",
					description: URI_PARAMETER_DESCRIPTION,
				},
			},
			required: ["server_name", "uri"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
