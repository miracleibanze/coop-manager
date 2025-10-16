import { getServerSession } from "next-auth/next";
import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/lib/auth";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse,
  roles: string[] = ["admin", "manager"]
) {
  const session = await getSession();

  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  if (!roles.includes(session.user.role || "")) {
    res.status(403).json({ error: "Forbidden" });
    return null;
  }

  return session;
}
