//Admin login
//Vladyslav Hordiienko 3151134
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { createSession, SESSION_COOKIE_OPTIONS, SESSION_COOKIE_NAME } from '@/lib/session';

export async function POST(request) {
   //getting email and password from user in login form
  const { email, password } = await request.json();

  //check if user actually input  email and password 
  if (!email || !password) {
        return NextResponse.json(
   { error: 'email and password are required' },
      { status: 400 }
    );
  }
  // check email address for @ with patter
  if (!email.match(/@/)) {
    return NextResponse.json(
      { message: 'email must contain @ symbol' },
      { status: 400 }
    );
  }

  //search database for user with this given  email and role  'admin'
    //here we only want admin users to login here, no just users here 
     const [users] = await pool.query(
    'SELECT user_id, first_name, last_name, email, phone, role, password FROM users WHERE email = ? AND role = "admin"',//query
    [email] //parametr
  );

    //if no admin was found with  email - stop and dipslay no found
    if (users.length === 0) {
    return NextResponse.json(
      { error: 'admin no found' },
      { status: 401 }
    );
  }


   //get very first user from database result of th query
  const user = users[0];


    //checin if typed password from user match password in database
  if (password !== user.password) {
    return NextResponse.json(
      { error: 'invalid password' },//if mo match
      { status: 401 }
    );
  }

     //create session, so session does keep a user loged in until logout
  const sessionId = createSession({
    user_id: user.user_id,
    email: user.email,
    role: user.role
  });

  
  //response with admin info
  const response = NextResponse.json({
    success: true,
    message: 'Admin login successful',
    user: {
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    }
  });

      //set cookie in  browser 
  response.cookies.set(SESSION_COOKIE_NAME, sessionId, SESSION_COOKIE_OPTIONS);
  return response;
}