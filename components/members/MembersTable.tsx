// components/members/MembersTable.tsx
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

export function MembersTable() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const { data: members, isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers,
  });

  const filteredMembers = members?.filter(
    (member) =>
      member.name.toLowerCase().includes(search.toLowerCase()) &&
      (roleFilter === "all" || member.role === roleFilter)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search members..."
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
      </div>

      <div className="border rounded-lg">
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
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
