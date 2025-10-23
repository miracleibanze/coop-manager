"use client";

// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentActivityTable } from "@/components/dashboard/RecentActivityTable";
import { DashboardCharts } from "@/components/dashboard/Charts";
import { QuickActions } from "@/components/dashboard/QuickActions";
import HeadingCard from "@/components/UI/HeadingCard";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const session = useSession();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <>
      <div className="w-full">
        <h4 className="text-2xl">Dashboard</h4>
        <div className="text-sm">
          Manage your cooperative, wisely start with these analytics.
        </div>
      </div>

      <StatsCards />

      <QuickActions />

      <DashboardCharts />

      <RecentActivityTable />
    </>
  );
}
