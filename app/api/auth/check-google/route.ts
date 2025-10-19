// app/api/debug-auth/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const config = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    HAS_GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    HAS_GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    HAS_NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID_LENGTH: process.env.GOOGLE_CLIENT_ID?.length,
    GOOGLE_CLIENT_SECRET_LENGTH: process.env.GOOGLE_CLIENT_SECRET?.length,
    NEXTAUTH_SECRET_LENGTH: process.env.NEXTAUTH_SECRET?.length,
  };

  console.log("Auth Configuration:", config);

  return NextResponse.json(config);
}
