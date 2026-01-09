import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Cart from "@/models/Cart";
import { sendOrderConfirmationEmail } from "@/lib/emailService";

export async function POST(request) {
	const body = await request.text();
	const headersList = await headers();
	const signature = headersList.get("stripe-signature");

	let event;

	try {
		event = stripe.webhooks.constructEvent(
			body,
			signature,
			process.env.WHSEC
		);
	} catch (err) {
		console.error("Webhook signature verification failed:", err.message);
		return NextResponse.json(
			{ error: "Webhook signature verification failed" },
			{ status: 400 }
		);
	}

	await dbConnect();

	// Handle the event
	switch (event.type) {
		case "checkout.session.completed": {
			const session = event.data.object;
			const orderId = session.metadata.orderId;
			const userId = session.metadata.userId;

			try {
				// Update order status
				const order = await Order.findById(orderId);
				if (!order) {
					console.error("Order not found:", orderId);
					return NextResponse.json(
						{ error: "Order not found" },
						{ status: 404 }
					);
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
				if (userId) {
					const cartCleared = await Cart.findOneAndUpdate(
						{ userId },
						{ $set: { items: [] } },
						{ new: true }
					);
					console.log(
						"Cart cleared for user:",
						userId,
						cartCleared ? "✓" : "✗"
					);
				}

				// Send order confirmation email
				try {
					const locale =
						order.shippingAddress?.country === "中国" ||
						order.shippingAddress?.country === "China"
							? "zh-CN"
							: "zh-TW";
					await sendOrderConfirmationEmail(order, locale);
					console.log("📧 Order confirmation email sent");
				} catch (emailError) {
					console.error(
						"Failed to send confirmation email:",
						emailError
					);
					// Don't fail the webhook if email fails
				}

				console.log("Order payment successful:", orderId);
			} catch (error) {
				console.error("Error processing payment:", error);
				return NextResponse.json(
					{ error: "Error processing payment" },
					{ status: 500 }
				);
			}
			break;
		}

		case "checkout.session.expired": {
			const session = event.data.object;
			const orderId = session.metadata.orderId;

			try {
				const order = await Order.findById(orderId);
				if (order && order.paymentStatus === "pending") {
					order.status = "cancelled";
					order.paymentStatus = "failed";
					await order.save();
				}
			} catch (error) {
				console.error("Error handling expired session:", error);
			}
			break;
		}

		case "payment_intent.payment_failed": {
			const paymentIntent = event.data.object;
			console.log("Payment failed:", paymentIntent.id);
			break;
		}

		default:
			console.log(`Unhandled event type: ${event.type}`);
	}

	return NextResponse.json({ received: true });
}
