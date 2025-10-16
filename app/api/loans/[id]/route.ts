// app/api/loans/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Loan from "@/models/Loan";
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
    const { status, approvedAmount, interestRate } = body;

    await connectDB();

    const loan = await Loan.findById(id);
    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    // Update loan
    loan.status = status;
    if (approvedAmount) loan.approvedAmount = approvedAmount;
    if (interestRate) loan.interestRate = interestRate;

    if (status === "approved") {
      loan.startDate = new Date();
      // Set due date to 1 year from now
      const dueDate = new Date();
      dueDate.setFullYear(dueDate.getFullYear() + 1);
      loan.dueDate = dueDate;
      loan.approvedBy = session.user.id;
    }

    await loan.save();

    // Log activity
    await Activity.create({
      type: status === "approved" ? "loan_approval" : "loan_application",
      member: loan.member,
      amount: loan.approvedAmount || loan.requestedAmount,
      description: `Loan ${status} for $${
        loan.approvedAmount || loan.requestedAmount
      }`,
      date: new Date(),
      status,
    });

    const updatedLoan = await Loan.findById(id)
      .populate("member", "name email")
      .populate("approvedBy", "name");

    return NextResponse.json(updatedLoan);
  } catch (error) {
    console.error("Update loan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
