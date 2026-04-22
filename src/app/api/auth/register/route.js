import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { hashPassword, validatePassword, validateEmail } from "@/lib/password";

export async function POST(request) {
	try {
		const { email, password, name } = await request.json();

		// Validate input
		if (!email || !password || !name) {
			return NextResponse.json(
				{ message: "Email, password, and name are required" },
				{ status: 400 }
			);
		}

		// Validate email format
		const emailValidation = validateEmail(email);
		if (!emailValidation.isValid) {
			return NextResponse.json(
				{ message: emailValidation.message },
				{ status: 400 }
			);
		}

		// Validate password strength
		const passwordValidation = validatePassword(password);
		if (!passwordValidation.isValid) {
			return NextResponse.json(
				{ message: passwordValidation.message },
				{ status: 400 }
			);
		}

		await dbConnect();

		// Check if user already exists
		const existingUser = await User.findOne({
			$or: [{ email: email }, { userId: email }],
		});

		if (existingUser) {
			return NextResponse.json(
				{ message: "User with this email already exists" },
				{ status: 400 }
			);
		}

		// Hash password
		const hashedPassword = await hashPassword(password);

		// Create user data with explicit field validation
		const userData = {
			userId: email,
			email: email,
			password: hashedPassword,
			name: name,
			provider: "credentials", // Ensure this matches exactly
			emailVerified: false,
			gender: "female",
			birthDateTime: new Date(1996, 2, 12, 22),
			birthdayProvided: false,
			weeklyAdviceEnabled: true,
			isLock: true, // Default from schema
		};

		console.log("Creating user with validated data:", userData);

		// Create new user with validated data
		const newUser = new User(userData);

		// Validate the document before saving
		const validationError = newUser.validateSync();
		if (validationError) {
			console.error("Validation error before save:", validationError);
			return NextResponse.json(
				{
					message: "Validation failed",
					errors: Object.values(validationError.errors).map(
						(err) => err.message
					),
				},
				{ status: 400 }
			);
		}

		await newUser.save();

		// Remove password from response
		const userResponse = {
			userId: newUser.userId,
			email: newUser.email,
			name: newUser.name,
			createdAt: newUser.createdAt,
		};

		return NextResponse.json(
			{
				message: "User registered successfully",
				user: userResponse,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Registration error:", error);

		// Handle Mongoose validation errors
		if (error.name === "ValidationError") {
			const validationErrors = Object.values(error.errors).map(
				(err) => err.message
			);
			return NextResponse.json(
				{
					message: "Validation failed",
					errors: validationErrors,
					details: error.errors,
				},
				{ status: 400 }
			);
		}

		// Handle duplicate key errors
		if (error.code === 11000) {
			return NextResponse.json(
				{ message: "User with this email already exists" },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}
