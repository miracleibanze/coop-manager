// app/api/settings/roles/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Role from "@/models/Role";
import Member from "@/models/Member";
import { connectDB } from "@/lib/db";

// Update role
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, permissions } = body;

    await connectDB();

    const role = await Role.findByIdAndUpdate(
      id,
      { name, permissions },
      { new: true }
    );

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json(role);
  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete role
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    // Check if any members are using this role
    const memberCount = await Member.countDocuments({ role: id });
    if (memberCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete role that is assigned to members" },
        { status: 400 }
      );
    }

    const role = await Role.findByIdAndDelete(id);
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error("Delete role error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
