//Mariia Kolodiazhna 3149166
import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/session';

export async function POST(request) {
  //get session
    const sessionId = request.cookies.get('session_id')?.value;
  
  //make session invalid
    if (sessionId) {
        deleteSession(sessionId);
    }
  
    const response = NextResponse.json({
        success: true,
        message: 'Logout successful'
    });
  
    response.cookies.delete('session_id');
  
    return response;
}