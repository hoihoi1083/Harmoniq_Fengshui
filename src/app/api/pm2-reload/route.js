import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// This endpoint triggers PM2 reload to make newly uploaded images accessible
// Called automatically after shop image uploads
export async function POST(request) {
	try {
		// Execute PM2 reload command
		await execAsync("pm2 reload fengshui-app --update-env");
		
		return NextResponse.json({
			success: true,
			message: "PM2 reloaded successfully",
		});
	} catch (error) {
		console.error("PM2 reload failed:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

// Mark this route as dynamic to avoid prerendering
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
