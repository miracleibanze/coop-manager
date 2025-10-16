// app/api/members/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Member from "@/models/Member";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const members = await Member.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, role, contributionPlan } = body;

    await connectDB();

    // Check if member already exists
    const existingMember = await Member.findOne({ email });
    if (existingMember) {
      return NextResponse.json(
        { error: "Member with this email already exists" },
        { status: 400 }
      );
    }

    // Create member (in real app, you'd generate a temporary password)
    const member = await Member.create({
      name,
      email,
      phone,
      role,
      contributionPlan,
      status: "active",
    });

    const { password, ...memberWithoutPassword } = member.toObject();

    return NextResponse.json(memberWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Create member error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
