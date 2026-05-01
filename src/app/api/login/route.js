//Mariia Kolodiazhna 3149166
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { createSession, SESSION_COOKIE_OPTIONS, SESSION_COOKIE_NAME } from '@/lib/session';
import { validateLogin, comparePassword } from '@/lib/validation';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    //validate required fields
    const { isValid, errors } = validateLogin(body);
    if (!isValid) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
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
    const isPasswordCorrect = await comparePassword(password, user.password);
    if (!isPasswordCorrect) {
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

    response.cookies.set(SESSION_COOKIE_NAME, sessionId, SESSION_COOKIE_OPTIONS);

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}