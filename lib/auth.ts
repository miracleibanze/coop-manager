// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Cooperative from "@/models/Cooperative";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          await connectDB();

          const user = await User.findOne({
            email: credentials.email.toLowerCase().trim(),
          });

          if (!user) {
            throw new Error("No account found with this email");
          }

          if (!user.passwordHash) {
            throw new Error(
              "This email is registered with Google. Please use Google Sign In."
            );
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          // Prepare user data for return
          const userData: any = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          };

          // Try to get cooperative data, but don't fail if it doesn't exist
          if (user.cooperativeId) {
            try {
              const cooperative = await Cooperative.findById(
                user.cooperativeId
              );
              if (cooperative) {
                userData.cooperativeId = user.cooperativeId.toString();
                userData.cooperative = {
                  id: cooperative._id.toString(),
                  name: cooperative.name,
                  description: cooperative.description,
                };
              }
            } catch (coopError) {
              console.warn("Cooperative not found for user:", user.email);
              // Continue without cooperative data
            }
          }

          return userData;
        } catch (error) {
          // Convert any error to a proper Error object that can be passed to frontend
          if (error instanceof Error) {
            throw error;
          }
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        // Only add cooperative fields if they exist
        if (user.cooperativeId) {
          token.cooperativeId = user.cooperativeId;
        }
        if (user.cooperative) {
          token.cooperative = user.cooperative;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        // Only add cooperative fields if they exist in token
        if (token.cooperativeId) {
          session.user.cooperativeId = token.cooperativeId as string;
        }
        if (token.cooperative) {
          session.user.cooperative = token.cooperative as {
            id: string;
            name: string;
            description: string;
          };
        }
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after sign in
      if (url.includes("/auth/signin") || url === baseUrl) {
        return `${baseUrl}/dashboard`;
      }
      return url;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role?: string;
      image?: string;
      cooperativeId?: string;
      cooperative?: {
        id: string;
        name: string;
        description: string;
      };
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role?: string;
    image?: string;
    cooperativeId?: string;
    cooperative?: {
      id: string;
      name: string;
      description: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    cooperativeId?: string;
    cooperative?: {
      id: string;
      name: string;
      description: string;
    };
  }
}
