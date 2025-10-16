// app/api/dashboard/stats/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Member from "@/models/Member";
import Loan from "@/models/Loan";
import { connectDB } from "@/lib/db";
import Contribution from "@/models/Contribution";
import Expense from "@/models/Expense";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [totalMembers, activeLoans, totalContributions, totalExpenses] =
      await Promise.all([
        Member.countDocuments({ status: "active" }),
        Loan.countDocuments({ status: "active" }),
        Contribution.aggregate([
          { $match: { status: "approved" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Expense.aggregate([
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);

    const contributionsTotal = totalContributions[0]?.total || 0;
    const expensesTotal = totalExpenses[0]?.total || 0;

    return NextResponse.json({
      totalMembers,
      activeLoans,
      totalContributions: contributionsTotal,
      cooperativeBalance: contributionsTotal - expensesTotal,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
