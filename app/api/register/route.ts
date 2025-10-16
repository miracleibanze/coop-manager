import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    console.log("=== REGISTRATION ATTEMPT ===");

    const body = await request.json().catch(() => {
      console.log("Invalid JSON in request body");
      return null;
    });

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    console.log("Request body received:", { ...body, password: "***" });

    const { email, password, name } = body;

    // Basic validation
    if (!email?.trim()) {
      console.log("Email is required");
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!password?.trim()) {
      console.log("Password is required");
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      console.log("Password too short");
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Invalid email format");
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connected successfully");

    // Check for existing user
    console.log("Checking for existing user with email:", email);
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log("User already exists:", email);
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 400 }
      );
    }

    console.log("Creating new user...");
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.trim().toLowerCase(),
      passwordHash: hash,
      name: name?.trim() || "",
      role: "admin",
    });

    console.log("User created successfully:", user.email);

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user: { id: user._id, email: user.email, name: user.name },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("=== REGISTRATION ERROR ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Full error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
