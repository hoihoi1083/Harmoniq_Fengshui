// AWS Lambda function to proxy OpenAI requests
// Deploy this to Lambda, then call it from your EC2

export const handler = async (event) => {
	const { method, path, body, headers } = JSON.parse(event.body);

	const openaiUrl = `https://api.openai.com${path}`;

	try {
		const response = await fetch(openaiUrl, {
			method: method,
			headers: {
				"Content-Type": "application/json",
				Authorization: headers.authorization,
			},
			body: method !== "GET" ? JSON.stringify(body) : undefined,
		});

		const data = await response.json();

		return {
			statusCode: response.status,
			body: JSON.stringify(data),
			headers: {
				"Content-Type": "application/json",
			},
		};
	} catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify({ error: error.message }),
		};
	}
};

// Deploy via AWS Console:
// 1. Go to Lambda console
// 2. Create function → Author from scratch
// 3. Runtime: Node.js 20.x
// 4. Paste this code
// 5. Create Function URL (enable public access)
// 6. Use that URL in your server instead of api.openai.com
