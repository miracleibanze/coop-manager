// components/dashboard/Charts.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
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
} from "recharts";

interface ChartData {
  month: string;
  contributions: number;
  loans: number;
}

async function fetchChartData(): Promise<{
  monthlyContributions: ChartData[];
  monthlyLoans: ChartData[];
}> {
  const response = await fetch("/api/dashboard/charts");
  if (!response.ok) throw new Error("Failed to fetch chart data");
  return response.json();
}

export function DashboardCharts() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-charts"],
    queryFn: fetchChartData,
  });

  if (isLoading) return <div>Loading charts...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max_w_custom">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Contributions</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.monthlyContributions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="contributions"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Loan Disbursement Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.monthlyLoans}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="loans" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
