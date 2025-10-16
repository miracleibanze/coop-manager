// app/settings/roles/page.tsx
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
import { Badge } from "@/components/UI/Badge";

interface Role {
  _id: string;
  name: string;
  permissions: string[];
  memberCount: number;
  createdAt: string;
}

async function fetchRoles(): Promise<Role[]> {
  const response = await fetch("/api/settings/roles");
  if (!response.ok) throw new Error("Failed to fetch roles");
  return response.json();
}

const availablePermissions = [
  "view_members",
  "manage_members",
  "view_contributions",
  "manage_contributions",
  "view_loans",
  "manage_loans",
  "approve_loans",
  "view_expenses",
  "manage_expenses",
  "view_reports",
  "generate_reports",
  "manage_settings",
  "manage_roles",
];

export default function RolesPermissionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    permissions: [] as string[],
  });
  const [loading, setLoading] = useState(false);

  const {
    data: roles,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingRole
        ? `/api/settings/roles/${editingRole._id}`
        : "/api/settings/roles";

      const method = editingRole ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingRole(null);
        setFormData({ name: "", permissions: [] });
        refetch();
      } else {
        alert("Error saving role");
      }
    } catch (error) {
      alert("Error saving role");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      permissions: role.permissions,
    });
    setShowForm(true);
  };

  const handleDelete = async (roleId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this role? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/settings/roles/${roleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        refetch();
      } else {
        alert("Error deleting role");
      }
    } catch (error) {
      alert("Error deleting role");
    }
  };

  const handlePermissionToggle = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const getPermissionLabel = (permission: string) => {
    return permission
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Roles & Permissions
          </h1>
          <p className="text-gray-600">
            Manage user roles and access permissions
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>Add Role</Button>
      </div>

      {/* Role Form */}
      {(showForm || editingRole) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingRole ? "Edit Role" : "Add New Role"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="roleName">Role Name</Label>
                <Input
                  id="roleName"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter role name"
                  required
                />
              </div>

              <div className="space-y-4">
                <Label>Permissions</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availablePermissions.map((permission) => (
                    <div
                      key={permission}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={permission}
                        checked={formData.permissions.includes(permission)}
                        onChange={() => handlePermissionToggle(permission)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label
                        htmlFor={permission}
                        className="text-sm font-normal"
                      >
                        {getPermissionLabel(permission)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading
                    ? "Saving..."
                    : editingRole
                    ? "Update Role"
                    : "Create Role"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRole(null);
                    setFormData({ name: "", permissions: [] });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Member Count</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Loading roles...
                  </TableCell>
                </TableRow>
              ) : (
                roles?.map((role) => (
                  <TableRow key={role._id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map((permission) => (
                          <Badge
                            key={permission}
                            variant="secondary"
                            className="text-xs"
                          >
                            {getPermissionLabel(permission)}
                          </Badge>
                        ))}
                        {role.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{role.memberCount} members</TableCell>
                    <TableCell>
                      {new Date(role.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(role)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(role._id)}
                          disabled={role.memberCount > 0}
                        >
                          Delete
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

      {/* Default Roles Info */}
      <Card>
        <CardHeader>
          <CardTitle>Default Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Administrator</h4>
              <p className="text-sm text-gray-600">
                Full access to all features and settings. Can manage users,
                roles, and system configuration.
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">
                  All Permissions
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Member</h4>
              <p className="text-sm text-gray-600">
                Basic access to view own contributions and loans. Limited to
                personal data and basic features.
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">
                  View Members
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  View Contributions
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  View Loans
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
