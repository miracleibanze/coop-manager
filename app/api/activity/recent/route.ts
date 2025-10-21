// app/api/activity/recent/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Activity from "@/models/Activity";
import { connectDB } from "@/lib/db";
import { Types } from "mongoose";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const activities = await Activity.find({
      cooperativeId: new Types.ObjectId(session.user.cooperativeId),
    })
      .populate("member", "name email")
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();

    return NextResponse.json(activities);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
