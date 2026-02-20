import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Product from "@/models/Product";
import { getUserInfo } from "@/lib/session";
import { unlink } from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

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

/** Get S3 object key from a full URL (CloudFront or S3). Returns null if not an S3/CloudFront URL. */
function getS3KeyFromImageUrl(imageUrl) {
	if (!imageUrl || typeof imageUrl !== "string") return null;
	const trimmed = imageUrl.trim();
	if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) return null;
	try {
		const u = new URL(trimmed);
		const pathname = u.pathname || "";
		const key = pathname.startsWith("/") ? pathname.slice(1) : pathname;
		return key || null;
	} catch {
		return null;
	}
}

export const dynamic = "force-dynamic";

// GET single product by ID
export async function GET(request, { params }) {
	try {
		await dbConnect();

		const { productId } = await params;

		// Validate ObjectId
		if (!mongoose.Types.ObjectId.isValid(productId)) {
			return NextResponse.json(
				{ success: false, error: "Invalid product ID" },
				{ status: 400 }
			);
		}

		const product = await Product.findById(productId).lean();

		if (!product) {
			return NextResponse.json(
				{ success: false, error: "Product not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			data: product,
		});
	} catch (error) {
		console.error("Error fetching product:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

// PUT update product (admin only)
export async function PUT(request, { params }) {
	try {
		await dbConnect();

		// Check authentication
		const userInfo = await getUserInfo();
		if (!userInfo) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Check if user is the admin account
		const isAdmin = userInfo.userId === "harmoniqadmin" || 
		                userInfo.email === "harmoniqadmin@harmoniq.com";
		
		if (!isAdmin) {
			return NextResponse.json(
				{ success: false, error: "Forbidden - Admin access required" },
				{ status: 403 }
			);
		}

		const { productId } = await params;
		const body = await request.json();

		console.log("Update request body:", body);

		// Validate ObjectId
		if (!mongoose.Types.ObjectId.isValid(productId)) {
			return NextResponse.json(
				{ success: false, error: "Invalid product ID" },
				{ status: 400 }
			);
		}

		// Map 'sold' to 'soldCount' if present (since sold is a virtual field)
		const updateData = { ...body };
		if (updateData.sold !== undefined) {
			console.log("Mapping sold to soldCount:", updateData.sold);
			updateData.soldCount = updateData.sold;
			delete updateData.sold;
		}

		console.log("Final update data:", updateData);

		const product = await Product.findByIdAndUpdate(
			productId,
			{ ...updateData, updatedAt: Date.now() },
			{ new: true, runValidators: true }
		);

		console.log("Updated product soldCount:", product.soldCount);

		if (!product) {
			return NextResponse.json(
				{ success: false, error: "Product not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			data: product,
			message: "Product updated successfully",
		});
	} catch (error) {
		console.error("Error updating product:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

// DELETE product (admin only - soft delete by setting isActive to false)
export async function DELETE(request, { params }) {
	try {
		await dbConnect();

		// Check authentication
		const userInfo = await getUserInfo();
		if (!userInfo) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Check if user is the admin account
		const isAdmin = userInfo.userId === "harmoniqadmin" || 
		                userInfo.email === "harmoniqadmin@harmoniq.com";
		
		if (!isAdmin) {
			return NextResponse.json(
				{ success: false, error: "Forbidden - Admin access required" },
				{ status: 403 }
			);
		}

		const { productId } = await params;

		// Validate ObjectId
		if (!mongoose.Types.ObjectId.isValid(productId)) {
			return NextResponse.json(
				{ success: false, error: "Invalid product ID" },
				{ status: 400 }
			);
		}

		// Get product first to retrieve image URLs
		const product = await Product.findById(productId);

		if (!product) {
			return NextResponse.json(
				{ success: false, error: "Product not found" },
				{ status: 404 }
			);
		}

		// Delete associated image files (S3 or local filesystem)
		const bucket = process.env.AWS_S3_BUCKET;
		const useS3 = bucket && process.env.AWS_ACCESS_KEY_ID;
		if (product.images && product.images.length > 0) {
			for (const imageUrl of product.images) {
				const s3Key = getS3KeyFromImageUrl(imageUrl);
				if (useS3 && s3Key) {
					try {
						const client = getS3Client();
						await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: s3Key }));
						console.log(`✅ Deleted S3 object: ${s3Key}`);
					} catch (error) {
						console.warn(`⚠️ Could not delete S3 object: ${imageUrl}`, error.message);
					}
				} else if (imageUrl.startsWith("/images/shop/")) {
					try {
						const filename = imageUrl.split("/").pop();
						const filepath = path.join(process.cwd(), "public", "images", "shop", filename);
						await unlink(filepath);
						console.log(`✅ Deleted image file: ${filename}`);
					} catch (error) {
						console.warn(`⚠️ Could not delete image file: ${imageUrl}`, error.message);
					}
				}
			}
		}

		// Soft delete the product
		await Product.findByIdAndUpdate(
			productId,
			{ isActive: false, updatedAt: Date.now() },
			{ new: true }
		);

		return NextResponse.json({
			success: true,
			message: "Product and associated images deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting product:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
