//Admin create  new user
//Vladyslav Hordiienko 3151134
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';
import { hashPassword } from '@/lib/validation';

export async function POST(request) {
    //check if admin is logged in by geting session from cookie
  const { session } = getSessionFromRequest(request);

    //if no session or no  admin  role - block access
  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { message: 'Admin access required' },
       { status: 403 }
    );
  }

    //getting user data from request body (what admin typed in form)
  const { first_name, last_name, phone, email, password, role } = await request.json();

  //check all required fields are filled
  if (!first_name || !last_name || !email || !password) {
    return NextResponse.json(
      { message: 'First name, last name, email and password required' },
      { status: 400 }
    );
  }

   //email addr check to have @ sign using pattern 
  if (!email.match(/@/)) {
    return NextResponse.json(
      { message: 'Email must contain @' },
      { status: 400 }
    );
  }

  //checking if user with this email already in database
  const [existing] = await pool.query(
    'SELECT email FROM users WHERE email = ?',
    [email]//parametr
  );

  //if email already exist  - show error
  if (existing.length > 0) {
    return NextResponse.json(
      { message: 'user with this email exists' },
      { status: 409 }
    );
  }

  //set default role to 'user'
  const userRole = role || 'user';

  // hash password
  const hashedPassword = await hashPassword(password);

  //make insert  of new user into database
  const [result] = await pool.query(
    'INSERT INTO users (first_name, last_name, phone, email, password, role) VALUES (?, ?, ?, ?, ?, ?)',
    [first_name, last_name, phone || null, email, hashedPassword, userRole]//parametrs so no sql injection possible
  );

  
  return NextResponse.json({
    success: true,
    message: 'User ${first_name} ${last_name} has been created',
    user_id: result.insertId
  }, { status: 201 });
}