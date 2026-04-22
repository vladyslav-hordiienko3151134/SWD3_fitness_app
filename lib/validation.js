//Sofiia Vedenieva/3150837

import bcrypt from 'bcryptjs';

export function validateUser(data, isUpdate = false) {
  const errors = {};
  //user validation 
  if (!isUpdate || data.username !== undefined) {
    //for name length
    if (!data.username || data.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (data.username.length > 50) {
      errors.username = 'Username must be less than 50 characters';
      //if name contains right characters
    } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
      errors.username = 'Used inappropriate characters';
    }
  }
  //emial should be entered (email must be >60 )
  if (!isUpdate || data.email !== undefined) {
    if (!data.email) {
      errors.email = 'Email is required';
      //email should be in valid format
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Invalid email format';
    } else if (data.email.length > 60) {
      errors.email = 'Email should be less than 60 characters';
    }
  }
  //password check (password must nbe 6> and <100)
  if (!isUpdate || data.password !== undefined) {
    if (data.password && data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (data.password && data.password.length > 100) {
      errors.password = 'Password must be less than 100 characters';
    }
   }
   //full name check(name should be 2< and >100)
  if (!isUpdate || data.full_name !== undefined) {
    if (!data.full_name || data.full_name.length < 2) {
      errors.full_name = 'Name must be at least 2 characters';
    } else if (data.full_name.length > 100) {
      errors.full_name = 'Name must be less than 100 characters';
    }
  }
  if (!isUpdate && data.role && !['admin', 'organizer', 'attendee'].includes(data.role)) {
    errors.role = 'Invalid role';
  }
  
  return { isValid: Object.keys(errors).length === 0, errors };
}