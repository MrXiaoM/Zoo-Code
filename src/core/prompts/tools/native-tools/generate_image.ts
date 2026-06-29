import type OpenAI from "openai"

const GENERATE_IMAGE_DESCRIPTION = `请求使用 AI 模型通过 OpenRouter API 生成或编辑图像。此工具可以从文本提示创建新图像，或根据你的指令修改现有图像。当提供输入图像时，AI 将对图像应用请求的编辑、变换或增强。

参数：
- prompt：（必需）描述要生成的内容或如何编辑图像的文本提示
- path：（必需）生成的/编辑的图像应保存到的文件路径（相对于当前工作区目录）。如果未提供，工具将自动添加适当的图像扩展名。
- image：（可选）要编辑或变换的输入图像的文件路径（相对于当前工作区目录）。支持的格式：PNG、JPG、JPEG、GIF、WEBP。

示例：生成日落图像
{ "prompt": "美丽山峦上空的日落，充满活力的橙色和紫色", "path": "images/sunset.png", "image": null }

示例：编辑现有图像
{ "prompt": "将此图像转换为水彩画风格", "path": "images/watercolor-output.png", "image": "images/original-photo.jpg" }

示例：放大和增强图像
{ "prompt": "将此图像放大到更高分辨率，增强细节，提高清晰度和锐度，同时保持原始内容和构图", "path": "images/enhanced-photo.png", "image": "images/low-res-photo.jpg" }`

const PROMPT_PARAMETER_DESCRIPTION = `要生成的图像或要应用的编辑的文本描述`

const PATH_PARAMETER_DESCRIPTION = `结果图像应保存到的文件系统路径（相对于工作区）`

const IMAGE_PARAMETER_DESCRIPTION = `可选的要编辑的现有图像的路径（相对于工作区）；支持 PNG、JPG、JPEG、GIF 和 WEBP`

export default {
	type: "function",
	function: {
		name: "generate_image",
		description: GENERATE_IMAGE_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				prompt: {
					type: "string",
					description: PROMPT_PARAMETER_DESCRIPTION,
				},
				path: {
					type: "string",
					description: PATH_PARAMETER_DESCRIPTION,
				},
				image: {
					type: ["string", "null"],
					description: IMAGE_PARAMETER_DESCRIPTION,
				},
			},
			required: ["prompt", "path", "image"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
