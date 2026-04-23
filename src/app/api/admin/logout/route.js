//Admin logout
//Vladyslav Hordiienko 3151134
import { NextResponse } from 'next/server';
//import functions to work with sessions
import { deleteSession, getSessionFromRequest, SESSION_COOKIE_NAME } from '@/lib/session';

export async function POST(request) {
  
  //get session id from cooki that browser sent with a request
  const { sessionId } = getSessionFromRequest(request);

    //if session exists- delete it
  if (sessionId) {
    deleteSession(sessionId);
  }

  const response = NextResponse.json({
    success: true,                    
    message: 'admin logout' 
  });

  //delete the cookie from browser
  response.cookies.delete(SESSION_COOKIE_NAME);

  return response;
}