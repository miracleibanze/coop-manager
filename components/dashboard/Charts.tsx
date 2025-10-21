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
import { Loader } from "../UI/Icons";
import Link from "next/link";
import { Button } from "../UI/Button";

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

  const hasContribData = data?.monthlyContributions?.some(
    (item) => item.contributions > 0
  );
  const hasLoanData = data?.monthlyLoans?.some((item) => item.loans > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max_w_custom">
      {/* --- Contributions Chart --- */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Contributions</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            {isLoading ? (
              <div className="w-full h-full py-16 grid place-content-center">
                <Loader />
              </div>
            ) : !hasContribData ? (
              <div className="w-full h-full py-16 grid place-content-center text-center space-y-4">
                <span className=" font-bold text-primary/70">
                  No monthly contributions yet
                </span>
                <Link href={"/contributions/add"}>
                  <Button>New Record</Button>
                </Link>
              </div>
            ) : (
              <LineChart data={data?.monthlyContributions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="contributions"
                  stroke="#3b82f6" // match your --colorPrimary (blue.600)
                  strokeWidth={2}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* --- Loans Chart --- */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Disbursement Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            {isLoading ? (
              <div className="w-full h-full py-16 grid place-content-center">
                <Loader />
              </div>
            ) : !hasLoanData ? (
              <div className="w-full h-full py-16 grid place-content-center text-center space-y-4">
                <span className="font-bold text-primary/70">
                  No loan disbursement yet
                </span>
                <Link href={"/loans/requests"}>
                  <Button>New Record</Button>
                </Link>
              </div>
            ) : (
              <BarChart data={data?.monthlyLoans}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="loans" fill="#16a34a" />{" "}
                {/* match your --third */}
              </BarChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
