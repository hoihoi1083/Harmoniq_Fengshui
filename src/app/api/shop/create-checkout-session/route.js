import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Cart from "@/models/Cart";

export async function POST(request) {
	try {
		const session = await auth();
		if (!session?.user?.email) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Check if Stripe is configured
		if (!process.env.STRIPE_SECRET_KEY || !stripe) {
			console.error("STRIPE_SECRET_KEY is not configured");
			return NextResponse.json(
				{
					success: false,
					error: "Payment system not configured. Please add STRIPE_SECRET_KEY to environment variables.",
				},
				{ status: 500 }
			);
		}

		const headersList = await headers();
		const origin = headersList.get("origin") || process.env.NEXTAUTH_URL;

		const { items, shippingInfo, billingInfo, locale } =
			await request.json();

		if (!items || items.length === 0) {
			return NextResponse.json(
				{ success: false, error: "No items in order" },
				{ status: 400 }
			);
		}

		if (!shippingInfo || !shippingInfo.fullName || !shippingInfo.phone) {
			return NextResponse.json(
				{ success: false, error: "Missing shipping information" },
				{ status: 400 }
			);
		}

		await dbConnect();

		// Log incoming items for debugging
		console.log("📦 Checkout items received:", JSON.stringify(items, null, 2));

		// Verify products and build line items for Stripe
		const lineItems = [];
		let subtotal = 0;
		const orderItems = [];

		for (const item of items) {
			console.log(`🔍 Looking for product ID: ${item.productId}`);
			const product = await Product.findById(item.productId);
			console.log(`📝 Product found:`, product ? `${product.name.zh_TW} (Active: ${product.isActive})` : 'null');
			
			if (!product || !product.isActive) {
				console.error(`❌ Product ${item.productId} not found or inactive`);
				return NextResponse.json(
					{
						success: false,
						error: `Product ${item.productId} not found or inactive`,
					},
					{ status: 404 }
				);
			}

			if (!product.isDigital && product.stock < item.quantity) {
				return NextResponse.json(
					{
						success: false,
						error: `Insufficient stock for ${product.name.zh_TW}`,
					},
					{ status: 400 }
				);
			}

			// Calculate price with discount
			const discount = product.discount?.percentage || 0;
			const finalPrice = Math.round(product.price * (1 - discount / 100));
			subtotal += finalPrice * item.quantity;

			// Filter valid image URLs for Stripe
			const validImages =
				product.images
					?.filter(
						(img) =>
							img &&
							typeof img === "string" &&
							(img.startsWith("http://") ||
								img.startsWith("https://"))
					)
					?.slice(0, 1) || [];

			// Build Stripe line item
			const productData = {
				name: product.name.zh_TW || product.name["zh-CN"] || "Product",
				description:
					product.description.zh_TW ||
					product.description["zh-CN"] ||
					"",
			};

			// Only include images if we have valid URLs
			if (validImages.length > 0) {
				productData.images = validImages;
			}

			lineItems.push({
				price_data: {
					currency: product.currency?.toLowerCase() || "hkd",
					product_data: productData,
					unit_amount: finalPrice * 100, // Stripe expects amount in cents
				},
				quantity: item.quantity,
			});

			// Store order item details
			orderItems.push({
				productId: product._id,
				productName: product.name.zh_TW || product.name["zh-CN"],
				productImage: product.images?.[0] || "",
				quantity: item.quantity,
				price: product.price,
				isDigital: product.isDigital,
			});
		}

		// Create pending order in database
		const order = new Order({
			orderId: `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
			userId: session.user.email,
			userEmail: session.user.email,
			items: orderItems,
			subtotal,
			shippingFee: 0,
			totalAmount: subtotal,
			currency: "HKD",
			status: "pending",
			paymentStatus: "pending",
			shippingAddress: {
				fullName: shippingInfo.fullName,
				phone: shippingInfo.phone,
				address: shippingInfo.address,
				city: shippingInfo.city,
				province: shippingInfo.state || "",
				postalCode: shippingInfo.postalCode || "",
				country: shippingInfo.country,
			},
			billingAddress: billingInfo
				? {
						fullName: billingInfo.fullName,
						phone: billingInfo.phone || shippingInfo.phone,
						address: billingInfo.address,
						city: billingInfo.city,
						province: billingInfo.state || "",
						postalCode: billingInfo.postalCode || "",
						country: billingInfo.country,
					}
				: {
						fullName: shippingInfo.fullName,
						phone: shippingInfo.phone,
						address: shippingInfo.address,
						city: shippingInfo.city,
						province: shippingInfo.state || "",
						postalCode: shippingInfo.postalCode || "",
						country: shippingInfo.country,
					},
			notes: shippingInfo.notes || "",
		});

		await order.save();

		// Create Stripe checkout session
		const stripeSession = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: lineItems,
			mode: "payment",
			success_url: `${origin}/${locale}/shop/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
			cancel_url: `${origin}/${locale}/checkout?canceled=true`,
			metadata: {
				paymentType: "shop",
				orderId: order._id.toString(),
				userId: session.user.email,
			},
			customer_email: session.user.email,
			// Shipping info already collected on checkout page, no need to ask again
		});

		// Update order with Stripe session ID
		order.stripeSessionId = stripeSession.id;
		await order.save();

		return NextResponse.json({
			success: true,
			sessionId: stripeSession.id,
			url: stripeSession.url,
			orderId: order._id,
		});
	} catch (error) {
		console.error("Error creating checkout session:", error);
		console.error("Error stack:", error.stack);
		return NextResponse.json(
			{
				success: false,
				error: error.message || "Failed to create checkout session",
				details:
					process.env.NODE_ENV === "development"
						? error.stack
						: undefined,
			},
			{ status: 500 }
		);
	}
}
