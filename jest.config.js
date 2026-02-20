const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const customConfig = {
	testEnvironment: "node",
	roots: ["<rootDir>/src"],
	testMatch: ["**/__tests__/**/*.test.js", "**/__tests__/**/*.test.ts"],
	watchman: false,
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
	},
	collectCoverageFrom: [
		"src/lib/shopCheckout.js",
		"src/lib/productPrice.js",
		"src/app/api/shop/**/*.js",
	],
	coverageDirectory: "coverage",
	verbose: true,
};

module.exports = createJestConfig(customConfig);
