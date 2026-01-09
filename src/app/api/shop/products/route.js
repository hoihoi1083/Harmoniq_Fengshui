import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Product from "@/models/Product";
import { getUserInfo } from "@/lib/session";

// GET all products (with filtering and search)
export async function GET(request) {
	try {
		await dbConnect();

		const { searchParams } = new URL(request.url);
		const category = searchParams.get("category");
		const element = searchParams.get("element");
		const tag = searchParams.get("tag");
		const search = searchParams.get("search");
		const featured = searchParams.get("featured");
		const minPrice = searchParams.get("minPrice");
		const maxPrice = searchParams.get("maxPrice");
		const inStock = searchParams.get("inStock");
		const limit = parseInt(searchParams.get("limit")) || 50;
		const page = parseInt(searchParams.get("page")) || 1;
		const skip = (page - 1) * limit;

		// Build query
		let query = { isActive: true };

		if (category) query.category = category;
		if (element) query.elementType = element;
		if (tag) query.tags = tag;
		if (featured === "true") query.isFeatured = true;
		if (inStock === "true") query.stock = { $gt: 0 };

		// Price range filter
		if (minPrice || maxPrice) {
			query.price = {};
			if (minPrice) query.price.$gte = parseFloat(minPrice);
			if (maxPrice) query.price.$lte = parseFloat(maxPrice);
		}

		// Search in name and description
		if (search) {
			query.$or = [
				{ "name.zh_TW": { $regex: search, $options: "i" } },
				{ "name.zh_CN": { $regex: search, $options: "i" } },
				{ "description.zh_TW": { $regex: search, $options: "i" } },
				{ "description.zh_CN": { $regex: search, $options: "i" } },
			];
		}

		// Get products
		const products = await Product.find(query)
			.sort({ isFeatured: -1, soldCount: -1, createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean();

		// Get total count for pagination
		const total = await Product.countDocuments(query);

		return NextResponse.json({
			success: true,
			data: {
				products,
				pagination: {
					page,
					limit,
					total,
					pages: Math.ceil(total / limit),
				},
			},
		});
	} catch (error) {
		console.error("Error fetching products:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

// POST create new product (admin only)
export async function POST(request) {
	try {
		await dbConnect();

		// Check if user is authenticated and is admin
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

		const body = await request.json();

		// Generate unique productId
		const productId = `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		// Map 'sold' to 'soldCount' if present (since sold is a virtual field)
		const productData = { ...body };
		if (productData.sold !== undefined) {
			productData.soldCount = productData.sold;
			delete productData.sold;
		}

		// Create product
		const product = new Product({
			productId,
			...productData,
		});

		await product.save();

		return NextResponse.json({
			success: true,
			data: product,
			message: "Product created successfully",
		});
	} catch (error) {
		console.error("Error creating product:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
