import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { getUserInfo } from "@/lib/session";
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../../auth/[...nextauth]/route';
import {
    genSuccessData,
    genUnAuthData,
    genErrorData,
} from "../../utils/gen-res-data";

// Get user by ID
//用谷歌邮箱做用户唯一id
export async function GET(request, { params }) {
    const { userId } = await params;
    try {
        await dbConnect();
        const user = await User.findOne({ userId }).select("-__v");

        // if (!user) {
        //     return NextResponse.json(
        //         { message: 'User not found' },
        //         { status: 404 }
        //     );
        // }

        return NextResponse.json(genSuccessData(user || {}));
    } catch (error) {return NextResponse.json(genErrorData("Failed to fetch user"));
    }
}

// Update user by ID TODO
export async function POST(request, { params }) {
    try {
        //const userInfo = { userId: "yunyanyr@gmail.com" };
        const userInfo = await getUserInfo();
        if (userInfo == null) return Response.json(genUnAuthData());

        const { userId } = await params;
        const data = await request.json();
        //// Authenticate the request (in real app, ensure only the user or admin can update)
        // const session = await getServerSession(authOptions);
        // if (!session || (session.user.id !== userId && !session.user.isAdmin)) {
        //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        // }

        await dbConnect();

        // Find the user
        const user = await User.findOne({ userId });
        if (!user) {
            // When creating a new user, ensure provider is included
            const newUserData = {
                userId,
                provider: data.provider || "google", // Default to google if not provided
                ...data,
            };
            
            await User.create(newUserData);
        } else {
            // When updating existing user, preserve required fields and update others
            for (let key in data) {
                if (key === "birthDateTime") {
                    user[key] = new Date(data[key]);
                    user.birthdayProvided = true;
                } else {
                    user[key] = data[key];
                }
            }
            
            // Ensure provider is set if it's somehow missing
            if (!user.provider) {
                user.provider = data.provider || "google";
            }
            
            // Set updatedAt timestamp
            user.updatedAt = new Date();
            
            await user.save();
        }

        return NextResponse.json(genSuccessData());
    } catch (error) {if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));}
        return NextResponse.json(genErrorData("Failed to update user"));
    }
}

// Delete user by ID
export async function DELETE(request, { params }) {
    try {
        const { userId } = params;

        // Authenticate the request (in real app, ensure only the user or admin can delete)
        // const session = await getServerSession(authOptions);
        // if (!session || (session.user.id !== userId && !session.user.isAdmin)) {
        //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        // }

        await dbConnect();

        // Delete the user
        const result = await User.deleteOne({ userId });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "User deleted successfully",
        });
    } catch (error) {return NextResponse.json(
            { message: "Failed to delete user", error: error.message },
            { status: 500 }
        );
    }
}
