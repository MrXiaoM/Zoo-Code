import { useCallback, useState } from "react"
import { Checkbox } from "vscrui"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"

import type { ProviderSettings } from "@roo-code/types"

import { useAppTranslation } from "@src/i18n/TranslationContext"
import { VSCodeButtonLink } from "@src/components/common/VSCodeButtonLink"
import { useSelectedModel } from "@src/components/ui/hooks/useSelectedModel"

import { inputEventTransform, noTransform } from "../transforms"

type AnthropicProps = {
	apiConfiguration: ProviderSettings
	setApiConfigurationField: (field: keyof ProviderSettings, value: ProviderSettings[keyof ProviderSettings]) => void
	simplifySettings?: boolean
}

// Convert an optional numeric setting to a string for the text input,
// rendering empty string when the value is unset.
const numberToInputValue = (value: number | undefined | null): string =>
	value === undefined || value === null ? "" : value.toString()

// Parse an integer from the input event. Empty/invalid input maps to
// `undefined` so that the override is cleared and the model default is used.
const parseIntFieldTransform = (event: Event | React.FormEvent<HTMLElement>): number | undefined => {
	const value = (event.target as HTMLInputElement).value
	if (value.trim() === "") {
		return undefined
	}
	const parsed = parseInt(value, 10)
	return Number.isFinite(parsed) ? parsed : undefined
}

// Parse a float from the input event. Empty/invalid input maps to
// `undefined` so that the override is cleared and the model default is used.
const parseFloatFieldTransform = (event: Event | React.FormEvent<HTMLElement>): number | undefined => {
	const value = (event.target as HTMLInputElement).value
	if (value.trim() === "") {
		return undefined
	}
	const parsed = parseFloat(value)
	return Number.isFinite(parsed) ? parsed : undefined
}

