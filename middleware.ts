import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(request) {
    // Additional middleware logic can go here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Public routes that don't require authentication
        const publicRoutes = [
          "/",
          "/auth/signin",
          "/auth/register",
          "/api/auth",
        ];

        // Check if the current route is public
        const isPublicRoute = publicRoutes.some(
          (route) => pathname === route || pathname.startsWith(route + "/")
        );

        if (isPublicRoute) {
          return true;
        }

        // All other routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/members/:path*",
    "/inventory/:path*",
    "/goals/:path*",
    "/transfers/:path*",
    "/reports/:path*",
    "/api/members/:path*",
    "/api/inventory/:path*",
    "/api/goals/:path*",
    "/api/transfers/:path*",
    "/api/reports/:path*",
  ],
};
