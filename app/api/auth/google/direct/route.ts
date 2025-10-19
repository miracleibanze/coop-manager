// app/api/auth/google/direct/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action"); // 'auth' or 'callback'

  if (action === "auth") {
    // Generate Google OAuth URL
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(
      {
        client_id: process.env.GOOGLE_CLIENT_ID!,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google/direct?action=callback`,
        response_type: "code",
        scope: "openid profile email",
        access_type: "offline",
        prompt: "consent",
        state: "direct_google_oauth",
      }
    )}`;

    console.log("🔍 [DIRECT_GOOGLE_OAUTH] Redirecting to Google OAuth");
    return NextResponse.redirect(authUrl);
  }

  if (action === "callback") {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    console.log("🔍 [DIRECT_GOOGLE_OAUTH] Callback received:", { code, error });

    if (error) {
      console.error("🔍 [DIRECT_GOOGLE_OAUTH] OAuth error:", error);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/auth/signin?error=GoogleOAuthFailed&details=${error}`
      );
    }

    if (!code) {
      console.error("🔍 [DIRECT_GOOGLE_OAUTH] No authorization code received");
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/auth/signin?error=NoAuthorizationCode`
      );
    }

    try {
      // Exchange code for tokens
      console.log("🔍 [DIRECT_GOOGLE_OAUTH] Exchanging code for tokens...");
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          code: code,
          grant_type: "authorization_code",
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google/direct?action=callback`,
        }),
      });

      const tokenData = await tokenResponse.json();
      console.log(
        "🔍 [DIRECT_GOOGLE_OAUTH] Token response status:",
        tokenResponse.status
      );

      if (!tokenResponse.ok) {
        console.error(
          "🔍 [DIRECT_GOOGLE_OAUTH] Token exchange error:",
          tokenData
        );
        return NextResponse.redirect(
          `${process.env.NEXTAUTH_URL}/auth/signin?error=TokenExchangeFailed`
        );
      }

      // Get user info from Google
      console.log("🔍 [DIRECT_GOOGLE_OAUTH] Fetching user info...");
      const userResponse = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        }
      );

      const userInfo = await userResponse.json();
      console.log("🔍 [DIRECT_GOOGLE_OAUTH] User info received:", {
        email: userInfo.email,
        name: userInfo.name,
        email_verified: userInfo.verified_email,
      });

      if (!userInfo.verified_email) {
        console.error("🔍 [DIRECT_GOOGLE_OAUTH] Email not verified");
        return NextResponse.redirect(
          `${process.env.NEXTAUTH_URL}/auth/signin?error=EmailNotVerified`
        );
      }

      // Create or update user in database
      console.log("🔍 [DIRECT_GOOGLE_OAUTH] Connecting to database...");
      await connectDB();

      const existingUser = await User.findOne({
        email: userInfo.email.toLowerCase().trim(),
      });

      if (existingUser) {
        console.log("🔍 [DIRECT_GOOGLE_OAUTH] Updating existing user");
        await User.findByIdAndUpdate(existingUser._id, {
          name: userInfo.name,
          image: userInfo.image,
          provider: "google",
          emailVerified: new Date(),
        });
      } else {
        console.log("🔍 [DIRECT_GOOGLE_OAUTH] Creating new user");
        await User.create({
          email: userInfo.email.toLowerCase().trim(),
          name: userInfo.name,
          image: userInfo.image,
          role: "manager",
          provider: "google",
          emailVerified: new Date(),
        });
      }

      console.log(
        "🔍 [DIRECT_GOOGLE_OAUTH] OAuth process completed successfully"
      );
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard?googleAuthSuccess=true`
      );
    } catch (error: any) {
      console.error("🔍 [DIRECT_GOOGLE_OAUTH] Process error:", error);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/auth/signin?error=OAuthProcessFailed&details=${error.message}`
      );
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
