// app/api/reports/members/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Member from "@/models/Member";
import Contribution from "@/models/Contribution";
import Loan from "@/models/Loan";
import Activity from "@/models/Activity";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get all members with their activity data
    const members = await Member.find({})
      .select("name email joinDate status totalContributions")
      .sort({ totalContributions: -1 });

    // Get member loans data
    const memberLoans = await Loan.aggregate([
      {
        $group: {
          _id: "$member",
          activeLoans: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          repaidLoans: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          totalLoans: { $sum: 1 },
        },
      },
    ]);

    // Get last activity dates
    const lastActivities = await Activity.aggregate([
      {
        $group: {
          _id: "$member",
          lastActivity: { $max: "$date" },
          activityCount: { $sum: 1 },
        },
      },
    ]);

    // Calculate participation scores and enrich member data
    const enrichedMembers = await Promise.all(
      members.map(async (member) => {
        const loans = memberLoans.find(
          (ml) => ml._id.toString() === member._id.toString()
        );
        const activity = lastActivities.find(
          (la) => la._id.toString() === member._id.toString()
        );

        // Calculate participation score (simplified)
        const joinDate = new Date(member.joinDate);
        const monthsSinceJoin = Math.max(
          1,
          (new Date().getFullYear() - joinDate.getFullYear()) * 12 +
            (new Date().getMonth() - joinDate.getMonth())
        );

        const expectedContributions =
          monthsSinceJoin * (member.contributionPlan || 0);
        const contributionRatio =
          expectedContributions > 0
            ? member.totalContributions / expectedContributions
            : 0;

        const activityScore = activity
          ? Math.min(activity.activityCount / 10, 1)
          : 0; // Max 10 activities = 100%
        const loanScore = loans
          ? loans.repaidLoans / Math.max(loans.totalLoans, 1)
          : 0;

        const participationScore = Math.round(
          (contributionRatio * 0.5 + activityScore * 0.3 + loanScore * 0.2) *
            100
        );

        return {
          _id: member._id,
          name: member.name,
          email: member.email,
          totalContributions: member.totalContributions,
          activeLoans: loans?.activeLoans || 0,
          repaidLoans: loans?.repaidLoans || 0,
          participationScore,
          joinDate: member.joinDate,
          lastActivity: activity?.lastActivity || member.joinDate,
          status: member.status,
        };
      })
    );

    // Calculate repayment rates
    const repaymentRates = memberLoans
      .map((loan) => {
        const member = members.find(
          (m) => m._id.toString() === loan._id.toString()
        );
        const rate =
          loan.totalLoans > 0 ? (loan.repaidLoans / loan.totalLoans) * 100 : 0;

        return {
          member: member?.name || "Unknown Member",
          rate: Math.round(rate),
        };
      })
      .filter((item) => item.rate > 0)
      .sort((a, b) => b.rate - a.rate);

    const summary = {
      totalMembers: members.length,
      activeMembers: members.filter((m) => m.status === "active").length,
      averageParticipation:
        enrichedMembers.reduce((sum, m) => sum + m.participationScore, 0) /
        enrichedMembers.length,
      totalContributions: members.reduce(
        (sum, m) => sum + m.totalContributions,
        0
      ),
    };

    return NextResponse.json({
      topContributors: enrichedMembers.slice(0, 10),
      mostActive: enrichedMembers
        .sort((a, b) => b.participationScore - a.participationScore)
        .slice(0, 10),
      repaymentRates: repaymentRates.slice(0, 10),
      summary,
    });
  } catch (error) {
    console.error("Member activity report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
