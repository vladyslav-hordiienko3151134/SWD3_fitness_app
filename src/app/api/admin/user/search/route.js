//Search the users from admin side
//Vladyslav Hordiienko 3151134
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';

export async function GET(request) {
  //check whether admin is logged in, by geting session data from cookie that browser sent us
  const { session } = getSessionFromRequest(request);

  //if there is no session or user is not admin - dont give access, only users with role admin can access
  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { message: 'admin access required' },
      { status: 403 }
    );
  }

  //get search query from URL parameter
  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get('q');

try {
    let query = 'SELECT user_id, first_name, last_name, email, phone, role, created_at FROM users';
    let params = [];

    //if search query exists - filter by name or email
    if (searchQuery && searchQuery.trim() !== '') {
      query += ' WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?';
      const searchPattern = `%${searchQuery}%`;
      params = [searchPattern, searchPattern, searchPattern];
    }

    query += ' ORDER BY user_id';
    
    const [allUsers] = await pool.query(query, params);
    //send  list of users back to frontend
    return NextResponse.json({ users: allUsers });
    
  } catch (error) {
    //if anything crash - error message
    console.error('error getting users:', error);
    return NextResponse.json(
      { message: 'server error' },
      { status: 500 }
    );
  }
}