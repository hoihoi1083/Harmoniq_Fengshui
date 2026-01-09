// Script to create the admin account
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env" });

async function createAdminAccount() {
	try {
		// Connect to MongoDB
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("✅ Connected to MongoDB");

		// Import User model after connection
		const User = require("../src/models/User").default;

		const adminUserId = "harmoniqadmin";
		const adminEmail = "harmoniqadmin@harmoniq.com";
		const adminPassword = "harmoniq888";

		// Check if admin already exists
		let admin = await User.findOne({ userId: adminUserId });

		if (admin) {
			console.log("⚠️  Admin account already exists. Updating password...");
			
			// Hash the password
			const hashedPassword = await bcrypt.hash(adminPassword, 10);
			
			// Update admin account
			admin.password = hashedPassword;
			admin.email = adminEmail;
			admin.provider = "credentials";
			await admin.save();
			
			console.log("✅ Admin password updated successfully!");
		} else {
			console.log("Creating new admin account...");
			
			// Hash the password
			const hashedPassword = await bcrypt.hash(adminPassword, 10);
			
			// Create new admin user
			admin = new User({
				userId: adminUserId,
				email: adminEmail,
				password: hashedPassword,
				name: "HarmoniQ Admin",
				provider: "credentials",
				gender: "male",
				birthDateTime: new Date(1990, 0, 1, 12, 0, 0),
				isLock: false,
			});
			
			await admin.save();
			console.log("✅ Admin account created successfully!");
		}

		console.log("\n📝 Admin Account Details:");
		console.log("  Username: harmoniqadmin");
		console.log("  Email: harmoniqadmin@harmoniq.com");
		console.log("  Password: harmoniq888");
		console.log("\n🔐 Login URL: http://localhost:3000/zh-TW/auth/login");
		console.log("📊 Admin Panel: http://localhost:3000/zh-TW/admin/shop");

		process.exit(0);
	} catch (error) {
		console.error("❌ Error:", error.message);
		process.exit(1);
	}
}

createAdminAccount();
