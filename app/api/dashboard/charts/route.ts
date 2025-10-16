// app/api/dashboard/charts/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Contribution from "@/models/Contribution";
import Loan from "@/models/Loan";
import { connectDB } from "@/lib/db";

export async function GET() {
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

    // Monthly contributions
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
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Monthly loans
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
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Format data for charts
    const contributionsData = months.map((m) => {
      const found = monthlyContributions.find(
        (c) => c._id.year === m.year && c._id.month === m.monthIndex + 1
      );
      return {
        month: m.month,
        contributions: found?.total || 0,
      };
    });

    const loansData = months.map((m) => {
      const found = monthlyLoans.find(
        (l) => l._id.year === m.year && l._id.month === m.monthIndex + 1
      );
      return {
        month: m.month,
        loans: found?.total || 0,
      };
    });

    return NextResponse.json({
      monthlyContributions: contributionsData,
      monthlyLoans: loansData,
    });
  } catch (error) {
    console.error("Dashboard charts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
