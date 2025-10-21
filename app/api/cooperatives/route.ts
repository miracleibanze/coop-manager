import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Cooperative from "@/models/Cooperative";
import User from "@/models/User";
import { Types } from "mongoose";

export async function POST(request: NextRequest) {
  console.log("=== COOPERATIVE CREATION START ===");

  try {
    const session = await getServerSession(authOptions);
    console.log("Session data:", session);

    if (!session?.user?.id) {
      console.log("❌ No session or user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ User authenticated:", session.user.id);

    const body = await request.json();
    console.log("Request body:", body);

    const { name, description, location, contactEmail, contactPhone } = body;

    // Validation
    if (
      !name?.trim() ||
      !description?.trim() ||
      !location?.trim() ||
      !contactEmail?.trim() ||
      !contactPhone?.trim()
    ) {
      console.log("❌ Missing required fields");
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    console.log("✅ All fields present");

    if (name.trim().length < 3) {
      console.log("❌ Name too short");
      return NextResponse.json(
        { error: "Cooperative name must be at least 3 characters long" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      console.log("❌ Invalid email format");
      return NextResponse.json(
        { error: "Please enter a valid contact email address" },
        { status: 400 }
      );
    }

    console.log("✅ All validations passed");

    console.log("Connecting to database...");
    await connectDB();
    console.log("✅ Database connected");

    // Check if user already has a cooperative
    console.log("Checking user in database...");
    const existingUser = await User.findById(session.user.id);
    console.log(
      "User from database:",
      existingUser
        ? {
            _id: existingUser._id,
            email: existingUser.email,
            cooperativeId: existingUser.cooperativeId,
            role: existingUser.role,
            provider: existingUser.provider,
          }
        : "User not found"
    );

    if (!existingUser) {
      console.log("❌ User not found in database");
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    // Check if user already has a cooperativeId
    if (existingUser.cooperativeId) {
      console.log(
        "❌ User already has cooperativeId:",
        existingUser.cooperativeId
      );
      return NextResponse.json(
        { error: "You already have a cooperative assigned to your account." },
        { status: 400 }
      );
    }

    console.log("✅ User has no cooperativeId");

    // Check if user already manages a cooperative
    console.log("Checking if user manages any cooperative...");
    const existingCooperativeAsManager = await Cooperative.findOne({
      managerId: new Types.ObjectId(session.user.id),
    });

    console.log(
      "Existing cooperative as manager:",
      existingCooperativeAsManager
    );

    if (existingCooperativeAsManager) {
      console.log(
        "❌ User manages cooperative but cooperativeId not set in User"
      );

      // Update the user's cooperativeId to fix the inconsistency
      console.log("Attempting to fix inconsistency...");
      existingUser.cooperativeId = new Types.ObjectId(
        existingCooperativeAsManager._id
      );
      try {
        await existingUser.save();
        console.log("✅ Fixed user cooperativeId");
      } catch (saveError: any) {
        console.error("❌ Failed to save user:", saveError);
        console.error("Save error details:", saveError.errors);
      }

      return NextResponse.json(
        {
          error:
            "You are already managing a cooperative. Your account has been updated.",
        },
        { status: 400 }
      );
    }

    console.log("✅ User does not manage any cooperative");

    // Generate unique join code
    const generateJoinCode = (): string => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "COOP-";
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    console.log("Generating join code...");
    let joinCode: string = "";
    let isCodeUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isCodeUnique && attempts < maxAttempts) {
      joinCode = generateJoinCode();
      console.log(`Attempt ${attempts + 1}: Generated code: ${joinCode}`);

      // Check if code already exists
      const existingCoop = await Cooperative.findOne({ joinCode });
      if (!existingCoop) {
        isCodeUnique = true;
        console.log("✅ Unique join code found");
      } else {
        console.log("❌ Code exists, trying again");
        attempts++;
      }
    }

    if (!isCodeUnique) {
      console.log(
        "❌ Failed to generate unique join code after",
        maxAttempts,
        "attempts"
      );
      return NextResponse.json(
        { error: "Failed to generate unique join code. Please try again." },
        { status: 500 }
      );
    }

    console.log("Creating cooperative object...");
    // Create new cooperative
    const cooperative = new Cooperative({
      name: name.trim(),
      description: description.trim(),
      location: location.trim(),
      contactEmail: contactEmail.trim().toLowerCase(),
      contactPhone: contactPhone.trim(),
      managerId: new Types.ObjectId(session.user.id),
      joinCode: joinCode.toUpperCase(),
    });

    console.log("Cooperative object created:", cooperative);

    console.log("Saving cooperative...");
    await cooperative.save();
    console.log("✅ Cooperative saved successfully");

    console.log("Updating user with cooperative reference...");
    // Update user with cooperative reference
    existingUser.cooperativeId = new Types.ObjectId(cooperative._id);
    console.log("User object before save:", {
      _id: existingUser._id,
      cooperativeId: existingUser.cooperativeId,
      provider: existingUser.provider,
    });

    try {
      await existingUser.save();
      console.log("✅ User updated successfully with cooperativeId");
    } catch (saveError: any) {
      console.error("❌ Failed to update user:", saveError);
      console.error("User save error details:", saveError.errors);
      console.error("User validation errors:", saveError._message);

      // If user save fails, delete the cooperative we just created
      await Cooperative.findByIdAndDelete(cooperative._id);
      console.log(
        "❌ Rolled back cooperative creation due to user save failure"
      );

      return NextResponse.json(
        { error: "Failed to update user account. Please try again." },
        { status: 500 }
      );
    }

    console.log("=== COOPERATIVE CREATION SUCCESS ===");
    return NextResponse.json(
      {
        message: "Cooperative created successfully",
        cooperative: {
          _id: cooperative._id,
          name: cooperative.name,
          description: cooperative.description,
          location: cooperative.location,
          contactEmail: cooperative.contactEmail,
          contactPhone: cooperative.contactPhone,
          joinCode: cooperative.joinCode,
          managerId: cooperative.managerId,
          isActive: cooperative.isActive,
          createdAt: cooperative.createdAt,
          updatedAt: cooperative.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("=== COOPERATIVE CREATION ERROR ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Full error:", error);

    if (error.errors) {
      console.error("Validation errors:", error.errors);
      Object.keys(error.errors).forEach((key) => {
        console.error(`Field ${key}:`, error.errors[key]);
      });
    }

    if (error._message) {
      console.error("Error _message:", error._message);
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      console.error("Duplicate key error pattern:", error.keyPattern);
      console.error("Duplicate key value:", error.keyValue);

      if (error.keyPattern?.name) {
        return NextResponse.json(
          { error: "A cooperative with this name already exists" },
          { status: 400 }
        );
      }
      if (error.keyPattern?.joinCode) {
        return NextResponse.json(
          { error: "Join code conflict. Please try again." },
          { status: 400 }
        );
      }
      if (error.keyPattern?.managerId) {
        return NextResponse.json(
          {
            error:
              "You are already managing a cooperative. Please refresh the page.",
          },
          { status: 400 }
        );
      }
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      console.error("Validation errors array:", errors);
      return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
