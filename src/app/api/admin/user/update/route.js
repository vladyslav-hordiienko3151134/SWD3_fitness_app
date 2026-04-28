//update user info(name, email, phone, role, password) - admin side
//Vladyslav Hordiienko 3151134
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';

export async function PUT(request) {
  //check whether admin is logged in, by geting session data from cookie that browser sent us
  const { session } = getSessionFromRequest(request);

   //if there is no session or user is not admin - dont give access, only users with role admin can access
  if (!session || session.role !== 'admin') {
    return NextResponse.json(
       { message: 'admin access required' },
      { status: 403 }
    );
  }

  try {
    //geting user id from url addres
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
     //get new user data from request body
    const {first_name, last_name, phone, email, role, password} = await request.json();

    //check that user id  provided
    if (!userId) {
      return NextResponse.json(
        { message: 'user id nedded' },//if no - message
        { status: 400 }
      );
    }

    //check if user with id  exists in database or not
    const [existing] = await pool.query(
      'SELECT user_id FROM users WHERE user_id = ?',
      [userId]//query wit parametr
    );

    //if no found - error than
    if (existing.length === 0) {
      return NextResponse.json(
          { message: 'user no found' },
        { status: 404 }
      );
    }


    //update user in database with new values
    await pool.query(
      `UPDATE users 
       SET first_name = ?, last_name = ?, phone = ?, email = ?, role = ?, password = ?  WHERE user_id = ?`,
      [first_name, last_name, phone, email, role, password, userId]//parametrs 
    );

    // sending success message back to frontend
    return NextResponse.json({
      success: true,
      message: `user ${first_name} ${last_name} has been updated successfully` //mwssgae that particular user was updated
    });

  } catch (error) {//if somethign wrong 
    console.error('error updating user:', error);
    return NextResponse.json(
      { message: 'server error' },
      { status: 500 }
    );
  }
} 