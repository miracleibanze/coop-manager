import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Cooperative from "@/models/Cooperative";

export async function getUserCooperative(userId: string) {
  await connectDB();

  const user = await User.findById(userId).populate("cooperativeId");
  return user?.cooperativeId || null;
}

export async function userHasCooperative(userId: string): Promise<boolean> {
  const cooperative = await getUserCooperative(userId);
  return cooperative !== null;
}

export async function requireCooperative(userId: string) {
  const cooperative = await getUserCooperative(userId);

  if (!cooperative) {
    throw new Error("User does not have a cooperative assigned");
  }

  return cooperative;
}
