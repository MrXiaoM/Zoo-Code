import i18next from "i18next"

// Build translations object
const translations: Record<string, Record<string, any>> = {}

// Determine if running in test environment
const isTestEnv = process.env.NODE_ENV === "test"

// Load translations based on environment
if (!isTestEnv) {
	try {
		// Dynamic imports to avoid browser compatibility issues
		const fs = require("fs")
		const path = require("path")

		const localesDir = path.join(__dirname, "i18n", "locales")

		try {
			// Find all language directories
			const languageDirs = fs.readdirSync(localesDir, { withFileTypes: true })

			const languages = languageDirs
				.filter(
					(dirent: { isDirectory: () => boolean; name: string }) =>
						dirent.isDirectory() && !dirent.name.startsWith("."),
				)
				.map((dirent: { name: string }) => dirent.name)

			// Process each language
			languages.forEach((language: string) => {
				const langPath = path.join(localesDir, language)

				// Find all JSON files in the language directory
				const files = fs
					.readdirSync(langPath, { withFileTypes: true })
					.filter(
						(dirent: { isFile: () => boolean; name: string }) =>
							dirent.isFile() && dirent.name.endsWith(".json") && !dirent.name.startsWith("."),
					)
					.map((dirent: { name: string }) => dirent.name)

				// Initialize language in translations object
				if (!translations[language]) {
					translations[language] = {}
				}

				// Process each namespace file
				files.forEach((file: string) => {
					const namespace = path.basename(file, ".json")
					const filePath = path.join(langPath, file)

					try {
						// Read and parse the JSON file
						const content = fs.readFileSync(filePath, "utf8")
						translations[language][namespace] = JSON.parse(content)
					} catch (error) {
						console.error(`Error loading translation file ${filePath}:`, error)
					}
				})
			})

			console.log(`Loaded translations for languages: ${Object.keys(translations).join(", ")}`)
		} catch (dirError) {
			console.error(`Error processing directory ${localesDir}:`, dirError)
		}
	} catch (error) {
		console.error("Error loading translations:", error)
	}
}

/** Cached agent name for use by the post-processor. Updated at runtime. */
let _i18nAgentName = "Mirai"

/**
 * Register a post-processor that replaces `{{agentName}}` placeholders
 * with the current agent name.  This runs AFTER i18next interpolation,
 * so explicit { agentName: "…" } parameters in t() calls take precedence.
 */
i18next.use({
	type: "postProcessor",
	name: "agentName",
	process: (value: string) => value.replaceAll("{{agentName}}", _i18nAgentName),
})

// Initialize i18next with configuration
i18next.init({
	lng: "en",
	fallbackLng: "en",
	debug: false,
	resources: translations,
	interpolation: {
		escapeValue: false,
	},
	postProcess: ["agentName"],
})

export default i18next

/**
 * Update the agent name used by the i18n post-processor.
 * Call this whenever the agent name setting changes.
 */
export function setI18nAgentName(name: string) {
	_i18nAgentName = name || "Mirai"
}
