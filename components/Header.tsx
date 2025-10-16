"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import logo from "@/public/logo.png";
import { Moon_Dance } from "next/font/google";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hook/useTheme";

export function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const isPublicPath = pathname.startsWith("/auth/") || pathname === "/";

  return (
    <header className="fixed top-0 right-0 left-0 bg-zinc-100 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8 flex-1 w-full">
            <a
              href="/"
              className="text-xl font-bold text-blue-600 dark:text-blue-200"
            >
              <Image
                src={logo}
                alt="Coopmanager"
                width={220}
                height={50}
                className="h-12 w-auto"
              />
            </a>
            <nav className="md:block hidden justify-center flex-1 w-full">
              <div className="flex justify-center mx-auto">
                <a
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                >
                  Dashboard
                </a>
                <a
                  href="/members"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                >
                  Members
                </a>
                <a
                  href="/inventory"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                >
                  Inventory
                </a>
                <a
                  href="/goals"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                >
                  Goals
                </a>
                <a
                  href="/transfers"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                >
                  Transfers
                </a>
                <a
                  href="/reports"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                >
                  Reports
                </a>
              </div>
            </nav>
          </div>
          {isPublicPath && (
            <div className="flex items-center space-x-4">
              <a
                href="/auth/signin"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
              >
                Sign In
              </a>
              <a
                href="/auth/register"
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md"
              >
                Register
              </a>
            </div>
          )}
          <button
            className="relative flex-0 text-zinc-600 p-1 grid place-content-center ml-2"
            onClick={toggleTheme}
          >
            {theme !== "dark" ? <Moon /> : <Sun />}
          </button>
        </div>
      </div>
    </header>
  );
}
