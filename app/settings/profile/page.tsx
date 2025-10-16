// app/settings/profile/page.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/InputComponents";
import { Label } from "@/components/UI/InputComponents";

export default function ProfileSettingsPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      });

      if (response.ok) {
        await update();
        alert("Profile updated successfully");
      } else {
        alert("Error updating profile");
      }
    } catch (error) {
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/settings/security", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (response.ok) {
        alert("Password updated successfully");
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        const error = await response.json();
        alert(error.error || "Error updating password");
      }
    } catch (error) {
      alert("Error updating password");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <nav className="space-y-2">
              <button
                className={`w-full text-left px-3 py-2 rounded-lg font-medium ${
                  activeTab === "profile"
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("profile")}
              >
                Profile Information
              </button>
              <button
                className={`w-full text-left px-3 py-2 rounded-lg font-medium ${
                  activeTab === "security"
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("security")}
              >
                Security
              </button>
            </nav>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Updating..." : "Update Profile"}
                    </Button>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        required
                        value={formData.currentPassword}
                        onChange={handleChange}
                        placeholder="Enter current password"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        required
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Enter new password"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Updating..." : "Change Password"}
                    </Button>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
