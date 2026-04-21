//Mariia Kolodiazhna 3149166
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { createSession } from '@/lib/session';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    //fetch user
    const [users] = await pool.query(
      'SELECT user_id, first_name, last_name, email, phone, role, password FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0];
    
    //verify password
    if (password !== user.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    //create session
    const sessionId = createSession({
      user_id: user.user_id,
      email: user.email,
      role: user.role
    });

    //return response with cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      }
    });

    response.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}