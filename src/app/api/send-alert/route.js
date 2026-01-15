import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "hoihoi1083@gmail.com";

export async function POST(request) {
	try {
		const body = await request.json();

		if (!body.subject || !body.message) {
			return NextResponse.json(
				{ success: false, error: "Missing subject or message" },
				{ status: 400 }
			);
		}

		const alertHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>HarmoniqFengShui System Alert</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #f8f9fa;
        }
        .alert-header { 
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            padding: 20px; 
            border-radius: 8px 8px 0 0; 
            text-align: center;
        }
        .alert-header h2 {
            margin: 0;
            color: #ffffff;
            font-size: 24px;
        }
        .alert-body { 
            background-color: #ffffff; 
            padding: 25px; 
            border: 2px solid #dc3545;
            border-top: none;
            border-radius: 0 0 8px 8px;
        }
        .alert-message {
            background-color: #f8f9fa;
            padding: 15px;
            border-left: 4px solid #dc3545;
            margin: 15px 0;
            font-family: 'Courier New', monospace;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .footer { 
            margin-top: 20px; 
            padding: 15px; 
            background-color: #f8f9fa; 
            border-radius: 8px; 
            font-size: 12px; 
            color: #6c757d; 
            text-align: center;
        }
        .priority {
            display: inline-block;
            padding: 5px 12px;
            background-color: #dc3545;
            color: white;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="alert-header">
        <h2>🚨 System Alert</h2>
    </div>
    
    <div class="alert-body">
        <h3 style="margin-top: 0; color: #dc3545;">${body.subject}</h3>
        
        <div class="alert-message">${body.message}</div>
        
        ${body.priority ? '<span class="priority">HIGH PRIORITY</span>' : ""}
        
        <p style="margin-top: 20px; font-size: 14px; color: #6c757d;">
            <strong>Server:</strong> harmoniqfengshui.com<br>
            <strong>Time:</strong> ${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}
        </p>
    </div>
    
    <div class="footer">
        <p>This is an automated alert from HarmoniqFengShui monitoring system</p>
        <p>Please check the server immediately if this is a critical issue</p>
    </div>
</body>
</html>
        `;

		const res = await resend.emails.send({
			from: "HarmoniqFengShui Alerts <alerts@harmoniqfengshui.com>",
			to: ADMIN_EMAIL,
			subject: `🚨 ${body.subject}`,
			html: alertHTML,
		});

		console.log("✅ Alert email sent:", {
			id: res?.data?.id,
			subject: body.subject,
			timestamp: new Date().toISOString(),
		});

		return NextResponse.json({
			success: true,
			id: res?.data?.id,
		});
	} catch (error) {
		console.error("❌ Alert email error:", error.message);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
