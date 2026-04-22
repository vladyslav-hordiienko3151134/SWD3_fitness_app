//Mariia Kolodiazhna 3149166
import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { session } = getSessionFromRequest(request);

    //if session expired reject requet
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    //fetch user data from database
    const [users] = await pool.query(
      'SELECT user_id, first_name, last_name, email, phone, role, created_at FROM users WHERE user_id = ?',
      [session.user_id]
    );

    //check user exists
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    //send data to frontend
    return NextResponse.json({ user: users[0] });

    //handle possible errors
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}