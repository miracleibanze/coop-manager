// app/api/reports/financial/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Contribution from "@/models/Contribution";
import Expense from "@/models/Expense";
import Loan from "@/models/Loan";
import { connectDB } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get last 6 months of data
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push({
        month: date.toLocaleString("default", {
          month: "short",
          year: "2-digit",
        }),
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
      });
    }

    // Monthly financial data
    const monthlyContributions = await Contribution.aggregate([
      {
        $match: {
          status: "approved",
          date: {
            $gte: new Date(
              new Date().getFullYear(),
              new Date().getMonth() - 5,
              1
            ),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
    ]);

    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(
              new Date().getFullYear(),
              new Date().getMonth() - 5,
              1
            ),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
    ]);

    const monthlyLoans = await Loan.aggregate([
      {
        $match: {
          status: "approved",
          createdAt: {
            $gte: new Date(
              new Date().getFullYear(),
              new Date().getMonth() - 5,
              1
            ),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: "$approvedAmount" },
        },
      },
    ]);

    // Format monthly data
    const monthlyData = months.map((m) => {
      const contributions =
        monthlyContributions.find(
          (c) => c._id.year === m.year && c._id.month === m.monthIndex + 1
        )?.total || 0;

      const expenses =
        monthlyExpenses.find(
          (e) => e._id.year === m.year && e._id.month === m.monthIndex + 1
        )?.total || 0;

      const loans =
        monthlyLoans.find(
          (l) => l._id.year === m.year && l._id.month === m.monthIndex + 1
        )?.total || 0;

      return {
        month: m.month,
        contributions,
        expenses,
        loans,
        netBalance: contributions - expenses,
      };
    });

    // Category breakdown
    const categoryBreakdown = await Expense.aggregate([
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          category: "$_id",
          amount: "$total",
          _id: 0,
        },
      },
    ]);

    const totalExpenses = categoryBreakdown.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const categoryBreakdownWithPercentage = categoryBreakdown.map((item) => ({
      ...item,
      percentage:
        totalExpenses > 0 ? Math.round((item.amount / totalExpenses) * 100) : 0,
    }));

    // Summary
    const totalContributions = monthlyData.reduce(
      (sum, m) => sum + m.contributions,
      0
    );
    const totalExpensesSummary = monthlyData.reduce(
      (sum, m) => sum + m.expenses,
      0
    );
    const totalLoans = monthlyData.reduce((sum, m) => sum + m.loans, 0);

    const previousPeriodContributions = monthlyData
      .slice(0, 3)
      .reduce((sum, m) => sum + m.contributions, 0);
    const currentPeriodContributions = monthlyData
      .slice(3)
      .reduce((sum, m) => sum + m.contributions, 0);
    const growthRate =
      previousPeriodContributions > 0
        ? ((currentPeriodContributions - previousPeriodContributions) /
            previousPeriodContributions) *
          100
        : 0;

    return NextResponse.json({
      monthlyData,
      categoryBreakdown: categoryBreakdownWithPercentage,
      summary: {
        totalContributions,
        totalExpenses: totalExpensesSummary,
        totalLoans,
        netBalance: totalContributions - totalExpensesSummary,
        growthRate: Math.round(growthRate * 10) / 10,
      },
    });
  } catch (error) {
    console.error("Financial report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
