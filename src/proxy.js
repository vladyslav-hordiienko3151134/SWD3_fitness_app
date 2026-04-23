//Ivan Spinko 3151675
import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';

//proxy to enforce authentication on protected API routes
export function proxy(request) {
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

  //Mariia Kolodiazhna 3149166
  //role-based route permissions
  const adminOnly = ['/api/admin', '/admin'];
  const organizerOrAdmin = ['/api/classes/create', '/api/classes/update', '/api/classes/delete', '/organizer'];
  const authenticatedOnly = ['/api/bookings', '/dashboard'];
  
  //get session for role checking 
  const { session } = getSessionFromRequest(request);
  
  //check admin only routes
  if (adminOnly.some(route => pathname.startsWith(route))) {
    if (!session || session.role !== 'admin') {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  //check organizer an dadmin routes 
  if (organizerOrAdmin.some(route => pathname.startsWith(route))) {
    if (!session || (session.role !== 'organizer' && session.role !== 'admin')) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Organizer access required' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  //add user info to headers for downstream api routes
  if (session && pathname.startsWith('/api')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', session.user_id.toString());
    requestHeaders.set('x-user-role', session.role);
    requestHeaders.set('x-user-email', session.email);
    
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }
  //
  return NextResponse.next();
}

//apply proxy to all API routes
export const config = {
  matcher: ['/api/:path*'],
};
