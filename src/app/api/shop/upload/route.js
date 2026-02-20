import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getUserInfo } from "@/lib/session";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function getS3Client() {
	const region = process.env.AWS_REGION || "ap-northeast-1";
	return new S3Client({
		region,
		credentials: process.env.AWS_ACCESS_KEY_ID
			? {
					accessKeyId: process.env.AWS_ACCESS_KEY_ID,
					secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
				}
			: undefined,
	});
}

export async function POST(request) {
	try {
		const userInfo = await getUserInfo();
		if (!userInfo) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const isAdmin =
			userInfo.userId === "harmoniqadmin" ||
			userInfo.email === "harmoniqadmin@harmoniq.com";

		if (!isAdmin) {
			return NextResponse.json(
				{ success: false, error: "Forbidden - Admin access required" },
				{ status: 403 }
			);
		}

		const formData = await request.formData();
		const file = formData.get("file");

		if (!file) {
			return NextResponse.json(
				{ success: false, error: "No file provided" },
				{ status: 400 }
			);
		}

		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		// Validate type and size
		const mimeType = file.type?.toLowerCase() || "";
		if (!ALLOWED_TYPES.includes(mimeType)) {
			return NextResponse.json(
				{ success: false, error: "Invalid file type. Use JPEG, PNG, WebP or GIF." },
				{ status: 400 }
			);
		}
		if (buffer.length > MAX_SIZE_BYTES) {
			return NextResponse.json(
				{ success: false, error: "File too large. Maximum size is 5 MB." },
				{ status: 400 }
			);
		}

		const timestamp = Date.now();
		const randomString = Math.random().toString(36).substring(2, 8);
		const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "jpg");
		const filename = `product_${timestamp}_${randomString}.${ext}`;
		const bucket = process.env.AWS_S3_BUCKET;
		const useS3 = bucket && process.env.AWS_ACCESS_KEY_ID;

		if (useS3) {
			const key = `shop/${filename}`;
			const client = getS3Client();
			await client.send(
				new PutObjectCommand({
					Bucket: bucket,
					Key: key,
					Body: buffer,
					ContentType: mimeType,
				})
			);

			const cdnUrl = process.env.AWS_S3_CDN_URL;
			const publicUrl = cdnUrl
				? `${cdnUrl.replace(/\/$/, "")}/${key}`
				: `https://${bucket}.s3.${process.env.AWS_REGION || "ap-northeast-1"}.amazonaws.com/${key}`;

			return NextResponse.json({
				success: true,
				url: publicUrl,
				message: "Image uploaded successfully",
			});
		}

		// Fallback: local filesystem (e.g. dev without S3 env)
		const uploadDir = path.join(process.cwd(), "public", "images", "shop");
		try {
			await mkdir(uploadDir, { recursive: true });
		} catch (e) {
			// ignore
		}
		const filepath = path.join(uploadDir, filename);
		await writeFile(filepath, buffer);
		const publicUrl = `/images/shop/${filename}`;

		// Optional: trigger PM2 reload so new file is visible (only when using local)
		fetch("http://localhost:3000/api/pm2-reload", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
		}).catch(() => {});

		return NextResponse.json({
			success: true,
			url: publicUrl,
			message: "Image uploaded successfully",
		});
	} catch (error) {
		console.error("Error uploading image:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
