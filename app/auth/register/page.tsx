"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [passwordAccepted, setPasswordAccepted] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);

  const router = useRouter();

  const getPasswordStrength = (password: string): string => {
    if (password.length < 6) return "weak";
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length >= 8 && hasLetters && hasNumbers && hasSpecial)
      return "strong";
    if (password.length >= 6 && hasLetters && hasNumbers) return "medium";
    return "weak";
  };

  const handlePasswordBlur = () => {
    const strength = getPasswordStrength(formData.password);
    setPasswordStrength(strength);
    setPasswordAccepted(strength === "medium" || strength === "strong");
  };

  const handleConfirmBlur = () => {
    setPasswordMatch(formData.confirmPassword === formData.password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!passwordAccepted) {
      setError("Password is too weak.");
      setLoading(false);
      return;
    }

    if (!passwordMatch) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(
          "/auth/signin?message=Registration successful! Please sign in."
        );
      } else {
        setError(data.error || "Registration failed.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case "weak":
        return "text-red-600";
      case "medium":
        return "text-yellow-500";
      case "strong":
        return "text-green-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="min-h-screen grid place-content-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 border border-lightBorder sm:px-8 px-4 py-8 backdrop-brightness-110 backdrop-blur-md rounded-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-primary/70">
            Or{" "}
            <a
              href="/auth/signin"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
            </a>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-primary mb-1"
              >
                Full Name (Optional)
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                className="appearance-none rounded-md w-full px-3 py-2 border border-primary/50 text-primary focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-primary mb-1"
              >
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md w-full px-3 py-2 border border-primary/50 text-primary focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-primary mb-1"
              >
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-md w-full px-3 py-2 border border-primary/50 text-primary focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Password (min. 6 characters)"
                value={formData.password}
                onChange={(e) => {
                  handleInputChange(e);
                  handlePasswordBlur();
                }}
                disabled={loading}
                minLength={6}
              />
              {passwordStrength && (
                <p className={`mt-1 text-sm font-medium ${getStrengthColor()}`}>
                  {passwordStrength === "weak" && "Weak password"}
                  {passwordStrength === "medium" && "Medium strength"}
                  {passwordStrength === "strong"
                    ? "Strong password"
                    : "Try mixing letters, symbols and numbers"}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-primary mb-1"
              >
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-md w-full px-3 py-2 border border-primary/50 text-primary focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  handleInputChange(e);
                  handleConfirmBlur();
                }}
                disabled={loading}
              />
              {passwordMatch !== null && (
                <p
                  className={`mt-1 text-sm font-medium ${
                    passwordMatch ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {passwordMatch ? "Passwords match" : "Passwords do not match"}
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={loading || !passwordAccepted || !passwordMatch}
              className="group relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