export const Anthropic = ({ apiConfiguration, setApiConfigurationField }: AnthropicProps) => {
	const { t } = useAppTranslation()
	const selectedModel = useSelectedModel(apiConfiguration)

	const [anthropicBaseUrlSelected, setAnthropicBaseUrlSelected] = useState(!!apiConfiguration?.anthropicBaseUrl)

	// Check if the current model supports 1M context beta
	const supports1MContextBeta =
		selectedModel?.id === "claude-sonnet-4-20250514" ||
		selectedModel?.id === "claude-sonnet-4-5" ||
		selectedModel?.id === "claude-sonnet-4-6" ||
		selectedModel?.id === "claude-opus-4-6"

	const handleInputChange = useCallback(
		<K extends keyof ProviderSettings, E>(
			field: K,
			transform: (event: E) => ProviderSettings[K] = inputEventTransform,
		) =>
			(event: E | Event) => {
				setApiConfigurationField(field, transform(event as E))
			},
		[setApiConfigurationField],
	)

	return (
		<>
			<VSCodeTextField
				value={apiConfiguration?.apiKey || ""}
				type="password"
				onInput={handleInputChange("apiKey")}
				placeholder={t("settings:placeholders.apiKey")}
				className="w-full">
				<label className="block font-medium mb-1">{t("settings:providers.anthropicApiKey")}</label>
			</VSCodeTextField>
			<div className="text-sm text-vscode-descriptionForeground -mt-2">
				{t("settings:providers.apiKeyStorageNotice")}
			</div>
			{!apiConfiguration?.apiKey && (
				<VSCodeButtonLink href="https://console.anthropic.com/settings/keys" appearance="secondary">
					{t("settings:providers.getAnthropicApiKey")}
				</VSCodeButtonLink>
			)}
			<div>
				<Checkbox
					checked={anthropicBaseUrlSelected}
					onChange={(checked: boolean) => {
						setAnthropicBaseUrlSelected(checked)

						if (!checked) {
							setApiConfigurationField("anthropicBaseUrl", "")
							setApiConfigurationField("anthropicUseAuthToken", false)
						}
					}}>
					{t("settings:providers.useCustomBaseUrl")}
				</Checkbox>
				{anthropicBaseUrlSelected && (
					<>
						<VSCodeTextField
							value={apiConfiguration?.anthropicBaseUrl || ""}
							type="url"
							onInput={handleInputChange("anthropicBaseUrl")}
							placeholder="https://api.anthropic.com"
							className="w-full mt-1"
						/>
						<Checkbox
							checked={apiConfiguration?.anthropicUseAuthToken ?? false}
							onChange={handleInputChange("anthropicUseAuthToken", noTransform)}
							className="w-full mt-1">
							{t("settings:providers.anthropicUseAuthToken")}
						</Checkbox>

						{/* Custom model overrides for unofficial/self-hosted endpoints. */}
						<div className="mt-3 flex flex-col gap-3">
							<div className="text-sm text-vscode-descriptionForeground">
								{t("settings:providers.anthropicCustomModel.description")}
							</div>

							<div>
								<VSCodeTextField
									value={numberToInputValue(apiConfiguration?.anthropicCustomContextWindow)}
									type="text"
									onInput={handleInputChange("anthropicCustomContextWindow", parseIntFieldTransform)}
									placeholder={t("settings:placeholders.numbers.contextWindow")}
									className="w-full">
									<label className="block font-medium mb-1">
										{t("settings:providers.anthropicCustomModel.contextWindow.label")}
									</label>
								</VSCodeTextField>
							</div>

							<div>
								<VSCodeTextField
									value={numberToInputValue(apiConfiguration?.anthropicCustomInputPrice)}
									type="text"
									onInput={handleInputChange("anthropicCustomInputPrice", parseFloatFieldTransform)}
									placeholder={t("settings:placeholders.numbers.inputPrice")}
									className="w-full">
									<label className="block font-medium mb-1">
										{t("settings:providers.anthropicCustomModel.inputPrice.label")}
									</label>
								</VSCodeTextField>
							</div>

							<div>
								<VSCodeTextField
									value={numberToInputValue(apiConfiguration?.anthropicCustomOutputPrice)}
									type="text"
									onInput={handleInputChange("anthropicCustomOutputPrice", parseFloatFieldTransform)}
									placeholder={t("settings:placeholders.numbers.outputPrice")}
									className="w-full">
									<label className="block font-medium mb-1">
										{t("settings:providers.anthropicCustomModel.outputPrice.label")}
									</label>
								</VSCodeTextField>
							</div>

							<div>
								<VSCodeTextField
									value={numberToInputValue(apiConfiguration?.anthropicCustomCacheWritesPrice)}
									type="text"
									onInput={handleInputChange(
										"anthropicCustomCacheWritesPrice",
										parseFloatFieldTransform,
									)}
									placeholder={t("settings:placeholders.numbers.cacheWritePrice")}
									className="w-full">
									<label className="block font-medium mb-1">
										{t("settings:providers.anthropicCustomModel.cacheWritesPrice.label")}
									</label>
								</VSCodeTextField>
							</div>

							<div>
								<VSCodeTextField
									value={numberToInputValue(apiConfiguration?.anthropicCustomCacheReadsPrice)}
									type="text"
									onInput={handleInputChange(
										"anthropicCustomCacheReadsPrice",
										parseFloatFieldTransform,
									)}
									placeholder={t("settings:placeholders.numbers.inputPrice")}
									className="w-full">
									<label className="block font-medium mb-1">
										{t("settings:providers.anthropicCustomModel.cacheReadsPrice.label")}
									</label>
								</VSCodeTextField>
							</div>
						</div>
					</>
				)}
			</div>
			{supports1MContextBeta && (
				<div>
					<Checkbox
						checked={apiConfiguration?.anthropicBeta1MContext ?? false}
						onChange={(checked: boolean) => {
							setApiConfigurationField("anthropicBeta1MContext", checked)
						}}>
						{t("settings:providers.anthropic1MContextBetaLabel")}
					</Checkbox>
					<div className="text-sm text-vscode-descriptionForeground mt-1 ml-6">
						{t("settings:providers.anthropic1MContextBetaDescription")}
					</div>
				</div>
			)}
		</>
	)
}
