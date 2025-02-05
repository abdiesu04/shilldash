import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicPaths = [
  "/",
  "/api/tokens/list",
  "/api/tokens/[address]",
  "/shilldash",
  "/api/shill-vision",
  "/sign-in",
  "/sign-up",
  "/api/tokens/trending",
  "/api/tokens/validate",
  "/api/tokens/[address]/reaction",
  "/api/tokens/[address]/save",
  "/tokens/[address]"
];

// Define routes that should be completely ignored by Clerk
const ignoredPaths = [
  "/api/webhooks/clerk",
  "/api/users",
  "/_next",
  "/favicon.ico",
  "/images",
  "/assets"
];

const isPublic = (path: string) => {
  return publicPaths.find((x) =>
    path.match(new RegExp(`^${x}$`.replace("[address]", ".*")))
  );
};

const isIgnored = (path: string) => {
  return ignoredPaths.find((x) => path.match(new RegExp(`^${x}$`)));
};

export default clerkMiddleware(async (auth, request: NextRequest) => {
  if (isIgnored(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (isPublic(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // If the user is not signed in and the route is private, redirect them to sign in
  const { userId } = await auth();
  if (!userId) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 