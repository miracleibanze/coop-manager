import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";
import { Types } from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const transactions = await Transaction.find({
      cooperativeId: new Types.ObjectId(session.user.cooperativeId),
    })
      .populate("fromMember toMember")
      .sort("-date")
      .exec();

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("GET /api/transfers error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    await connectDB();

    const transaction = await Transaction.create(body);

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("POST /api/transfers error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
