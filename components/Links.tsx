import { JSX } from "react";

// app/config/Links.tsx
export interface SubLink {
  name: string;
  path: string;
  description?: string;
}

export interface MainLink {
  name: string;
  path: string;
  description: string;
  icon?: JSX.Element;
  subLinks?: SubLink[];
}

// Main sidebar links
export const sidebarLinks: MainLink[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    description: "Overview of cooperative activities and key metrics",
  },
  {
    name: "Members",
    path: "/members",
    description: "Manage cooperative members and their contributions",
    subLinks: [
      {
        name: "Member List",
        path: "/members/list",
        description: "All members",
      },
      {
        name: "Member Reports",
        path: "/members/reports",
        description: "Contribution & loan history",
      },
    ],
  },
  {
    name: "Savings",
    path: "/savings",
    description: "Track all member contributions",
    subLinks: [
      {
        name: "All Contributions",
        path: "/savings/all",
        description: "View all deposits",
      },
      {
        name: "Reports",
        path: "/savings/reports",
        description: "Savings reports",
      },
    ],
  },
  {
    name: "Loans",
    path: "/loans",
    description: "Manage loan applications and repayments",
    subLinks: [
      {
        name: "Applications",
        path: "/loans/applications",
        description: "Pending loan requests",
      },
      {
        name: "Repayments",
        path: "/loans/repayments",
        description: "Track repayments",
      },
      {
        name: "Reports",
        path: "/loans/reports",
        description: "Loan reports & stats",
      },
    ],
  },
  {
    name: "Goals / Projects",
    path: "/projects",
    description: "Track cooperative goals and projects",
    subLinks: [
      {
        name: "Active Goals",
        path: "/projects/active",
        description: "Current ongoing goals",
      },
      {
        name: "Completed Goals",
        path: "/projects/completed",
        description: "Finished projects",
      },
      {
        name: "Reports",
        path: "/projects/reports",
        description: "Project status reports",
      },
    ],
  },
  {
    name: "Reports",
    path: "/reports",
    description: "Generate financial and member reports",
  },
  {
    name: "Announcements",
    path: "/announcements",
    description: "Post updates and meeting notices",
  },
  {
    name: "Voting / Polls",
    path: "/polls",
    description: "Create and manage polls for decisions",
  },
  {
    name: "Settings",
    path: "/settings",
    description: "Configure system and user permissions",
  },
  {
    name: "Audit / Logs",
    path: "/audit",
    description: "Track actions and events for auditing",
  },
  {
    name: "Analytics / Insights",
    path: "/analytics",
    description: "Get cooperative performance insights",
  },
];
