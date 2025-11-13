// Script to fix userEmail in ChatHistory records
// Run with: node fix-anonymous-emails.js

const mongoose = require("mongoose");

// MongoDB connection string - update if needed
const MONGODB_URI =
	process.env.MONGODB_URI || "mongodb://localhost:27017/your-database-name";

async function fixAnonymousEmails() {
	try {
		await mongoose.connect(MONGODB_URI);
		console.log("✅ Connected to MongoDB");

		const ChatHistory = mongoose.connection.collection("chathistories");

		// Find all records where userEmail is "anonymous" but userId looks like an email
		const result = await ChatHistory.updateMany(
			{
				userEmail: "anonymous",
				userId: { $regex: "@" }, // userId contains @ (is an email)
			},
			[
				{
					$set: {
						userEmail: "$userId", // Copy userId to userEmail
					},
				},
			]
		);

		console.log(`✅ Updated ${result.modifiedCount} records`);
		console.log(`   Matched ${result.matchedCount} records`);

		// Verify the fix
		const fixed = await ChatHistory.find({
			userId: "hoihoi1083@gmail.com",
		}).toArray();

		console.log(`\n📊 Records for hoihoi1083@gmail.com:`);
		fixed.forEach((record) => {
			console.log(
				`   - ${record.conversationId}: userEmail="${record.userEmail}"`
			);
		});

		await mongoose.disconnect();
		console.log("\n✅ Done!");
	} catch (error) {
		console.error("❌ Error:", error);
		process.exit(1);
	}
}

fixAnonymousEmails();
