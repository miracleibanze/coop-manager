// components/dashboard/RecentActivityTable.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/UI/Table";
import { Badge } from "@/components/UI/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "../UI/card";
import { Button } from "../UI/Button";
import { Skeleton } from "../UI/Skeleton";

interface Activity {
  _id: string;
  type: string;
  member: { name: string; email: string };
  amount?: number;
  description: string;
  date: string;
  status?: string;
}

async function fetchRecentActivity(): Promise<Activity[]> {
  const response = await fetch("/api/activity/recent");
  if (!response.ok) throw new Error("Failed to fetch activity");
  return response.json();
}

export function RecentActivityTable() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: fetchRecentActivity,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="text-lg">
                <TableHead>Type</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 4 }).map((_, idx) => (
                    <TableRow key={idx}>
                      {Array.from({ length: 6 }).map((_, subIdx) => (
                        <TableCell className="text-center py-4" key={subIdx}>
                          <Skeleton className="w-full rounded-2xl h-8" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : activities?.map((activity) => (
                    <TableRow key={activity._id}>
                      <TableCell className="capitalize">
                        {activity.type.replace("_", " ")}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {activity.member.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {activity.member.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {activity.amount
                          ? `$${activity.amount.toLocaleString()}`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {new Date(activity.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {activity.status && (
                          <Badge variant={getStatusColor(activity.status)}>
                            {activity.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
