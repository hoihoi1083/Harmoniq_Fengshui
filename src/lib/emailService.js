import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail(order, locale = "zh-TW") {
	try {
		const isZhCN = locale === "zh-CN";

		const itemsHTML = order.items
			.map(
				(item) => `
			<tr>
				<td style="padding: 12px; border-bottom: 1px solid #e9ecef;">
					${item.productName || "Product"}
				</td>
				<td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;">
					${item.quantity}
				</td>
				<td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">
					${order.currency} $${(item.price * item.quantity).toFixed(2)}
				</td>
			</tr>
		`
			)
			.join("");

		const emailHTML = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<title>${isZhCN ? "订单确认" : "訂單確認"}</title>
		</head>
		<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
			
			<div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
				
				<!-- Header -->
				<div style="background: linear-gradient(135deg, #1C312E 0%, #1A3B2C 100%); padding: 30px 20px; text-align: center;">
					<h1 style="color: #ffffff; margin: 0; font-size: 28px;">
						${isZhCN ? "🎉 支付成功！" : "🎉 支付成功！"}
					</h1>
					<p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
						${isZhCN ? "感谢您的购买" : "感謝您的購買"}
					</p>
				</div>
				
				<!-- Order Info -->
				<div style="padding: 30px 20px;">
					<div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
						<h2 style="margin: 0 0 15px 0; color: #1C312E; font-size: 18px;">
							📦 ${isZhCN ? "订单信息" : "訂單資訊"}
						</h2>
						<table style="width: 100%; border-collapse: collapse;">
							<tr>
								<td style="padding: 8px 0; color: #6c757d; width: 120px;">
									${isZhCN ? "订单号：" : "訂單號："}
								</td>
								<td style="padding: 8px 0; font-weight: 600; color: #1C312E;">
									${order.orderId}
								</td>
							</tr>
							<tr>
								<td style="padding: 8px 0; color: #6c757d;">
									${isZhCN ? "下单时间：" : "下單時間："}
								</td>
								<td style="padding: 8px 0; color: #495057;">
									${new Date(order.createdAt).toLocaleString("zh-TW")}
								</td>
							</tr>
							<tr>
								<td style="padding: 8px 0; color: #6c757d;">
									${isZhCN ? "支付状态：" : "支付狀態："}
								</td>
								<td style="padding: 8px 0;">
									<span style="background-color: #d4edda; color: #155724; padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: 600;">
										✓ ${isZhCN ? "已支付" : "已支付"}
									</span>
								</td>
							</tr>
						</table>
					</div>
					
					<!-- Items -->
					<h2 style="margin: 0 0 15px 0; color: #1C312E; font-size: 18px;">
						🛍️ ${isZhCN ? "订单商品" : "訂單商品"}
					</h2>
					<table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden;">
						<thead>
							<tr style="background-color: #f8f9fa;">
								<th style="padding: 12px; text-align: left; font-weight: 600; color: #495057; border-bottom: 2px solid #dee2e6;">
									${isZhCN ? "商品" : "商品"}
								</th>
								<th style="padding: 12px; text-align: center; font-weight: 600; color: #495057; border-bottom: 2px solid #dee2e6;">
									${isZhCN ? "数量" : "數量"}
								</th>
								<th style="padding: 12px; text-align: right; font-weight: 600; color: #495057; border-bottom: 2px solid #dee2e6;">
									${isZhCN ? "价格" : "價格"}
								</th>
							</tr>
						</thead>
						<tbody>
							${itemsHTML}
						</tbody>
					</table>
					
					<!-- Total -->
					<div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
						<table style="width: 100%;">
							<tr>
								<td style="padding: 8px 0; color: #6c757d;">
									${isZhCN ? "小计：" : "小計："}
								</td>
								<td style="padding: 8px 0; text-align: right; color: #495057;">
									${order.currency} $${order.subtotal.toFixed(2)}
								</td>
							</tr>
							<tr>
								<td style="padding: 8px 0; color: #6c757d;">
									${isZhCN ? "运费：" : "運費："}
								</td>
								<td style="padding: 8px 0; text-align: right; color: #495057;">
									${isZhCN ? "免费" : "免費"}
								</td>
							</tr>
							<tr style="border-top: 2px solid #dee2e6;">
								<td style="padding: 12px 0 0 0; font-size: 18px; font-weight: 700; color: #1C312E;">
									${isZhCN ? "总计：" : "總計："}
								</td>
								<td style="padding: 12px 0 0 0; text-align: right; font-size: 20px; font-weight: 700; color: #1C312E;">
									${order.currency} $${order.totalAmount.toFixed(2)}
								</td>
							</tr>
						</table>
					</div>
					
					<!-- Shipping Address -->
					<div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
						<h3 style="margin: 0 0 12px 0; color: #1C312E; font-size: 16px;">
							📍 ${isZhCN ? "配送地址" : "配送地址"}
						</h3>
						<p style="margin: 0; line-height: 1.8; color: #495057;">
							${order.shippingAddress.fullName}<br>
							${order.shippingAddress.phone}<br>
							${order.shippingAddress.address}<br>
							${order.shippingAddress.city}${order.shippingAddress.province ? ", " + order.shippingAddress.province : ""}<br>
							${order.shippingAddress.country}
						</p>
					</div>
					
					<!-- Next Steps -->
					<div style="background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); padding: 20px; border-radius: 8px; margin-bottom: 25px;">
						<h3 style="margin: 0 0 12px 0; color: #1C312E; font-size: 16px;">
							📋 ${isZhCN ? "接下来" : "接下來"}
						</h3>
						<ul style="margin: 0; padding-left: 20px; color: #495057; line-height: 1.8;">
							<li>${isZhCN ? "我们会尽快处理您的订单" : "我們會盡快處理您的訂單"}</li>
							<li>${isZhCN ? "订单发货后，您将收到物流跟踪信息" : "訂單發貨後，您將收到物流跟蹤資訊"}</li>
							<li>${isZhCN ? "如有任何问题，请随时联系我们" : "如有任何問題，請隨時聯繫我們"}</li>
						</ul>
					</div>
					
					<!-- CTA Button -->
					<div style="text-align: center; margin: 30px 0;">
						<a href="${process.env.NEXTAUTH_URL}/${locale}/orders/${order._id}" 
						   style="display: inline-block; background: linear-gradient(135deg, #1C312E 0%, #1A3B2C 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(28,49,46,0.3);">
							${isZhCN ? "查看订单详情" : "查看訂單詳情"} →
						</a>
					</div>
				</div>
				
				<!-- Footer -->
				<div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;">
					<p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">
						${isZhCN ? "感谢您选择 HarmoniqFengShui" : "感謝您選擇 HarmoniqFengShui"}
					</p>
					<p style="margin: 0; color: #adb5bd; font-size: 12px;">
						${isZhCN ? "本邮件由系统自动发送，请勿直接回复" : "本郵件由系統自動發送，請勿直接回覆"}
					</p>
				</div>
			</div>
			
		</body>
		</html>
		`;

		const result = await resend.emails.send({
			from: "HarmoniqFengShui <noreply@harmoniqfengshui.com>",
			to: order.userEmail,
			subject: `${isZhCN ? "订单确认" : "訂單確認"} - ${order.orderId}`,
			html: emailHTML,
		});

		console.log("✅ Order confirmation email sent:", result);
		return { success: true, data: result };
	} catch (error) {
		console.error("❌ Failed to send order confirmation email:", error);
		return { success: false, error: error.message };
	}
}

export async function sendShippingNotificationEmail(
	order,
	trackingNumber,
	locale = "zh-TW"
) {
	try {
		const isZhCN = locale === "zh-CN";

		const emailHTML = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<title>${isZhCN ? "订单已发货" : "訂單已發貨"}</title>
		</head>
		<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
			
			<div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
				
				<!-- Header -->
				<div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 30px 20px; text-align: center;">
					<h1 style="color: #ffffff; margin: 0; font-size: 28px;">
						🚚 ${isZhCN ? "您的订单已发货！" : "您的訂單已發貨！"}
					</h1>
					<p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
						${isZhCN ? "订单正在路上" : "訂單正在路上"}
					</p>
				</div>
				
				<!-- Content -->
				<div style="padding: 30px 20px;">
					<div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
						<h2 style="margin: 0 0 10px 0; color: #1C312E; font-size: 18px;">
							${isZhCN ? "订单号" : "訂單號"}
						</h2>
						<p style="margin: 0; font-size: 20px; font-weight: 700; color: #1C312E;">
							${order.orderId}
						</p>
					</div>
					
					${
						trackingNumber
							? `
					<div style="background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%); padding: 20px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
						<h3 style="margin: 0 0 10px 0; color: #1C312E; font-size: 16px;">
							📦 ${isZhCN ? "物流追踪号" : "物流追蹤號"}
						</h3>
						<p style="margin: 0; font-size: 24px; font-weight: 700; color: #0369a1; letter-spacing: 2px;">
							${trackingNumber}
						</p>
					</div>
					`
							: ""
					}
					
					<div style="text-align: center; margin: 30px 0;">
						<a href="${process.env.NEXTAUTH_URL}/${locale}/orders/${order._id}" 
						   style="display: inline-block; background: linear-gradient(135deg, #1C312E 0%, #1A3B2C 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(28,49,46,0.3);">
							${isZhCN ? "查看物流详情" : "查看物流詳情"} →
						</a>
					</div>
					
					<p style="text-align: center; color: #6c757d; font-size: 14px; margin: 20px 0;">
						${isZhCN ? "预计送达时间：3-7个工作日" : "預計送達時間：3-7個工作日"}
					</p>
				</div>
				
				<!-- Footer -->
				<div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;">
					<p style="margin: 0; color: #6c757d; font-size: 14px;">
						${isZhCN ? "感谢您的购买" : "感謝您的購買"}
					</p>
				</div>
			</div>
			
		</body>
		</html>
		`;

		const result = await resend.emails.send({
			from: "HarmoniqFengShui <noreply@harmoniqfengshui.com>",
			to: order.userEmail,
			subject: `${isZhCN ? "订单已发货" : "訂單已發貨"} - ${order.orderId}`,
			html: emailHTML,
		});

		console.log("✅ Shipping notification email sent:", result);
		return { success: true, data: result };
	} catch (error) {
		console.error("❌ Failed to send shipping notification:", error);
		return { success: false, error: error.message };
	}
}
