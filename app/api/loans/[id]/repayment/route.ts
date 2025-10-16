// app/api/loans/[id]/repayment/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Loan from "@/models/Loan";
import Activity from "@/models/Activity";
import { connectDB } from "@/lib/db";

export async function POST(
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
    const { amount } = body;

    await connectDB();

    const loan = await Loan.findById(id);
    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    // Update repayment amount
    loan.amountRepaid += amount;

    // Check if loan is fully repaid
    if (loan.amountRepaid >= (loan.approvedAmount || loan.requestedAmount)) {
      loan.status = "completed";
    }

    await loan.save();

    // Log activity
    await Activity.create({
      type: "loan_repayment",
      member: loan.member,
      amount,
      description: `Loan repayment of $${amount}`,
      date: new Date(),
    });

    const updatedLoan = await Loan.findById(id).populate(
      "member",
      "name email"
    );

    return NextResponse.json(updatedLoan);
  } catch (error) {
    console.error("Record repayment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
