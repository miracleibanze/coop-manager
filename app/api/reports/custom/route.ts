// app/api/reports/custom/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Contribution from "@/models/Contribution";
import Loan from "@/models/Loan";
import Expense from "@/models/Expense";
import Member from "@/models/Member";
import { connectDB } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { dateRange, member, category, reportType } = body;

    await connectDB();

    let data: any[] = [];
    let columns: string[] = [];
    let summary: any = {};

    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999);

    const baseMatch: any = {
      createdAt: { $gte: startDate, $lte: endDate },
    };

    if (member) {
      baseMatch.member = member;
    }

    switch (reportType) {
      case "contributions":
        const contributionMatch = { ...baseMatch };
        if (member) contributionMatch.member = member;

        data = await Contribution.find(contributionMatch)
          .populate("member", "name email")
          .populate("approvedBy", "name")
          .sort({ date: -1 });

        columns = [
          "Date",
          "Member",
          "Amount",
          "Payment Method",
          "Status",
          "Approved By",
        ];

        data = data.map((contribution) => ({
          Date: new Date(contribution.date).toLocaleDateString(),
          Member: contribution.member.name,
          Amount: contribution.amount,
          "Payment Method": contribution.paymentMethod,
          Status: contribution.status,
          "Approved By": contribution.approvedBy?.name || "N/A",
        }));

        summary = {
          totalRecords: data.length,
          totalAmount: data.reduce((sum, item) => sum + item.Amount, 0),
          averageAmount:
            data.length > 0
              ? data.reduce((sum, item) => sum + item.Amount, 0) / data.length
              : 0,
        };
        break;

      case "loans":
        const loanMatch = { ...baseMatch };
        if (member) loanMatch.member = member;

        data = await Loan.find(loanMatch)
          .populate("member", "name email")
          .populate("approvedBy", "name")
          .sort({ createdAt: -1 });

        columns = [
          "Request Date",
          "Member",
          "Requested Amount",
          "Approved Amount",
          "Status",
          "Reason",
        ];

        data = data.map((loan) => ({
          "Request Date": new Date(loan.createdAt).toLocaleDateString(),
          Member: loan.member.name,
          "Requested Amount": loan.requestedAmount,
          "Approved Amount": loan.approvedAmount || "N/A",
          Status: loan.status,
          Reason: loan.reason,
        }));

        summary = {
          totalRecords: data.length,
          totalAmount: data.reduce(
            (sum, item) => sum + (item["Approved Amount"] || 0),
            0
          ),
        };
        break;

      case "expenses":
        const expenseMatch: any = { date: { $gte: startDate, $lte: endDate } };
        if (category) expenseMatch.category = category;

        data = await Expense.find(expenseMatch)
          .populate("createdBy", "name")
          .sort({ date: -1 });

        columns = ["Date", "Category", "Amount", "Description", "Added By"];

        data = data.map((expense) => ({
          Date: new Date(expense.date).toLocaleDateString(),
          Category: expense.category,
          Amount: expense.amount,
          Description: expense.description || "N/A",
          "Added By": expense.createdBy.name,
        }));

        summary = {
          totalRecords: data.length,
          totalAmount: data.reduce((sum, item) => sum + item.Amount, 0),
          averageAmount:
            data.length > 0
              ? data.reduce((sum, item) => sum + item.Amount, 0) / data.length
              : 0,
        };
        break;

      case "members":
        data = await Member.find({})
          .select("name email phone role joinDate status totalContributions")
          .sort({ totalContributions: -1 });

        columns = [
          "Name",
          "Email",
          "Phone",
          "Role",
          "Join Date",
          "Status",
          "Total Contributions",
        ];

        data = data.map((member) => ({
          Name: member.name,
          Email: member.email,
          Phone: member.phone,
          Role: member.role,
          "Join Date": new Date(member.joinDate).toLocaleDateString(),
          Status: member.status,
          "Total Contributions": member.totalContributions,
        }));

        summary = {
          totalRecords: data.length,
          totalAmount: data.reduce(
            (sum, item) => sum + item["Total Contributions"],
            0
          ),
        };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid report type" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      columns,
      data,
      summary,
    });
  } catch (error) {
    console.error("Custom report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
