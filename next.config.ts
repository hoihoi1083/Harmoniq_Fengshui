import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
	eslint: {
		ignoreDuringBuilds: true, // 忽略 eslint 检查
	},
	typescript: {
		ignoreBuildErrors: true, // 忽略 TypeScript 检查
	},
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
	// 🆕 Fix ByteString error with Chinese characters
	webpack: (config) => {
		config.externals = [...(config.externals || [])];
		return config;
	},
	// Force UTF-8 encoding
	compress: true,
	poweredByHeader: false,
	images: {
		unoptimized: true,
		remotePatterns: [
			{
				protocol: "https",
				hostname: "d3cbeloe0vn1bb.cloudfront.net",
				pathname: "/**",
			},
		],
	},
	reactStrictMode: false,
	output: "standalone", // Enable standalone output for Docker
	// experimental: {
	//   turbo: {
	//     resolveAlias: {
	//       html2canvas: "html2canvas-pro",
	//     },
	//   },
	// },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
