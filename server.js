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
		const parsedUrl = parse(req.url, true);
		handle(req, res, parsedUrl);
	});

	// Optimize server for AWS Load Balancer
	server.keepAliveTimeout = 160000; // 160 seconds (10s more than LB's 150s)
	server.headersTimeout = 165000; // 165 seconds (5s more than keepAliveTimeout)

	// Increase max connections
	server.maxConnections = 1000;

	// Enable TCP keepalive
	server.on("connection", (socket) => {
		socket.setKeepAlive(true, 60000); // Enable keepalive, initial delay 60s
		socket.setTimeout(180000); // Socket timeout 180s
	});

	server.listen(port, hostname, (err) => {
		if (err) throw err;
		console.log(`✅ Server ready on http://${hostname}:${port}`);
		console.log(`🔧 KeepAlive: ${server.keepAliveTimeout}ms`);
		console.log(`🔧 Headers Timeout: ${server.headersTimeout}ms`);
		console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
	});
});
