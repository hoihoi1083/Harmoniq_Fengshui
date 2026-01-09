import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import CheckoutSession from "@/models/CheckoutSession";
const endpointSecret = process.env.WHSEC;
export async function POST(request) {
	let event;
	const text = await request.text();
	const headersList = await headers();
	const sig = headersList.get("stripe-signature");

	try {
		event = stripe.webhooks.constructEvent(text, sig, endpointSecret);
		console.log("Webhook received:", event.type, "ID:", event.id);

		if (
			event.type === "checkout.session.completed" ||
			event.type === "checkout.session.async_payment_succeeded"
		) {
			// Process webhook with timeout protection
			try {
				await Promise.race([
					fulfillCheckout(event.data.object),
					new Promise((_, reject) =>
						setTimeout(
							() => reject(new Error("Webhook timeout")),
							25000
						)
					),
				]);
				console.log(
					"Webhook processed successfully for:",
					event.data.object.id
				);
			} catch (fulfillError) {
				console.error(
					"Webhook fulfillment error:",
					fulfillError.message
				);
				// Still return success to Stripe to avoid retries
				// Log the error for monitoring
			}
		}
	} catch (err) {
		console.error("Webhook signature verification failed:", err.message);
		return new Response(`Webhook error: ${err.message}`, {
			status: 400,
		});
	}

	return new Response("Success!", {
		status: 200,
	});
}

async function fulfillCheckout(session) {
	const sessionId = session.id;

	try {
		await dbConnect();

		// Check if already fulfilled to prevent duplicate processing
		const existingSession = await CheckoutSession.findOne({ sessionId });
		if (existingSession && existingSession.isFullfilled) {
			console.log("Session already fulfilled:", sessionId);
			return;
		}

		// Retrieve the Checkout Session from the API with line_items expanded
		const checkoutSession = await stripe.checkout.sessions.retrieve(
			sessionId,
			{
				expand: ["line_items"],
			}
		);

		console.log("Processing payment:", {
			sessionId,
			paymentStatus: checkoutSession.payment_status,
			paymentType:
				session.metadata?.paymentType || session.metadata?.type,
		});

		// Check the Checkout Session's payment_status property
		if (checkoutSession.payment_status !== "unpaid") {
			const paymentType =
				session.metadata?.paymentType || session.metadata?.type;

			if (paymentType === "fortune") {
				console.log("Fortune payment completed:", {
					sessionId,
					concern: session.metadata?.concern,
				});

				// Use upsert to prevent duplicate creation
				await CheckoutSession.findOneAndUpdate(
					{ sessionId },
					{
						sessionId,
						isFullfilled: true,
						paymentType: "fortune",
						concern: session.metadata?.concern,
						completedAt: new Date(),
					},
					{ upsert: true, new: true }
				);
			} else if (paymentType === "couple") {
				console.log("Couple payment completed:", sessionId);

				await CheckoutSession.findOneAndUpdate(
					{ sessionId },
					{
						sessionId,
						isFullfilled: true,
						paymentType: "couple",
					},
					{ upsert: true, new: true }
				);
			} else if (paymentType === "shop") {
				console.log("Shop payment completed:", sessionId);

				const orderId = session.metadata.orderId;
				if (!orderId) {
					console.error("No orderId found in metadata for shop payment");
					return;
				}

				const Order = (await import("@/models/Order")).default;
				const Product = (await import("@/models/Product")).default;
				const Cart = (await import("@/models/Cart")).default;
				const { sendOrderConfirmationEmail } = await import("@/lib/emailService");

				// Update order status
				const order = await Order.findById(orderId);
				if (!order) {
					console.error("Order not found:", orderId);
					return;
				}

				order.stripePaymentIntentId = session.payment_intent;
				order.paymentStatus = "paid";
				order.status = "paid";
				order.paidAt = new Date();
				await order.save();

				// Update product stock for physical items
				for (const item of order.items) {
					if (!item.isDigital) {
						const product = await Product.findById(item.productId);
						if (product) {
							product.stock -= item.quantity;
							await product.save();
						}
					}
				}

				// Clear user's cart
				const userId = session.metadata.userId;
				if (userId) {
					await Cart.findOneAndUpdate(
						{ userId },
						{ $set: { items: [] } },
						{ new: true }
					);
					console.log("Cart cleared for user:", userId);
				}

				// Send order confirmation email
				try {
					const locale = order.shippingAddress?.country === "中国" || order.shippingAddress?.country === "China" ? "zh-CN" : "zh-TW";
					await sendOrderConfirmationEmail(order, locale);
					console.log("📧 Order confirmation email sent");
				} catch (emailError) {
					console.error("Failed to send confirmation email:", emailError);
				}

				// Record fulfillment
				await CheckoutSession.findOneAndUpdate(
					{ sessionId },
					{
						sessionId,
						isFullfilled: true,
						paymentType: "shop",
						completedAt: new Date(),
					},
					{ upsert: true, new: true }
				);

				console.log("Shop order payment successful:", orderId);
			} else {
				// Handle regular user payments (expert188, expert88, etc.)
				const userId = session.metadata.userId;
				if (!userId) {
					console.error(
						"No userId found in metadata for non-fortune payment"
					);
					return;
				}

				// Update user status with session tracking for fresh content generation
				const user = await User.findOne({ userId });
				if (user) {
					user.isLock = false;
					user.genStatus = "waiting";
					// Clear previous session data to force fresh generation
					user.lastPaymentSessionId = sessionId;
					user.lastPaymentAt = new Date();
					await user.save();
					console.log(
						"🆕 User status updated for fresh content generation:",
						{
							userId,
							sessionId,
							genStatus: "waiting",
						}
					);
				}

				// Record fulfillment status
				await CheckoutSession.findOneAndUpdate(
					{ sessionId },
					{
						sessionId,
						isFullfilled: true,
						paymentType: paymentType || "regular",
						completedAt: new Date(),
					},
					{ upsert: true, new: true }
				);
			}

			console.log("Webhook fulfillment completed for:", sessionId);
		}
	} catch (error) {
		console.error("Error in fulfillCheckout:", error.message);
		throw error; // Re-throw to be caught by the timeout handler
	}
}
