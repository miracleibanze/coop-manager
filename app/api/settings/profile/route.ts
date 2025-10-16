// app/api/settings/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Member from "@/models/Member";
import { connectDB } from "@/lib/db";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email } = body;

    await connectDB();

    // Check if email is already taken by another user
    const existingMember = await Member.findOne({
      email,
      _id: { $ne: session.user.id },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Email is already taken" },
        { status: 400 }
      );
    }

    // Update member profile
    const updatedMember = await Member.findByIdAndUpdate(
      session.user.id,
      { name, email },
      { new: true }
    ).select("-password");

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
