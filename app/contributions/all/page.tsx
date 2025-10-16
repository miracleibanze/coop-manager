// app/contributions/all/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/UI/Table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Badge } from "@/components/UI/Badge";
import { Button } from "@/components/UI/Button";

interface Contribution {
  _id: string;
  member: { name: string; email: string };
  amount: number;
  date: string;
  paymentMethod: string;
  status: "pending" | "approved" | "rejected";
  receipt?: string;
}

async function fetchContributions(): Promise<Contribution[]> {
  const response = await fetch("/api/contributions");
  if (!response.ok) throw new Error("Failed to fetch contributions");
  return response.json();
}

export default function AllContributionsPage() {
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: contributions,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["contributions"],
    queryFn: fetchContributions,
  });

  const filteredContributions = contributions?.filter(
    (contribution) =>
      statusFilter === "all" || contribution.status === statusFilter
  );

  const stats = {
    total: contributions?.reduce((sum, c) => sum + c.amount, 0) || 0,
    pending: contributions?.filter((c) => c.status === "pending").length || 0,
    approved: contributions?.filter((c) => c.status === "approved").length || 0,
    rejected: contributions?.filter((c) => c.status === "rejected").length || 0,
  };

  const handleStatusUpdate = async (
    id: string,
    status: "approved" | "rejected"
  ) => {
    try {
      const response = await fetch(`/api/contributions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        refetch();
      }
    } catch (error) {
      alert("Error updating contribution");
    }
  };

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">All Contributions</h1>
        <p className="text-gray-600">
          Track member contributions and approve/reject entries
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.total.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.approved}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.rejected}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Contributions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contributions List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Loading contributions...
                  </TableCell>
                </TableRow>
              ) : (
                filteredContributions?.map((contribution) => (
                  <TableRow key={contribution._id}>
                    <TableCell>
                      <div className="font-medium">
                        {contribution.member.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contribution.member.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      ${contribution.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(contribution.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="capitalize">
                      {contribution.paymentMethod.replace("_", " ")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(contribution.status)}>
                        {contribution.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {contribution.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleStatusUpdate(contribution._id, "approved")
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStatusUpdate(contribution._id, "rejected")
                              }
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {contribution.receipt && (
                          <Button variant="outline" size="sm">
                            View Receipt
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
