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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import logo from "@/public/logo.png";
import darkLogo from "@/public/darkLogo.png";
import logoIcon from "@/public/logoIcon.png";
import { useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toggleSidebar } from "@/redux/slices/SidebarSlice";

const navigation = [
  {
    name: "Dashboard",
    path: "/",
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
  const { data: session } = useSession();
  const collapsed = useSelector((state: RootState) => state.sidebar.collapsed);
  // const {} = useSelector((state: RootState) => state);
  const dispatch = useDispatch();

  return (
    <aside
      className={cn(
        "h-full flex flex-col fixed top-0 bottom-0 left-0 bg-white dark:bg-gray-900 shadow-lg border-r transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header / Logo */}
      <div className="relative flex items-center justify-between border-b">
        <div className="flex items-center justify-center w-full">
          {!collapsed ? (
            <>
              <Image
                src={logo}
                alt="logo"
                width={160}
                height={40}
                className="dark:hidden object-cover"
              />
              <Image
                src={darkLogo}
                alt="dark logo"
                width={160}
                height={40}
                className="dark:block hidden object-cover"
              />
            </>
          ) : (
            <Image
              src={logoIcon}
              alt="logo"
              width={500}
              height={500}
              className="object-cover w-full h-auto"
            />
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className={cn(
            "absolute -right-3 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 border rounded-full p-1.5 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          )}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-2 overflow-y-auto pt-6">
        {navigation.map((item) => {
          const isActive =
            pathname === item.path ||
            (item.sublinks &&
              item.sublinks.some((sub) => pathname === sub.path));

          const Icon = item.icon;

          return (
            <div key={item.name}>
              <Link
                href={item.path}
                className={cn(
                  collapsed
                    ? "flex flex-col items-center justify-center py-2"
                    : "flex items-center gap-2 py-2 ",
                  "rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "text-lightBackground dark:text-colorPrimary"
                    : "text-primary hover:text-colorPrimary"
                )}
                title={collapsed ? item.name : undefined}
              >
                <div
                  className={` ${
                    isActive ? "p-2 rounded-full bg-colorPrimary" : " px-2"
                  }`}
                >
                  <Icon
                    className={cn(
                      "text-lg flex-shrink-0 transition-all duration-200",
                      isActive ? "fill-inverse text-inverse" : "fill-none"
                    )}
                  />
                </div>

                {/* Label when expanded */}
                {!collapsed && <span>{item.name}</span>}

                {/* Label under icon when collapsed */}
                {collapsed && (
                  <span className="text-[10px] mt-1 text-center leading-tight">
                    {item.name}
                  </span>
                )}
              </Link>

              {!collapsed && item.sublinks && isActive && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.sublinks.map((sublink) => (
                    <Link
                      key={sublink.name}
                      href={sublink.path}
                      className={cn(
                        "block px-3 py-2 text-sm rounded-lg transition-colors",
                        pathname === sublink.path
                          ? "text-colorPrimary font-medium"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
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

      {/* User Info */}
      <div className="border-t p-3 text-sm text-gray-600 dark:text-gray-300">
        {!collapsed ? (
          <div>{session?.user?.name ?? "no user"}</div>
        ) : (
          <div className="text-center" title={session?.user?.name ?? "no user"}>
            👤
          </div>
        )}
      </div>
    </aside>
  );
}
