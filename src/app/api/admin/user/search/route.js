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
  const userId = searchParams.get('id');
  const searchQuery = searchParams.get('q');

  //if ID is provided, return specific user with their bookings
  if (userId) {
    try {
      const connection = await pool.getConnection();
      
      //fetch user profile
      const [users] = await connection.execute(
        `SELECT user_id, first_name, last_name, email, phone, role, created_at 
         FROM users WHERE user_id = ?`,
        [userId]
      );
      //in case no user with such id
      if (users.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      //fetch user's bookings
      const [bookings] = await connection.execute(
        `SELECT 
          b.booking_id,
          b.status,
          b.booked_at,
          fc.class_id,
          fc.title,
          fc.start_time,
          fc.end_time,
          fc.location,
          fc.trainer_name as instructor_name,
          DATE(fc.start_time) as event_date,
          TIME(fc.start_time) as start_time,
          TIME(fc.end_time) as end_time
         FROM bookings b
         JOIN fitness_classes fc ON b.class_id = fc.class_id
         WHERE b.user_id = ?
         ORDER BY fc.start_time DESC`,
        [userId]
      );

      connection.release();

      return NextResponse.json({
        user: users[0],
        bookings: bookings,
        total_bookings: bookings.length
      });

    } catch (error) {
      console.error('Error fetching user details:', error);
      return NextResponse.json(
        { error: 'Server error' },
        { status: 500 }
      );
    }
  }

//if no ID entered display all users
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