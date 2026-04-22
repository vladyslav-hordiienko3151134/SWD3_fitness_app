//Ivan Spinko 3151675
import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';

//middleware to enforce authentication on protected API routes
export function middleware(request) {
  const pathname = request.nextUrl.pathname;

  //routes that require a valid session
  const protectedRoutes = ['/api/me', '/api/logout'];

  if (protectedRoutes.includes(pathname)) {
    const { session } = getSessionFromRequest(request);

    //return 401 if session is missing or expired
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

//apply middleware to all API routes
export const config = {
  matcher: ['/api/:path*'],
};
