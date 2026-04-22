//Mariia Kolodiazhna 3149166
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { createSession, SESSION_COOKIE_OPTIONS, SESSION_COOKIE_NAME } from '@/lib/session';

export async function POST(request) {
  try {
    const { first_name, last_name, phone, email, password } = await request.json();

    //validation
    if (!first_name || !last_name || !phone || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    //check if user exists
    const [existingUsers] = await pool.query(
      'SELECT email FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    //create user
    const [result] = await pool.query(
      `INSERT INTO users (first_name, last_name, phone, email, password, role) 
       VALUES (?, ?, ?, ?, ?, 'user')`,
      [first_name, last_name, phone, email, password]
    );

    //fetch created user
    const [newUser] = await pool.query(
      'SELECT user_id, first_name, last_name, email, phone, role FROM users WHERE user_id = ?',
      [result.insertId]
    );

    const user = newUser[0];

    //create session
    const sessionId = createSession({
      user_id: user.user_id,
      email: user.email,
      role: user.role
    });

    //return response with cookie
    const response = NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: user
    }, { status: 201 });

    response.cookies.set(SESSION_COOKIE_NAME, sessionId, SESSION_COOKIE_OPTIONS);

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}