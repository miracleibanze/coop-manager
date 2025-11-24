import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Cooperative from "@/models/Cooperative";
import User from "@/models/User";
import { Types } from "mongoose";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { joinCode } = body;

    if (!joinCode?.trim()) {
      return NextResponse.json(
        { error: "Join code is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already has a cooperative
    const existingUser = await User.findById(session.user._id).exec();
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    if (existingUser.cooperativeId) {
      return NextResponse.json(
        { error: "User already has a cooperative" },
        { status: 400 }
      );
    }

    // Find cooperative by join code (case insensitive)
    const cooperative = await Cooperative.findOne({
      joinCode: joinCode.trim().toUpperCase(),
    });

    if (!cooperative) {
      return NextResponse.json(
        { error: "Invalid join code. Please check the code and try again." },
        { status: 400 }
      );
    }

    if (!cooperative.isActive) {
      return NextResponse.json(
        { error: "This cooperative is no longer active" },
        { status: 400 }
      );
    }

    // Update user with cooperative reference
    existingUser.cooperativeId = new Types.ObjectId(cooperative._id);
    await existingUser.save();

    return NextResponse.json({
      message: "Successfully joined cooperative",
      cooperative: {
        _id: cooperative._id,
        name: cooperative.name,
        description: cooperative.description,
        location: cooperative.location,
        joinCode: cooperative.joinCode,
      },
    });
  } catch (error) {
    console.error("Join cooperative error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
