// app/api/settings/security/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Member from "@/models/Member";
import bcrypt from "bcryptjs"; // ✅ use bcryptjs instead
import { connectDB } from "@/lib/db";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body as {
      currentPassword?: string;
      newPassword?: string;
    };

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Both current and new passwords are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    await connectDB();

    // Fetch current member with password
    const member = await Member.findById(session.user.id).select("+password");
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      member.password || ""
    );
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Prevent reusing the same password
    const isSamePassword = await bcrypt.compare(newPassword, member.password);
    if (isSamePassword) {
      return NextResponse.json(
        { error: "New password cannot be the same as the old one." },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    member.password = hashedPassword;
    await member.save();

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
