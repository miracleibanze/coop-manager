// app/api/contributions/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Contribution from "@/models/Contribution";
import Member from "@/models/Member";
import Activity from "@/models/Activity";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const contributions = await Contribution.find({})
      .populate("member", "name email")
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json(contributions);
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
    const { member: memberId, amount, paymentMethod, date } = body;

    await connectDB();

    // Create contribution
    const contribution = await Contribution.create({
      member: memberId,
      amount,
      paymentMethod,
      date: new Date(date),
      status: "pending",
    });

    // Log activity
    await Activity.create({
      type: "contribution",
      member: memberId,
      amount,
      description: `Contribution of $${amount} submitted`,
      date: new Date(),
      status: "pending",
    });

    const populatedContribution = await Contribution.findById(
      contribution._id
    ).populate("member", "name email");

    return NextResponse.json(populatedContribution, { status: 201 });
  } catch (error) {
    console.error("Create contribution error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
