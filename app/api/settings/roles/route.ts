// app/api/settings/roles/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Role from "@/models/Role";
import Member from "@/models/Member";
import { connectDB } from "@/lib/db";

// Get all roles
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const roles = await Role.find().sort({ createdAt: -1 });

    // Get member count for each role
    const rolesWithMemberCount = await Promise.all(
      roles.map(async (role) => {
        const memberCount = await Member.countDocuments({ role: role.name });
        return {
          ...role.toObject(),
          memberCount,
        };
      })
    );

    return NextResponse.json(rolesWithMemberCount);
  } catch (error) {
    console.error("Get roles error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create new role
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, permissions } = body;

    await connectDB();

    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return NextResponse.json(
        { error: "Role with this name already exists" },
        { status: 400 }
      );
    }

    const role = await Role.create({
      name,
      permissions,
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    console.error("Create role error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
