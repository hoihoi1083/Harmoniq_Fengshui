/**
 * Shared DeepSeek API Client
 * Handles encoding issues with Chinese characters
 */

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

/**
 * Make a DeepSeek API call with proper encoding handling
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Optional parameters (temperature, max_tokens, etc.)
 * @param {string} apiKey - DeepSeek API key
 * @returns {Promise<Object>} - API response
 */
export async function callDeepSeekAPI(messages, options = {}, apiKey) {
	if (!apiKey) {
		throw new Error("DeepSeek API key is required");
	}

	try {
		// Sanitize messages to ensure proper string encoding
		const sanitizedMessages = messages.map((msg) => ({
			role: msg.role,
			content:
				typeof msg.content === "string"
					? msg.content
					: String(msg.content),
		}));

		// Prepare request body
		const requestBody = JSON.stringify({
			model: options.model || "deepseek-chat",
			messages: sanitizedMessages,
			temperature: options.temperature || 0.7,
			max_tokens: options.max_tokens || 1000,
			top_p: options.top_p || 0.9,
			stream: false,
			...options, // Allow override of any parameter
		});

		// Make API call with proper headers
		const response = await fetch(DEEPSEEK_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				Authorization: `Bearer ${apiKey}`,
				Accept: "application/json",
			},
			body: requestBody,
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(
				`DeepSeek API error: ${response.status} ${response.statusText}`,
				errorText
			);
			throw new Error(
				`DeepSeek API error: ${response.status} ${response.statusText}`
			);
		}

		return await response.json();
	} catch (error) {
		console.error("DeepSeek API call failed:", error.message);
		if (error.message.includes("ByteString")) {
			console.error(
				"⚠️ Character encoding issue detected. Special characters in the message may be causing problems."
			);
		}
		throw error;
	}
}

export default callDeepSeekAPI;
