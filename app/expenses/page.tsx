// app/expenses/page.tsx
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
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/InputComponents";
import { Label } from "@/components/UI/InputComponents";
import { Select } from "@/components/UI/InputComponents";
import { Textarea } from "@/components/UI/InputComponents";

interface Expense {
  _id: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
  receipt?: string;
  createdBy: { name: string };
}

async function fetchExpenses(): Promise<Expense[]> {
  const response = await fetch("/api/expenses");
  if (!response.ok) throw new Error("Failed to fetch expenses");
  return response.json();
}

export default function ExpensesPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: "office",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const {
    data: expenses,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["expenses"],
    queryFn: fetchExpenses,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({
          category: "office",
          amount: "",
          date: new Date().toISOString().split("T")[0],
          description: "",
        });
        refetch();
      } else {
        alert("Error creating expense");
      }
    } catch (error) {
      alert("Error creating expense");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const stats = {
    total: expenses?.reduce((sum, e) => sum + e.amount, 0) || 0,
    monthly:
      expenses
        ?.filter((e) => {
          const expenseDate = new Date(e.date);
          const now = new Date();
          return (
            expenseDate.getMonth() === now.getMonth() &&
            expenseDate.getFullYear() === now.getFullYear()
          );
        })
        .reduce((sum, e) => sum + e.amount, 0) || 0,
    byCategory:
      expenses?.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {} as Record<string, number>) || {},
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600">
            Track cooperative expenses and categorize spending
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Expense"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
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
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.monthly.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(stats.byCategory).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="office">Office</option>
                    <option value="operations">Operations</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="other">Other</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($) *</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="Enter amount"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter expense description"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Submit Expense"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Added By</TableHead>
                <TableHead>Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Loading expenses...
                  </TableCell>
                </TableRow>
              ) : (
                expenses?.map((expense) => (
                  <TableRow key={expense._id}>
                    <TableCell>
                      {new Date(expense.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="capitalize">
                      {expense.category}
                    </TableCell>
                    <TableCell>${expense.amount.toLocaleString()}</TableCell>
                    <TableCell>{expense.description || "-"}</TableCell>
                    <TableCell>{expense.createdBy.name}</TableCell>
                    <TableCell>
                      {expense.receipt ? (
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      ) : (
                        "-"
                      )}
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
