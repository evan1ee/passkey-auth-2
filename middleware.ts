// app/middleware.ts

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session"; // Adjust based on your actual session management function
import { NextRequest } from "next/server";

// Middleware to check if the user is logged in
export async function middleware(req: NextRequest) {
  const session = await getSession(); // Get session data

  // Check if the user is trying to access a protected route
  const protectedRoutes = ["/dashboard", "/profile", "/logout"];  // Add more protected routes as needed
  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  // If the route is protected and the user is not logged in, redirect to login page
  if (isProtectedRoute && !session.isLoggedIn) {
    console.log("Redirecting to login...");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Continue to the next middleware or page if not a protected route or user is logged in
  return NextResponse.next();
}

// Define the matcher to apply the middleware on specific routes
export const config = {
  matcher: ["/dashboard", "/profile","/logout"], // Add routes to be protected
};
