// app/loans/requests/page.tsx
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
import { Select } from "@/components/UI/InputComponents";

interface LoanRequest {
  _id: string;
  member: { name: string; email: string };
  requestedAmount: number;
  reason: string;
  requestDate: string;
  status: "pending" | "approved" | "rejected";
}

async function fetchLoanRequests(): Promise<LoanRequest[]> {
  const response = await fetch("/api/loans?status=pending");
  if (!response.ok) throw new Error("Failed to fetch loan requests");
  return response.json();
}

export default function LoanRequestsPage() {
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: loans,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["loan-requests"],
    queryFn: fetchLoanRequests,
  });

  const filteredLoans = loans?.filter(
    (loan) => statusFilter === "all" || loan.status === statusFilter
  );

  const stats = {
    total: loans?.length || 0,
    pending: loans?.filter((l) => l.status === "pending").length || 0,
    totalRequested: loans?.reduce((sum, l) => sum + l.requestedAmount, 0) || 0,
    averageRequested:
      loans && loans.length > 0
        ? loans.reduce((sum, l) => sum + l.requestedAmount, 0) / loans.length
        : 0,
  };

  const handleStatusUpdate = async (
    id: string,
    status: "approved" | "rejected"
  ) => {
    try {
      const response = await fetch(`/api/loans/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        refetch();
      }
    } catch (error) {
      alert("Error updating loan request");
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
        <h1 className="text-3xl font-bold text-gray-900">Loan Requests</h1>
        <p className="text-gray-600">
          Review and approve/reject loan applications
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
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
            <CardTitle className="text-sm font-medium">
              Total Requested
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRequested.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Average Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.averageRequested.toLocaleString()}
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

      {/* Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Requested Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Loading loan requests...
                  </TableCell>
                </TableRow>
              ) : (
                filteredLoans?.map((loan) => (
                  <TableRow key={loan._id}>
                    <TableCell>
                      <div className="font-medium">{loan.member.name}</div>
                      <div className="text-sm text-gray-500">
                        {loan.member.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      ${loan.requestedAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {loan.reason}
                    </TableCell>
                    <TableCell>
                      {new Date(loan.requestDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(loan.status)}>
                        {loan.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {loan.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleStatusUpdate(loan._id, "approved")
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStatusUpdate(loan._id, "rejected")
                              }
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm">
                          View History
                        </Button>
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
