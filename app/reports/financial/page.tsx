// app/reports/financial/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/Button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface FinancialData {
  monthlyData: {
    month: string;
    contributions: number;
    expenses: number;
    netBalance: number;
    loans: number;
  }[];
  summary: {
    totalContributions: number;
    totalExpenses: number;
    totalLoans: number;
    netBalance: number;
    growthRate: number;
  };
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

async function fetchFinancialReport(): Promise<FinancialData> {
  const response = await fetch("/api/reports/financial");
  if (!response.ok) throw new Error("Failed to fetch financial report");
  return response.json();
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function FinancialReportPage() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const { data, isLoading } = useQuery({
    queryKey: ["financial-report", dateRange],
    queryFn: () => fetchFinancialReport(),
  });

  const handleExportPDF = async () => {
    try {
      const response = await fetch("/api/reports/export/financial-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateRange }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `financial-report-${
          new Date().toISOString().split("T")[0]
        }.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      alert("Error exporting PDF");
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch("/api/reports/export/financial-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateRange }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `financial-report-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      alert("Error exporting CSV");
    }
  };

  if (isLoading) return <div>Loading financial report...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Financial Summary
          </h1>
          <p className="text-gray-600">
            Comprehensive financial overview and trends
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

      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
                className="ml-2 px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
                className="ml-2 px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${data?.summary.totalContributions.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${data?.summary.totalExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                data?.summary.netBalance && data.summary.netBalance >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              ${data?.summary.netBalance.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                data?.summary.growthRate && data.summary.growthRate >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {data?.summary.growthRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                <Line
                  type="monotone"
                  dataKey="contributions"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Contributions"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="Expenses"
                />
                <Line
                  type="monotone"
                  dataKey="netBalance"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Net Balance"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) =>
                    `${category} (${percentage}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {data?.categoryBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Loan Disbursements */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Loan Disbursements</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                <Bar dataKey="loans" fill="#8B5CF6" name="Loans Disbursed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Month</th>
                  <th className="text-right py-3">Contributions</th>
                  <th className="text-right py-3">Expenses</th>
                  <th className="text-right py-3">Loans</th>
                  <th className="text-right py-3">Net Balance</th>
                </tr>
              </thead>
              <tbody>
                {data?.monthlyData.map((month) => (
                  <tr key={month.month} className="border-b hover:bg-gray-50">
                    <td className="py-3">{month.month}</td>
                    <td className="text-right py-3 text-green-600">
                      ${month.contributions.toLocaleString()}
                    </td>
                    <td className="text-right py-3 text-red-600">
                      ${month.expenses.toLocaleString()}
                    </td>
                    <td className="text-right py-3 text-purple-600">
                      ${month.loans.toLocaleString()}
                    </td>
                    <td
                      className={`text-right py-3 font-medium ${
                        month.netBalance >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      ${month.netBalance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
