// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import UserModel from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        },
      },
      // Enhanced HTTP options for better connectivity
      httpOptions: {
        timeout: 10000, // 10 seconds timeout
      },
      // Custom profile handler
      profile(profile) {
        console.log("🔍 [GOOGLE_PROFILE] Received profile:", {
          email: profile.email,
          email_verified: profile.email_verified,
          name: profile.name,
        });

        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email.toLowerCase().trim(),
          image: profile.picture,
          emailVerified: profile.email_verified ? new Date() : null,
        };
      },
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
            console.log("Missing email or password");
            return null;
          }

          await connectDB();

          const user = await UserModel.findOne({
            email: credentials.email.toLowerCase().trim(),
          });

          // Allow both credentials and google users to sign in with password
          // if they have a password hash
          if (!user || !user.passwordHash) {
            console.log("User not found or no password hash");
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isPasswordValid) {
            console.log("Invalid password");
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
            provider: user.provider,
          };
        } catch (error) {
          console.error("Credentials authorization error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log("🔍 [SIGNIN_CALLBACK] Starting signIn", {
          provider: account?.provider,
          userEmail: user?.email,
        });

        // Handle Google sign in
        if (account?.provider === "google") {
          const email = user.email?.toLowerCase().trim();
          if (!email) {
            console.log("No email provided in Google signin");
            return false;
          }

          await connectDB();

          // Check if user exists with this email
          const existingUser = await UserModel.findOne({ email });

          if (existingUser) {
            // If user exists with credentials provider, update to allow Google
            if (existingUser.provider === "credentials") {
              console.log("Updating credentials user to support Google login");
              await UserModel.findByIdAndUpdate(existingUser._id, {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                provider: "both", // Allow both login methods
                emailVerified: new Date(),
                lastLoginAt: new Date(),
              });
            } else {
              // Update existing Google user
              await UserModel.findByIdAndUpdate(existingUser._id, {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                lastLoginAt: new Date(),
              });
            }
          } else {
            // Create new user for Google
            console.log("Creating new Google user");
            await UserModel.create({
              email,
              name: user.name || "Google User",
              image: user.image,
              role: "manager",
              provider: "google",
              emailVerified: new Date(),
              lastLoginAt: new Date(),
            });
          }
          return true;
        }

        // Handle credentials sign in
        if (account?.provider === "credentials" && user?.email) {
          await connectDB();
          await UserModel.findOneAndUpdate(
            { email: user.email.toLowerCase().trim() },
            { lastLoginAt: new Date() }
          );
          return true;
        }

        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return false;
      }
    },

    async jwt({ token, user, account, trigger }) {
      // Initial sign in
      if (user && account) {
        token.provider = account.provider;
        token.id = user.id;
        token.role = user.role;

        if (account.provider === "google") {
          token.picture = user.image;
        }
      }

      // Refresh user data from database
      if (trigger === "update" || (token.email && !token.role)) {
        try {
          await connectDB();
          const dbUser = await UserModel.findOne({
            email: token.email?.toLowerCase().trim(),
          });

          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
            token.name = dbUser.name;
            token.picture = dbUser.image;
            token.provider = dbUser.provider;
          }
        } catch (error) {
          console.error("JWT refresh error:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
        session.user.provider = token.provider as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/auth/signin",
    // signUp: "/auth/register",
    error: "/auth/signin",
  },
  events: {
    async signIn(message) {
      console.log("User signed in:", message.user.email);
    },
    async signOut(message) {
      console.log("User signed out");
    },
  },
  debug: process.env.NODE_ENV === "development",
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role?: string;
      image?: string;
      provider?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role?: string;
    image?: string;
    provider?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    provider?: string;
    picture?: string;
  }
}
