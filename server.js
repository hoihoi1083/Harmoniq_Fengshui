#!/usr/bin/env node

/**
 * Custom Next.js Server with Optimized Keepalive Settings
 * Configured to work with AWS Load Balancer (150s idle timeout)
 */

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
	const server = createServer((req, res) => {
		// 🛡️ Block malicious requests immediately
		const suspiciousPatterns = [
			/ellison\.st/i,
			/xmrig/i,
			/cpuminer/i,
			/stratum\+tcp/i,
			/\/\.env/i,
			/\/phpMyAdmin/i,
			/\/wp-admin/i,
			/eval\(/i,
			/system\(/i,
			/exec\(/i,
		];

		const isSuspicious = suspiciousPatterns.some(
			(pattern) =>
				pattern.test(req.url) ||
				pattern.test(req.headers["user-agent"] || "") ||
				pattern.test(req.headers["referer"] || "")
		);

		if (isSuspicious) {
			console.warn(`🚫 Blocked suspicious request: ${req.url}`);
			res.statusCode = 403;
			res.end("Forbidden");
			return;
		}

		// 🛡️ Validate HTTP method
		const validMethods = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"];
		if (!validMethods.includes(req.method)) {
			console.warn(`🚫 Invalid HTTP method: ${req.method}`);
			res.statusCode = 405;
			res.end("Method Not Allowed");
			return;
		}

		const parsedUrl = parse(req.url, true);

		// Add request timeout to prevent hanging - increased for AI API calls
		req.setTimeout(120000); // 120 second timeout for AI responses

		// Handle request errors
		req.on("error", (err) => {
			console.error("❌ Request error:", err.message);
			if (!res.headersSent) {
				res.statusCode = 500;
				res.end("Internal Server Error");
			}
		});

		handle(req, res, parsedUrl).catch((err) => {
			console.error("❌ Handler error:", err.message);
			if (!res.headersSent) {
				res.statusCode = 500;
				res.end("Internal Server Error");
			}
		});
	});

	// Optimize server for AWS Load Balancer
	server.keepAliveTimeout = 160000; // 160 seconds (10s more than LB's 150s)
	server.headersTimeout = 165000; // 165 seconds (5s more than keepAliveTimeout)

	// Increase max connections
	server.maxConnections = 1000;

	// Enable TCP keepalive and handle hung connections
	server.on("connection", (socket) => {
		socket.setKeepAlive(true, 60000); // Enable keepalive, initial delay 60s
		socket.setTimeout(120000); // Increase timeout to 120s for AI API calls

		// Force close socket on timeout to prevent buildup
		socket.on("timeout", () => {
			console.warn("⚠️ Socket timeout - forcing close");
			socket.destroy();
		});

		// Handle errors gracefully
		socket.on("error", (err) => {
			console.error("❌ Socket error:", err.message);
			socket.destroy();
		});
	});

	server.listen(port, hostname, (err) => {
		if (err) throw err;
		console.log(`✅ Server ready on http://${hostname}:${port}`);
		console.log(`🔧 KeepAlive: ${server.keepAliveTimeout}ms`);
		console.log(`🔧 Headers Timeout: ${server.headersTimeout}ms`);
		console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
	});
});
