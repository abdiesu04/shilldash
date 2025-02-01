import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  publicRoutes: [
    "/",
    "/api/tokens/list",
    "/api/tokens/[address]",
    "/api/reactions",  // Allow public access to GET reactions
  ]
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 