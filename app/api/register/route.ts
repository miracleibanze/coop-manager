// app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => {
      return null;
    });

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { email, password, name } = body;

    // Enhanced validation
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!password?.trim()) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Name validation (optional but if provided, validate)
    if (name && name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check for existing user

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingUser) {
      // Provide more specific error message based on provider
      if (existingUser.provider === "google") {
        return NextResponse.json(
          {
            error:
              "This email is registered with Google. Please use Google Sign In.",
          },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          {
            error:
              "An account already exists with this email. Please sign in instead.",
          },
          { status: 400 }
        );
      }
    }

    const hash = await bcrypt.hash(password, 12); // Increased salt rounds for better security

    const user = await User.create({
      email: email.trim().toLowerCase(),
      passwordHash: hash,
      name: name?.trim() || "",
      role: "manager", // Changed from "admin" to "manager" as per your system
      provider: "credentials",
      // cooperativeId is not set here - user will create/join cooperative after registration
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully! You can now sign in.",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // More specific error messages for common issues
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: "Invalid user data provided" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error. Please try again later." }, // Generic message for security
      { status: 500 }
    );
  }
}
