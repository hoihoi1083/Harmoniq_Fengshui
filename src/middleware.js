import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { getToken } from "next-auth/jwt";
import { routing } from "./i18n/routing";

// Allowed origins for CORS
const allowedOrigins = [
        'https://www.harmoniqfengshui.com',
        'capacitor://localhost',
        'http://localhost:3000',
        'http://localhost:3001',
];

// Create the internationalization middleware
const intlMiddleware = createMiddleware(routing);

export default async function middleware(request) {
        const { pathname } = request.nextUrl;
        
        // Handle CORS for API routes
        if (pathname.startsWith('/api')) {
                const origin = request.headers.get('origin');
                
                // Handle preflight OPTIONS request
                if (request.method === 'OPTIONS') {
                        return new NextResponse(null, {
                                status: 200,
                                headers: {
                                        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
                                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                                        'Access-Control-Max-Age': '86400',
                                },
                        });
                }
                
                // Continue with the request and add CORS headers to response
                const response = NextResponse.next();
                
                if (origin && allowedOrigins.includes(origin)) {
                        response.headers.set('Access-Control-Allow-Origin', origin);
                        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
                }
                
                return response;
        }
	// Skip auth check for public routes
	const isPublicRoute =
		pathname === "/" ||
		pathname.startsWith("/auth") ||
		pathname.startsWith("/api") ||
		pathname.startsWith("/_next") ||
		pathname.startsWith("/static") ||
		pathname.includes(".") ||
		pathname.includes("/auth/login") ||
		pathname === "/favicon.ico" ||
		pathname.includes("/price") || // 添加 price 頁面為公共路由
		pathname.includes("/customer") || // 允許 customer 頁面
		pathname.includes("/free"); // 允許 free 頁面

	// Handle internationalization first
	const response = intlMiddleware(request);
	// If it's a public route, no need to check authentication
	if (isPublicRoute) {
		return response;
	}

	// Check if the user is authenticated
	const token = await getToken({
		secureCookie: process.env.NODE_ENV !== "development",
		req: request,
		secret: process.env.NEXTAUTH_SECRET,
	});
	// If not authenticated, redirect to login page
	if (!token) {
		//console.log('pathname', request.nextUrl.pathname);
		const referer = request.headers.get("referer") || "";
		//console.log('request.url', request.nextUrl, referer);
		// // 检查来源是否已经是登录页，避免循环重定向
		if (referer.includes("/auth/login")) {
			return response;
		}
		//允许目标页面是首页、隐私条款等页面
		if (
			!request.nextUrl.pathname.includes("/design") &&
			!request.nextUrl.pathname.includes("/report")
		) {
			return response;
		}

		const locale = referer.indexOf("zh-CN") >= 0 ? "zh-CN" : "zh-TW";
		// ?callbackUrl=${request.nextUrl.pathname}

		return NextResponse.redirect(
			new URL(
				`/${locale}/auth/login?callbackUrl=${request.nextUrl.pathname}`,
				request.url
			)
		);
	}
	return response;
}

export const config = {
        // Match all paths including API routes
        matcher: [
                '/((?!_next|.*\\..*|favicon.ico).*)',
                '/api/:path*',
        ],
};