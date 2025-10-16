// app/reports/custom/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/InputComponents";
import { Label } from "@/components/UI/InputComponents";
import { Select } from "@/components/UI/InputComponents";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/UI/Table";

interface CustomReportData {
  columns: string[];
  data: any[];
  summary: {
    totalRecords: number;
    totalAmount?: number;
    averageAmount?: number;
  };
}

interface Member {
  _id: string;
  name: string;
}

async function fetchMembers(): Promise<Member[]> {
  const response = await fetch("/api/members");
  if (!response.ok) throw new Error("Failed to fetch members");
  return response.json();
}

export default function CustomReportsPage() {
  const [filters, setFilters] = useState({
    dateRange: {
      start: new Date(new Date().getFullYear(), 0, 1)
        .toISOString()
        .split("T")[0], // Start of year
      end: new Date().toISOString().split("T")[0],
    },
    member: "",
    category: "",
    reportType: "contributions",
  });
  const [reportData, setReportData] = useState<CustomReportData | null>(null);
  const [generating, setGenerating] = useState(false);

  const { data: members } = useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers,
  });

  const generateReport = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/reports/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });

      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        alert("Error generating report");
      }
    } catch (error) {
      alert("Error generating report");
    } finally {
      setGenerating(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await fetch("/api/reports/export/custom-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters, reportData }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `custom-report-${
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
      const response = await fetch("/api/reports/export/custom-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters, reportData }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `custom-report-${
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

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDateChange = (field: "start" | "end", value: string) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Custom Reports</h1>
        <p className="text-gray-600">
          Generate customized reports with flexible filters
        </p>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select
                id="reportType"
                value={filters.reportType}
                onChange={(e: any) =>
                  handleFilterChange("reportType", e.target.value)
                }
              >
                <option value="contributions">Contributions</option>
                <option value="loans">Loans</option>
                <option value="expenses">Expenses</option>
                <option value="members">Member Activity</option>
                <option value="financial">Financial Summary</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.dateRange.start}
                onChange={(e: any) => handleDateChange("start", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.dateRange.end}
                onChange={(e: any) => handleDateChange("end", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="member">Member</Label>
              <Select
                id="member"
                value={filters.member}
                onChange={(e: any) =>
                  handleFilterChange("member", e.target.value)
                }
              >
                <option value="">All Members</option>
                {members?.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                id="category"
                value={filters.category}
                onChange={(e: any) =>
                  handleFilterChange("category", e.target.value)
                }
              >
                <option value="">All Categories</option>
                <option value="office">Office</option>
                <option value="operations">Operations</option>
                <option value="maintenance">Maintenance</option>
                <option value="other">Other</option>
              </Select>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <Button onClick={generateReport} disabled={generating}>
              {generating ? "Generating..." : "Generate Report"}
            </Button>
            {reportData && (
              <>
                <Button onClick={handleExportPDF} variant="outline">
                  Export PDF
                </Button>
                <Button onClick={handleExportCSV} variant="outline">
                  Export CSV
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle>
              Report Results
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({reportData.summary.totalRecords} records found)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reportData.summary.totalAmount && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Total Amount</div>
                    <div className="text-lg font-bold text-green-600">
                      ${reportData.summary.totalAmount.toLocaleString()}
                    </div>
                  </div>
                  {reportData.summary.averageAmount && (
                    <div>
                      <div className="text-sm text-gray-600">
                        Average Amount
                      </div>
                      <div className="text-lg font-bold">
                        ${reportData.summary.averageAmount.toLocaleString()}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-600">Total Records</div>
                    <div className="text-lg font-bold">
                      {reportData.summary.totalRecords}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {reportData.columns.map((column) => (
                      <TableHead key={column}>{column}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.data.map((row, index) => (
                    <TableRow key={index}>
                      {reportData.columns.map((column) => (
                        <TableCell key={column}>
                          {typeof row[column] === "number"
                            ? column.toLowerCase().includes("amount") ||
                              column.toLowerCase().includes("total")
                              ? `$${row[column].toLocaleString()}`
                              : row[column]
                            : row[column] || "-"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {reportData.data.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No data found for the selected filters.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
