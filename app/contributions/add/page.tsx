// app/contributions/add/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/InputComponents";
import { Label } from "@/components/UI/InputComponents";
import { Select } from "@/components/UI/InputComponents";

interface Member {
  _id: string;
  name: string;
  email: string;
}

async function fetchMembers(): Promise<Member[]> {
  const response = await fetch("/api/members");
  if (!response.ok) throw new Error("Failed to fetch members");
  return response.json();
}

export default function AddContributionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    member: "",
    amount: "",
    paymentMethod: "cash",
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
        }),
      });

      if (response.ok) {
        router.push("/contributions/all");
      } else {
        alert("Error creating contribution");
      }
    } catch (error) {
      alert("Error creating contribution");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add Contribution</h1>
        <p className="text-gray-600">Record a new member contribution</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Contribution Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="member">Member *</Label>
                <Select
                  id="member"
                  name="member"
                  required
                  value={formData.member}
                  onChange={handleChange}
                  disabled={membersLoading}
                >
                  <option value="">Select a member</option>
                  {members?.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($) *</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Enter contribution amount"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select
                  id="paymentMethod"
                  name="paymentMethod"
                  required
                  value={formData.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="cash">Cash</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </Select>
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
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading || membersLoading}>
                {loading ? "Creating..." : "Create Contribution"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
