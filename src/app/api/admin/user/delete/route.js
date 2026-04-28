//delete user from admin side
//Vladyslav Hordiienko 3151134
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';

export async function DELETE(request) {
  //check whether admin is logged in, by getting session data from cookie that browser sent us
  const { session } = getSessionFromRequest(request);

  //if there is no session or user is not admin - dont give access, only users with role admin can access
  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { message: 'admin access required' },
      { status: 403 }
    );
  }

  //get user id from URL address
  //id is what we take from url and using as parameter
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('id');

    //check if user id  provided
   if (!userId) {
    return NextResponse.json(
       { message: 'Useri id needed' },
      { status: 400 }
    );
  }

  try {
    //checkin if user exists in db
    const [existing] = await pool.query(
      'SELECT user_id FROM users WHERE user_id = ?',//query 
      [userId]//parametr so no sql injections
    );

    //if no user found - send error
    if (existing.length === 0) {
       return NextResponse.json(
        { message: 'user not found' },
          { status: 404 }
      );
    }

    //delete user from database
    await pool.query('DELETE FROM users WHERE user_id = ?', [userId]);//query with parametr 

    //send success response back to frontend
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    //if anything goes wrong - error message
    console.error('error deleting user:', error);
    return NextResponse.json(
      { message: 'server error' },
      { status: 500 }
    );
  }
}