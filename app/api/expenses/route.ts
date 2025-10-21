// app/api/expenses/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Expense from "@/models/Expense";
import Activity from "@/models/Activity";
import { connectDB } from "@/lib/db";
import { Types } from "mongoose";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const expenses = await Expense.find({
      cooperativeId: new Types.ObjectId(session.user.cooperativeId),
    })
      .populate("createdBy", "name")
      .sort({ date: -1 })
      .exec();

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Get expenses error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { category, amount, date, description } = body;

    await connectDB();

    const expense = await Expense.create({
      category,
      amount,
      date: new Date(date),
      description,
      createdBy: session.user.id,
    });

    // Log activity
    await Activity.create({
      type: "expense",
      member: session.user.id,
      amount,
      description: `Expense of $${amount} for ${category}`,
      date: new Date(),
    });

    const populatedExpense = await Expense.findById(expense._id).populate(
      "createdBy",
      "name"
    );

    return NextResponse.json(populatedExpense, { status: 201 });
  } catch (error) {
    console.error("Create expense error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
