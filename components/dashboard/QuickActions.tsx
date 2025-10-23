// components/dashboard/QuickActions.tsx
import { Card, CardContent, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/Button";
import Link from "next/link";
import { HandCoins, FilePlus2, UserPlus, BarChart3 } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      label: "Quick Add Contribution",
      href: "/contributions/add",
      icon: HandCoins,
    },
    {
      label: "Quick Add Loan",
      href: "/loans/requests",
      icon: FilePlus2,
    },
    {
      label: "Add Member",
      href: "/members/add",
      icon: UserPlus,
    },
    {
      label: "Record Expense",
      href: "/expenses",
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-3 py-6">
      <h2 className="text-2xl font-bold">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => (
          <Link key={action.label} href={action.href}>
            <Button
              className="w-full h-20 flex flex-col gap-2 bg-lightBackground border border-colorBorder shadow-md hover:-translate-y-1 hover:shadow-lg shadow-colorBorder transition-all duration-100"
              variant="outline"
            >
              <action.icon className="w-5 h-5 text-primary" />
              <span className="text-sm">{action.label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
