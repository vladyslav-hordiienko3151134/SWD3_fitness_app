//Mariia Kolodiazhna 3149166
import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/validation';

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


export async function PUT(request) {
  try {
    //user must be logged in
    const { session } = getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    //updated fields from request body
    const { first_name, last_name, phone, email, password } = await request.json();

    //dynamic update query
    const updateFields = [];
    const values = [];

    if (first_name !== undefined) {
      updateFields.push('first_name = ?');
      values.push(first_name);
    }
    if (last_name !== undefined) {
      updateFields.push('last_name = ?');
      values.push(last_name);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      values.push(phone);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      values.push(email);
    }
    //hash and update password if user provided a new one
    if (password && password.trim() !== '') {
      const hashed = await hashPassword(password);
      updateFields.push('password = ?');
      values.push(hashed);
    }

    //check if there are fields updated
    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    //update query with user_id
    values.push(session.user_id);
    await pool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`,
      values
    );

    //updated user data to return
    const [users] = await pool.query(
      'SELECT user_id, first_name, last_name, email, phone, role FROM users WHERE user_id = ?',
      [session.user_id]
    );

    //return updated profile
    return NextResponse.json({
      success: true,
      message: 'Profile updated',
      user: users[0]
    });

    //handle possible errors
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}