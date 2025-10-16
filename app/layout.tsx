"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider, useSession } from "next-auth/react";
import { FC } from "react";
import { Header } from "@/components/Header";
import backgroundImage from "@/public/background.jpg";
import darkBackgroundImage from "@/public/darkBackground.jpg";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import Loader from "./loading";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = new QueryClient();

  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background transition-all duration-500 flex`}
      >
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <MainLayout>{children}</MainLayout>
          </SessionProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

const MainLayout: FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isStart = pathname === "/" || pathname.startsWith("/auth/");

  // Show loader while checking session for protected pages
  if (!isStart && status === "loading") {
    return <Loader />;
  }

  // Show loader if not authenticated and not on start/auth routes
  if (!isStart && !session) {
    return (
      <main className="fixed top-1 right-0 bottom-1 left-64 flex items-center justify-center rounded-4xl border border-lightBorder shadow_left shadow-lightBorder">
        <Loader />
      </main>
    );
  }

  return (
    <>
      {isStart ? <Header /> : <Sidebar />}

      <main
        className={`${
          isStart
            ? "pt-16"
            : "fixed top-1 right-0 bottom-1 left-64 rounded-4xl border border-lightBorder overflow-hidden shadow_left shadow-lightBorder"
        }`}
      >
        <div className="absolute inset-0 -z-10">
          <Image
            src={backgroundImage}
            alt="background"
            fill
            className="object-cover dark:hidden"
          />
          <Image
            src={darkBackgroundImage}
            alt="darkBackground"
            fill
            className="object-cover hidden dark:block"
          />
        </div>
        <div className="relative overflow-auto h-full w-full">{children}</div>
      </main>
    </>
  );
};
