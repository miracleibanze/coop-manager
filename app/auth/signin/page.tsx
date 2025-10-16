"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (!email || !password) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("SignIn result:", result); // Debug log

      if (result?.error) {
        // Since we return null for errors, we need to determine the specific error
        if (!email || !password) {
          setError("Please enter both email and password");
        } else {
          // Try to determine the specific error based on common patterns
          const userExists = await checkUserExists(email);
          if (!userExists) {
            setError("No account found with this email address");
          } else {
            setError("Invalid password. Please try again.");
          }
        }
      } else if (result?.ok) {
        // Successful sign in
        setSuccessMessage("Sign in successful! Redirecting...");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1000);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if user exists
  const checkUserExists = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.exists;
      }
      return false;
    } catch (error) {
      console.error("Error checking user:", error);
      return false;
    }
  };

  return (
    <div className="min-h-screen grid place-content-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 border border-lightBorder sm:px-8 px-4 py-8 backdrop-brightness-110 backdrop-blur-md rounded-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary">
            Sign in to CoopManager
          </h2>
          <p className="mt-2 text-center text-sm text-primary/80">
            Or{" "}
            <a
              href="/auth/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </a>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-800 text-sm">{successMessage}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-primary mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-primary/30 placeholder-primary/50 text-primary focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-primary mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-primary/30 placeholder-primary/50 text-primary focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
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
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// app/auth/signin/page.tsx
// 'use client';

// import { useState } from 'react';
// import { signIn } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
// import { Button } from '@/components/UI/button';
// import { Input } from '@/components/UI/input';
// import { Label } from '@/components/UI/label';

// export default function SignInPage() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const result = await signIn('credentials', {
//         email: formData.email,
//         password: formData.password,
//         redirect: false,
//       });

//       if (result?.error) {
//         alert('Invalid credentials');
//       } else {
//         router.push('/dashboard');
//       }
//     } catch (error) {
//       alert('Sign in failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData(prev => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle className="text-center text-2xl font-bold">
//             Cooperative Manager
//           </CardTitle>
//           <p className="text-center text-gray-600 mt-2">
//             Sign in to your account
//           </p>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 name="email"
//                 type="email"
//                 required
//                 value={formData.email}
//                 onChange={handleChange}
//                 placeholder="Enter your email"
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 name="password"
//                 type="password"
//                 required
//                 value={formData.password}
//                 onChange={handleChange}
//                 placeholder="Enter your password"
//               />
//             </div>

//             <Button type="submit" className="w-full" disabled={loading}>
//               {loading ? 'Signing in...' : 'Sign In'}
//             </Button>
//           </form>

//           <div className="mt-6 text-center text-sm text-gray-500">
//             Demo credentials: admin@cooperative.com / password
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
