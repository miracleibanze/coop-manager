import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ exists: false }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email }).exec();

    return NextResponse.json({
      exists: !!user,
    });
  } catch (error) {
    console.error("User check error:", error);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}
