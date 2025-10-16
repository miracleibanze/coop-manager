// app/reports/members/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/UI/Table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/Button";
import { Badge } from "@/components/UI/Badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MemberActivity {
  _id: string;
  name: string;
  email: string;
  totalContributions: number;
  activeLoans: number;
  repaidLoans: number;
  participationScore: number;
  joinDate: string;
  lastActivity: string;
  status: "active" | "inactive";
}

interface MemberStats {
  topContributors: MemberActivity[];
  mostActive: MemberActivity[];
  repaymentRates: { member: string; rate: number }[];
  summary: {
    totalMembers: number;
    activeMembers: number;
    averageParticipation: number;
    totalContributions: number;
  };
}

async function fetchMemberActivityReport(): Promise<MemberStats> {
  const response = await fetch("/api/reports/members");
  if (!response.ok) throw new Error("Failed to fetch member activity report");
  return response.json();
}

export default function MemberActivityReportPage() {
  const [activeTab, setActiveTab] = useState<
    "ranking" | "activity" | "repayment"
  >("ranking");

  const { data, isLoading } = useQuery({
    queryKey: ["member-activity-report"],
    queryFn: fetchMemberActivityReport,
  });

  const handleExportPDF = async () => {
    try {
      const response = await fetch("/api/reports/export/members-pdf");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `member-activity-report-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert("Error exporting PDF");
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch("/api/reports/export/members-csv");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `member-activity-report-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert("Error exporting CSV");
    }
  };

  const getParticipationColor = (score: number) => {
    if (score >= 90) return "success";
    if (score >= 70) return "default";
    if (score >= 50) return "warning";
    return "destructive";
  };

  if (isLoading) return <div>Loading member activity report...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Member Activity Report
          </h1>
          <p className="text-gray-600">
            Member rankings, activity metrics, and performance
          </p>
        </div>
        <div className="flex gap-4">
          <Button onClick={handleExportPDF} variant="outline">
            Export PDF
          </Button>
          <Button onClick={handleExportCSV} variant="outline">
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.summary.totalMembers}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Active Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data?.summary.activeMembers}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Participation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.summary.averageParticipation.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data?.summary.totalContributions.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <div className="flex border-b">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "ranking"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("ranking")}
            >
              Contribution Ranking
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "activity"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("activity")}
            >
              Activity Metrics
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "repayment"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("repayment")}
            >
              Repayment Rates
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === "ranking" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Top Contributors</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Total Contributions</TableHead>
                    <TableHead>Active Loans</TableHead>
                    <TableHead>Participation Score</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.topContributors.map((member, index) => (
                    <TableRow key={member._id}>
                      <TableCell className="font-medium">
                        #{index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-500">
                          {member.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        ${member.totalContributions.toLocaleString()}
                      </TableCell>
                      <TableCell>{member.activeLoans}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getParticipationColor(
                            member.participationScore
                          )}
                        >
                          {member.participationScore}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            member.status === "active"
                              ? "success"
                              : "destructive"
                          }
                        >
                          {member.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">
                Member Activity Overview
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.mostActive}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="participationScore"
                      fill="#3B82F6"
                      name="Participation Score"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Participation Score</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.mostActive.map((member) => (
                    <TableRow key={member._id}>
                      <TableCell>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-500">
                          {member.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(member.joinDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(member.lastActivity).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getParticipationColor(
                            member.participationScore
                          )}
                        >
                          {member.participationScore}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            member.status === "active"
                              ? "success"
                              : "destructive"
                          }
                        >
                          {member.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === "repayment" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Loan Repayment Rates</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Repayment Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.repaymentRates.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {item.member}
                      </TableCell>
                      <TableCell>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.rate >= 80
                                ? "bg-green-500"
                                : item.rate >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${item.rate}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {item.rate}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.rate >= 80
                              ? "success"
                              : item.rate >= 60
                              ? "warning"
                              : "destructive"
                          }
                        >
                          {item.rate >= 80
                            ? "Excellent"
                            : item.rate >= 60
                            ? "Good"
                            : "Needs Improvement"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.rate >= 80 ? "🟢" : item.rate >= 60 ? "🟡" : "🔴"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
