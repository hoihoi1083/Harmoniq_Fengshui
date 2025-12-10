import NextAuth, { customFetch } from "next-auth";
import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { createUserIfNotExists } from "@/lib/userUtils";
import { verifyPassword } from "@/lib/password";

export const { handlers, signIn, signOut, auth } = NextAuth({
	trustHost: true,
	// Fix for Chinese character encoding in JWT
	cookies: {
		sessionToken: {
			name: `next-auth.session-token`,
			options: {
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				secure: process.env.NODE_ENV === "production",
			},
		},
	},
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		}),
		AppleProvider({
			clientId: process.env.APPLE_ID as string,
			clientSecret: process.env.APPLE_CLIENT_SECRET as string,
		}),
		CredentialsProvider({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				try {
					await dbConnect();

					// Find user by email
					const user = await User.findOne({
						$or: [
							{ email: credentials.email },
							{ userId: credentials.email },
						],
						provider: "credentials",
					});

					if (!user || !user.password) {
						return null;
					}

					// Verify password
					const isPasswordValid = await verifyPassword(
						credentials.password as string,
						user.password
					);

					if (!isPasswordValid) {
						return null;
					}

					// Return user object
					return {
						id: user._id.toString(),
						email: user.email,
						name: user.name,
						userId: user.userId,
					};
				} catch (error) {
					console.error("Authentication error:", error);
					return null;
				}
			},
		}),
	],
	secret: process.env.NEXTAUTH_SECRET as string,
	callbacks: {
		async signIn({ user, account, profile }) {
			try {
				const userId = user.email;
				if (!userId) return false;

				// For OAuth providers, create user if not exists
				if (
					account?.provider === "google" ||
					account?.provider === "apple"
				) {
					await createUserIfNotExists(userId, user.email);
				}

				return true;
			} catch (error) {
				console.error("Error in signIn callback:", error);
				return false;
			}
		},
		async jwt({ token, user, account }) {
			if (account && user) {
				token.accessToken = account.access_token;
				token.id = user.id;
				token.userId = (user as any).userId || user.email;
			}
			return token;
		},
		async session({ session, token }) {
			if (token && session.user) {
				(session.user as any) = {
					...session.user,
					id: token.sub,
					userId: token.userId || session.user.email,
				};
			}
			return session;
		},
	},
	// Custom JWT encode/decode to handle UTF-8 properly
	jwt: {
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	pages: {
		signIn: "/auth/login",
	},
} satisfies NextAuthConfig);
