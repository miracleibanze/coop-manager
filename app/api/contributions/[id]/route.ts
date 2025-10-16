// app/api/contributions/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Contribution from "@/models/Contribution";
import Member from "@/models/Member";
import Activity from "@/models/Activity";
import { connectDB } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    await connectDB();

    const contribution = await Contribution.findById(id);
    if (!contribution) {
      return NextResponse.json(
        { error: "Contribution not found" },
        { status: 404 }
      );
    }

    // Update contribution status
    contribution.status = status;
    contribution.approvedBy = session.user.id;
    await contribution.save();

    // If approved, update member's total contributions
    if (status === "approved") {
      await Member.findByIdAndUpdate(contribution.member, {
        $inc: { totalContributions: contribution.amount },
      });
    }

    // Log activity
    await Activity.create({
      type: "contribution",
      member: contribution.member,
      amount: contribution.amount,
      description: `Contribution of $${contribution.amount} ${status}`,
      date: new Date(),
      status,
    });

    const updatedContribution = await Contribution.findById(id)
      .populate("member", "name email")
      .populate("approvedBy", "name");

    return NextResponse.json(updatedContribution);
  } catch (error) {
    console.error("Update contribution error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
