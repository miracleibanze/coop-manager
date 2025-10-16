// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentActivityTable } from "@/components/dashboard/RecentActivityTable";
import { DashboardCharts } from "@/components/dashboard/Charts";
import { QuickActions } from "@/components/dashboard/QuickActions";
import HeadingCard from "@/components/UI/HeadingCard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="space-y-6 pb-20">
      <HeadingCard
        title="Dashboard"
        subTitle={`Welcome back, ${session.user?.name}!`}
      />

      <StatsCards />

      <QuickActions />

      <DashboardCharts />

      <RecentActivityTable />
    </div>
  );
}
