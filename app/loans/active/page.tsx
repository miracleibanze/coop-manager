// app/loans/active/page.tsx
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

interface ActiveLoan {
  _id: string;
  member: { name: string; email: string };
  approvedAmount: number;
  interestRate: number;
  startDate: string;
  dueDate: string;
  amountRepaid: number;
  status: "active" | "completed" | "defaulted";
}

async function fetchActiveLoans(): Promise<ActiveLoan[]> {
  const response = await fetch("/api/loans?status=active");
  if (!response.ok) throw new Error("Failed to fetch active loans");
  return response.json();
}

export default function ActiveLoansPage() {
  const {
    data: loans,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["active-loans"],
    queryFn: fetchActiveLoans,
  });

  const stats = {
    total: loans?.length || 0,
    totalAmount: loans?.reduce((sum, l) => sum + l.approvedAmount, 0) || 0,
    totalRepaid: loans?.reduce((sum, l) => sum + l.amountRepaid, 0) || 0,
    interestEarned:
      loans?.reduce((sum, l) => sum + l.approvedAmount * l.interestRate, 0) ||
      0,
  };

  const handleRecordRepayment = async (loanId: string) => {
    const amount = prompt("Enter repayment amount:");
    if (!amount || isNaN(Number(amount))) return;

    try {
      const response = await fetch(`/api/loans/${loanId}/repayment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount) }),
      });

      if (response.ok) {
        refetch();
      }
    } catch (error) {
      alert("Error recording repayment");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "completed":
        return "default";
      case "defaulted":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Active Loans</h1>
        <p className="text-gray-600">
          Manage active loans and track repayments
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Amount Repaid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRepaid.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Interest Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.interestEarned.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Loans List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Loan Amount</TableHead>
                <TableHead>Interest Rate</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount Repaid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Loading active loans...
                  </TableCell>
                </TableRow>
              ) : (
                loans?.map((loan) => (
                  <TableRow key={loan._id}>
                    <TableCell>
                      <div className="font-medium">{loan.member.name}</div>
                      <div className="text-sm text-gray-500">
                        {loan.member.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      ${loan.approvedAmount?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {(loan.interestRate * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      {new Date(loan.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div
                        className={
                          isOverdue(loan.dueDate)
                            ? "text-red-600 font-medium"
                            : ""
                        }
                      >
                        {new Date(loan.dueDate).toLocaleDateString()}
                        {isOverdue(loan.dueDate) && " (Overdue)"}
                      </div>
                    </TableCell>
                    <TableCell>
                      ${loan.amountRepaid.toLocaleString()}
                      <div className="text-sm text-gray-500">
                        {(
                          (loan.amountRepaid / loan.approvedAmount) *
                          100
                        ).toFixed(1)}
                        % repaid
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(loan.status)}>
                        {loan.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleRecordRepayment(loan._id)}
                        >
                          Record Repayment
                        </Button>
                        {isOverdue(loan.dueDate) && (
                          <Button variant="outline" size="sm">
                            Send Reminder
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
