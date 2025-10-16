// app/api/loans/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Loan from "@/models/Loan";
import Activity from "@/models/Activity";
import { connectDB } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    await connectDB();

    let query = {};
    if (status) {
      query = { status };
    }

    const loans = await Loan.find(query)
      .populate("member", "name email")
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json(loans);
  } catch (error) {
    console.error("Get loans error:", error);
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
    const { member, requestedAmount, reason } = body;

    await connectDB();

    const loan = await Loan.create({
      member,
      requestedAmount,
      reason,
      status: "pending",
    });

    // Log activity
    await Activity.create({
      type: "loan_application",
      member,
      amount: requestedAmount,
      description: `Loan application for $${requestedAmount}`,
      date: new Date(),
      status: "pending",
    });

    const populatedLoan = await Loan.findById(loan._id).populate(
      "member",
      "name email"
    );

    return NextResponse.json(populatedLoan, { status: 201 });
  } catch (error) {
    console.error("Create loan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
