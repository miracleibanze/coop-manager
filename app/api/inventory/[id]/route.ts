import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import InventoryItem from "@/models/InventoryItem";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    await connectDB();

    const { qty, reason, ...data } = body;
    const item = await InventoryItem.findById(params.id);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (qty !== undefined) {
      item.history.push({
        before: item.quantity,
        after: item.quantity + qty,
        reason: reason || "Adjustment",
        date: new Date(),
      });
      item.quantity += qty;
    }

    Object.assign(item, data);
    await item.save();

    return NextResponse.json(item);
  } catch (error) {
    console.error("PUT /api/inventory/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const item = await InventoryItem.findByIdAndDelete(params.id);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/inventory/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
