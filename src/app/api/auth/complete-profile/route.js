import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

export async function POST(request) {
	try {
		await dbConnect();
		const data = await request.json();

		// Validate required fields
		const requiredFields = [
			"userId",
			"gender",
			"birthYear",
			"birthMonth",
			"birthDay",
			"birthHour",
			"provider",
		];
		for (const field of requiredFields) {
			if (
				data[field] === undefined ||
				data[field] === null ||
				data[field] === ""
			) {
				return NextResponse.json(
					{ message: `Missing required field: ${field}` },
					{ status: 400 }
				);
			}
		}

		// Validate birth date components
		const { birthYear, birthMonth, birthDay, birthHour } = data;
		if (
			birthYear < 1900 ||
			birthYear > new Date().getFullYear() ||
			birthMonth < 1 ||
			birthMonth > 12 ||
			birthDay < 1 ||
			birthDay > 31 ||
			birthHour < 0 ||
			birthHour > 23
		) {
			return NextResponse.json(
				{ message: "Invalid birth date or time" },
				{ status: 400 }
			);
		}

		const birthDateTime = new Date(
			data.birthYear,
			data.birthMonth - 1,
			data.birthDay,
			data.birthHour,
			0,
			0,
			0
		);

		// Upsert user profile so existing logged-in users can complete/update profile
		const updatedUser = await User.findOneAndUpdate(
			{ userId: data.userId },
			{
				$set: {
					gender: data.gender,
					birthDateTime,
					birthdayProvided: true,
					email: data.email || undefined,
					provider: data.provider,
					updatedAt: new Date(),
				},
			},
			{ new: true, upsert: true, setDefaultsOnInsert: true }
		);

		return NextResponse.json(
			{
				success: true,
				user: {
					id: updatedUser.userId,
					gender: updatedUser.gender,
					provider: updatedUser.provider,
				},
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error saving user profile:", error);
		return NextResponse.json(
			{ message: "Failed to save user profile", error: error.message },
			{ status: 500 }
		);
	}
}
