// app/members/all/page.tsx
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
import { Input } from "@/components/UI/InputComponents";
import { Button } from "@/components/UI/Button";
import { Badge } from "@/components/UI/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";

interface Member {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  joinDate: string;
  status: "active" | "inactive";
  totalContributions: number;
}

async function fetchMembers(): Promise<Member[]> {
  const response = await fetch("/api/members");
  if (!response.ok) throw new Error("Failed to fetch members");
  return response.json();
}

export default function AllMembersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: members, isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers,
  });

  const filteredMembers = members?.filter(
    (member) =>
      member.name.toLowerCase().includes(search.toLowerCase()) &&
      (roleFilter === "all" || member.role === roleFilter) &&
      (statusFilter === "all" || member.status === statusFilter)
  );

  const stats = {
    total: members?.length || 0,
    active: members?.filter((m) => m.status === "active").length || 0,
    inactive: members?.filter((m) => m.status === "inactive").length || 0,
    totalContributions:
      members?.reduce((sum, m) => sum + m.totalContributions, 0) || 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">All Members</h1>
        <p className="text-gray-600">
          Manage members, track contributions, and view details
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Active Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Inactive Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.inactive}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalContributions.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search members by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Roles</option>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Members List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Contributions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Loading members...
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers?.map((member) => (
                  <TableRow key={member._id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.role === "admin" ? "default" : "secondary"
                        }
                      >
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(member.joinDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      ${member.totalContributions.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.status === "active" ? "success" : "destructive"
                        }
                      >
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={
                            member.status === "active"
                              ? "text-red-600"
                              : "text-green-600"
                          }
                        >
                          {member.status === "active"
                            ? "Deactivate"
                            : "Activate"}
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
