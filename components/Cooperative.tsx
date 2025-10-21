"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/UI/Icons";
import Image from "next/image";
import logo from "@/public/logoSquare.png";
import { Plus, Users } from "lucide-react";

interface CooperativeFormData {
  name: string;
  description: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
}

export default function Cooperative() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create cooperative form state
  const [formData, setFormData] = useState<CooperativeFormData>({
    name: "",
    description: "",
    location: "",
    contactEmail: session?.user?.email || "",
    contactPhone: "",
  });

  // Join cooperative state
  const [joinCode, setJoinCode] = useState("");

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.location.trim() ||
      !formData.contactEmail.trim() ||
      !formData.contactPhone.trim()
    ) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (formData.name.trim().length < 3) {
      setError("Cooperative name must be at least 3 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/cooperatives", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Cooperative created successfully! Redirecting...");

        // IMPORTANT: Update the session with the new cooperative data
        await update({
          ...session,
          user: {
            ...session?.user,
            cooperativeId: data.cooperative._id,
            cooperative: {
              id: data.cooperative._id,
              name: data.cooperative.name,
              description: data.cooperative.description,
            },
          },
        });

        // Force a complete page refresh to reload the layout and session
        setTimeout(() => {
          window.location.href = "/dashboard"; // This causes a full page reload
        }, 1500);
      } else {
        setError(data.error || "Failed to create cooperative");
      }
    } catch (error) {
      console.error("Create cooperative error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!joinCode.trim()) {
      setError("Please enter a cooperative code");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/cooperatives/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ joinCode: joinCode.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Successfully joined the cooperative! Redirecting...");

        // Update session with cooperative data
        await update({
          ...session,
          user: {
            ...session?.user,
            cooperativeId: data.cooperative._id,
            cooperative: {
              id: data.cooperative._id,
              name: data.cooperative.name,
              description: data.cooperative.description,
            },
          },
        });

        // Force a complete page refresh
        setTimeout(() => {
          window.location.href = "/dashboard"; // Full page reload
        }, 1500);
      } else {
        setError(data.error || "Failed to join cooperative");
      }
    } catch (error) {
      console.error("Join cooperative error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ... rest of the component remains the same ...
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleJoinCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJoinCode(e.target.value);
    if (error) setError("");
  };

  return (
    <div className="max-w-2xl w-full space-y-8 bg-foreground/5 backdrop-blur-md border border-lightBorder rounded-2xl p-8 m-auto">
      <div className="text-center">
        <Image
          src={logo}
          alt="logo"
          width={300}
          height={300}
          className="w-14 h-14 mx-auto shadow-md shadow-colorBorder rounded-md"
        />
        <h2 className="mt-6 text-3xl font-extrabold text-primary">
          Welcome to CoopManager
        </h2>
        <p className="mt-2 text-sm text-primary/70">
          Get started by creating a new cooperative or joining an existing one
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-lightBorder">
        <button
          onClick={() => setActiveTab("create")}
          className={`flex-1 py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${
            activeTab === "create"
              ? "border-colorPrimary text-colorPrimary"
              : "border-transparent text-primary/60 hover:text-primary"
          }`}
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Create Cooperative
        </button>
        <button
          onClick={() => setActiveTab("join")}
          className={`flex-1 py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${
            activeTab === "join"
              ? "border-colorPrimary text-colorPrimary"
              : "border-transparent text-primary/60 hover:text-primary"
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Join Cooperative
        </button>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Create Cooperative Form */}
      {activeTab === "create" && (
        <form className="mt-8 space-y-6" onSubmit={handleCreateSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-primary mb-1"
              >
                Cooperative Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-lightBorder bg-background text-primary placeholder-primary/50 focus:outline-none focus:ring-2 focus:ring-colorPrimary focus:border-colorPrimary sm:text-sm transition-colors"
                placeholder="Enter cooperative name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={loading}
                minLength={3}
              />
              <p className="mt-1 text-xs text-primary/50">
                Must be at least 3 characters long
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-primary mb-1"
              >
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-lightBorder bg-background text-primary placeholder-primary/50 focus:outline-none focus:ring-2 focus:ring-colorPrimary focus:border-colorPrimary sm:text-sm transition-colors resize-none"
                placeholder="Describe your cooperative's purpose and activities"
                value={formData.description}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-primary mb-1"
              >
                Location *
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-lightBorder bg-background text-primary placeholder-primary/50 focus:outline-none focus:ring-2 focus:ring-colorPrimary focus:border-colorPrimary sm:text-sm transition-colors"
                placeholder="City, Country or full address"
                value={formData.location}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="contactEmail"
                  className="block text-sm font-medium text-primary mb-1"
                >
                  Contact Email *
                </label>
                <input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-lightBorder bg-background text-primary placeholder-primary/50 focus:outline-none focus:ring-2 focus:ring-colorPrimary focus:border-colorPrimary sm:text-sm transition-colors"
                  placeholder="contact@cooperative.com"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="contactPhone"
                  className="block text-sm font-medium text-primary mb-1"
                >
                  Contact Phone *
                </label>
                <input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-lightBorder bg-background text-primary placeholder-primary/50 focus:outline-none focus:ring-2 focus:ring-colorPrimary focus:border-colorPrimary sm:text-sm transition-colors"
                  placeholder="+1234567890"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-colorPrimary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-colorPrimary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <Loader />
                  Creating Cooperative...
                </span>
              ) : (
                "Create Cooperative"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Join Cooperative Form */}
      {activeTab === "join" && (
        <form className="mt-8 space-y-6" onSubmit={handleJoinSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="joinCode"
                className="block text-sm font-medium text-primary mb-1"
              >
                Cooperative Join Code *
              </label>
              <input
                id="joinCode"
                name="joinCode"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-lightBorder bg-background text-primary placeholder-primary/50 focus:outline-none focus:ring-2 focus:ring-colorPrimary focus:border-colorPrimary sm:text-sm transition-colors text-center font-mono tracking-wider"
                placeholder="Enter join code (e.g., COOP-ABC123)"
                value={joinCode}
                onChange={handleJoinCodeChange}
                disabled={loading}
              />
              <p className="mt-2 text-sm text-primary/60 text-center">
                Ask the cooperative manager for the join code. This code is
                usually a unique identifier for the cooperative.
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !joinCode.trim()}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-colorPrimary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-colorPrimary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <Loader />
                  Joining Cooperative...
                </span>
              ) : (
                "Join Cooperative"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
