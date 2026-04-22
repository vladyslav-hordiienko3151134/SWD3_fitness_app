//Mariia Kolodiazhna 3149166
import { NextResponse } from 'next/server';
import { deleteSession, getSessionFromRequest, SESSION_COOKIE_NAME } from '@/lib/session';

export async function POST(request) {
  const { sessionId } = getSessionFromRequest(request);

  //delete session from storage if it exists
  if (sessionId) {
    deleteSession(sessionId);
  }

  //clear session cookie and return success
  const response = NextResponse.json({
    success: true,
    message: 'Logout successful'
  });

  response.cookies.delete(SESSION_COOKIE_NAME);

  return response;
}