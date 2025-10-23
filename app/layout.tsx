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
import Loading from "./loading";
import Cooperative from "@/components/Cooperative";
import HeadingCard from "@/components/UI/HeadingCard";
import Head from "next/head"; // ✅ Use this
import { Provider, useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState, store } from "@/redux/store";
import { toggleSidebar } from "@/redux/slices/SidebarSlice";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const pathname = usePathname();

  const pageTitle =
    "Coopmanager " +
    (pathname.split("/")[1]
      ? `| ${pathname.split("/")[1]}`
      : "| your trusted partner");

  return (
    <html lang="en" className="dark">
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content="Coopmanager — your trusted cooperative management platform."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background transition-all duration-500 flex`}
      >
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <SessionProvider>
              <MainLayout>{children}</MainLayout>
            </SessionProvider>
          </QueryClientProvider>
        </Provider>
      </body>
    </html>
  );
}

const MainLayout: FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isStart =
    (!session?.user && pathname === "/") || pathname.startsWith("/auth/");

  if (status === "loading") return <Loading />;

  if (!isStart && !session) {
    return (
      <main className="fixed top-1 right-0 bottom-1 left-64 flex items-center justify-center rounded-4xl border border-lightBorder shadow_left shadow-lightBorder">
        <Loading />
      </main>
    );
  }

  return (
    <>
      {!isStart &&
      status === "authenticated" &&
      !session?.user?.cooperativeId ? (
        <Cooperative />
      ) : (
        <>
          {isStart ? <Header /> : <Sidebar />}
          <main
            className={`${
              isStart
                ? "pt-16 w-full"
                : "fixed top-1 right-0 bottom-1 left-64 rounded-4xl border border-lightBorder shadow_left shadow-lightBorder"
            } flex flex-col`}
          >
            {!isStart && (
              <HeadingCard
                title={
                  (session?.user && session.user.cooperative?.name) ||
                  "Dashboard"
                }
                subTitle={`Welcome back, ${
                  session?.user?.name || "manage your cooperative"
                }! ${
                  session?.user.cooperative?.name
                    ? "managing " + session.user.cooperative?.name
                    : ""
                }`}
              />
            )}
            <div className={`${isStart ? "fixed" : "absolute"} inset-0 -z-10`}>
              <Image
                src={backgroundImage}
                alt="background"
                fill
                className="object-cover dark:hidden opacity-35"
              />
              <Image
                src={darkBackgroundImage}
                alt="darkBackground"
                fill
                className="object-cover hidden dark:block"
              />
            </div>
            <div
              className={`relative overflow-auto h-full w-full ${
                !isStart ? "section pt-4 pb-20 md:px-3 space-y-6" : ""
              }`}
            >
              {children}
            </div>
          </main>
        </>
      )}
    </>
  );
};
