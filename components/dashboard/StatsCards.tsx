// components/dashboard/StatsCards.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../UI/card";
import { Skeleton } from "../UI/Skeleton";
import { Users, HandCoins, TrendingUp, Banknote } from "lucide-react";

interface StatsData {
  totalMembers: number;
  activeLoans: number;
  totalContributions: number;
  cooperativeBalance: number;
}

async function fetchStats(): Promise<StatsData> {
  const response = await fetch("/api/dashboard/stats");
  if (!response.ok) throw new Error("Failed to fetch stats");
  return response.json();
}

export function StatsCards() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchStats,
    refetchInterval: 30000,
  });

  const stats = [
    {
      title: "Total Members",
      value: data?.totalMembers,
      icon: Users,
      color: "var(--colorPrimary)",
    },
    {
      title: "Active Loans",
      value: data?.activeLoans,
      icon: HandCoins,
      color: "var(--third)",
    },
    {
      title: "Total Contributions",
      value: `$${data?.totalContributions?.toLocaleString()}`,
      icon: TrendingUp,
      color: "var(--secondary)",
    },
    {
      title: "Cooperative Balance",
      value: `$${data?.cooperativeBalance?.toLocaleString()}`,
      icon: Banknote,
      color: "var(--primary)",
      red: data?.cooperativeBalance && data?.cooperativeBalance < 0,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 [&>_]:transition-all duration-200">
        {error && <div className="text-red-500">Error loading stats</div>}
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="border-0 shadow-lg shadow-primary/20 bg-gradient-to-br from-white to-gray-50"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">
                {stat.title}
              </CardTitle>
              <div
                className="w-14 h-14 text-inverse text-2xl rounded-full grid place-content-center"
                style={{
                  backgroundColor: stat.color,
                }}
              >
                <stat.icon className="w-8 h-8" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24 bg-gray-200" />
              ) : (
                <div
                  className={`text-2xl font-bold ${
                    stat.red ? "text-red-600" : "text-gray-900"
                  }`}
                >
                  {stat.value}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
