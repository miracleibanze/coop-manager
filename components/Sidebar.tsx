// components/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  HandCoins,
  Banknote,
  Receipt,
  FileText,
  Settings,
} from "lucide-react";
import Image from "next/image";
import logo from "@/public/logo.png";
import darkLogo from "@/public/darkLogo.png";

const navigation = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Members",
    path: "/members/all",
    icon: Users,
    sublinks: [
      { name: "All Members", path: "/members/all" },
      { name: "Add Member", path: "/members/add" },
    ],
  },
  {
    name: "Contributions",
    path: "/contributions/all",
    icon: HandCoins,
    sublinks: [
      { name: "All Contributions", path: "/contributions/all" },
      { name: "Add Contribution", path: "/contributions/add" },
    ],
  },
  {
    name: "Loans",
    path: "/loans/requests",
    icon: Banknote,
    sublinks: [
      { name: "Loan Requests", path: "/loans/requests" },
      { name: "Active Loans", path: "/loans/active" },
      { name: "Loan Reports", path: "/loans/reports" },
    ],
  },
  {
    name: "Expenses",
    path: "/expenses",
    icon: Receipt,
  },
  {
    name: "Reports",
    path: "/reports/financial",
    icon: FileText,
    sublinks: [
      { name: "Financial Summary", path: "/reports/financial" },
      { name: "Member Activity", path: "/reports/members" },
      { name: "Custom Reports", path: "/reports/custom" },
    ],
  },
  {
    name: "Settings",
    path: "/settings/profile",
    icon: Settings,
    sublinks: [
      { name: "Profile", path: "/settings/profile" },
      { name: "Themes", path: "/settings/themes" },
      { name: "Roles & Permissions", path: "/settings/roles" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-background shadow-lg h-full flex flex-col fixed top-0 bottom-0 left-0">
      <div className="p-6 border-b">
        <Image
          src={logo}
          alt="logo"
          width={220}
          height={50}
          className="dark:hidden object-cover"
        />
        <Image
          src={darkLogo}
          alt="logo"
          width={220}
          height={50}
          className="dark:block hidden object-cover"
        />
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive =
            pathname === item.path ||
            (item.sublinks &&
              item.sublinks.some((sub) => pathname === sub.path));

          return (
            <div key={item.name}>
              <Link
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-lightBackground text-lightPrimary border border-lightBorder"
                    : "text-primary hover:bg-primary/70 hover:text-inverse"
                )}
              >
                <span className="text-lg">
                  {typeof item.icon === "string" ? item.icon : <item.icon />}
                </span>
                {item.name}
              </Link>

              {item.sublinks && isActive && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.sublinks.map((sublink) => (
                    <Link
                      key={sublink.name}
                      href={sublink.path}
                      className={cn(
                        "block px-3 py-2 text-sm rounded-lg transition-colors",
                        pathname === sublink.path
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      {sublink.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
