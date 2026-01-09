import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getUserInfo } from "@/lib/session";

export async function POST(request) {
	try {
		// Check if user is the admin account
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

		// Convert file to buffer
		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		// Create unique filename
		const timestamp = Date.now();
		const randomString = Math.random().toString(36).substring(2, 8);
		const fileExtension = file.name.split(".").pop();
		const filename = `product_${timestamp}_${randomString}.${fileExtension}`;

		// Create upload directory if it doesn't exist
		const uploadDir = path.join(process.cwd(), "public", "images", "shop");
		try {
			await mkdir(uploadDir, { recursive: true });
		} catch (error) {
			// Directory might already exist, ignore error
		}

		// Save file
		const filepath = path.join(uploadDir, filename);
		await writeFile(filepath, buffer);

		// Return the public URL path
		const publicUrl = `/images/shop/${filename}`;

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
