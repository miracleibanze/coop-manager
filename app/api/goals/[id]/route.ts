import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Goal from "@/models/Goal";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    await connectDB();

    const { inc, ...data } = body;
    const goal = await Goal.findById(params.id);

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    if (inc !== undefined) {
      goal.currentNumber += inc;
    }

    Object.assign(goal, data);
    await goal.save();

    return NextResponse.json(goal);
  } catch (error) {
    console.error("PUT /api/goals/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const goal = await Goal.findByIdAndDelete(params.id);

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/goals/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
