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

  //event validation 
  export function validateEvent(data, isUpdate = false) {
  const errors = {};
  
  //title check
  if (!isUpdate || data.title !== undefined) {
    //checking the length
    if (!data.title || data.title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    } else if (data.title.length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }
  }
  //description validation
  if (data.description !== undefined && data.description.length > 1000) {
    errors.description = 'Description must be less than 1000 characters';
  }
  //validating instructor name 
   if (!isUpdate || data.instructor_name !== undefined) {
    if (!data.instructor_name || data.instructor_name.length < 2) {
      errors.instructor_name = 'Instructor name must be at least 2 characters';
    } else if (data.instructor_name.length > 100) {
      errors.instructor_name = 'Instructor name must be less than 100 characters';
    }
  }
  //validation of event date
  if (!isUpdate || data.event_date !== undefined) {
    if (!data.event_date) {
      errors.event_date = 'Please, enter event date';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.event_date)) {
      errors.event_date = 'Invalid date format (YYYY-MM-DD)';
    }
  }
  //validation of starting time
  if (!isUpdate || data.start_time !== undefined) {
    if (!data.start_time) {
      errors.start_time = 'Enter start time';
    } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.start_time)) {
      errors.start_time = 'Invalid time format (HH:MM)';
    }
  }
  
  //validation of end time
  if (!isUpdate || data.end_time !== undefined) {
    if (!data.end_time) {
      errors.end_time = 'End time is required';
    } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.end_time)) {
      errors.end_time = 'Invalid time format (HH:MM)';
    }
  }

  //location validation 
  if (!isUpdate || data.location !== undefined) {
    if (!data.location) {
      errors.location = 'Enter location';
    } else if (data.location.length > 200) {
      errors.location = 'Location must be less than 200 characters';
    }
  }
  
  //capacity validation 
  if (!isUpdate || data.capacity !== undefined) {
    if (!data.capacity) {
      errors.capacity = 'Capacity is required';
    } else if (isNaN(data.capacity) || data.capacity < 1) {
      errors.capacity = 'Capacity must be at least 1';
    } else if (data.capacity >= 100 ) {
      errors.capacity = 'Capacity must be less than 100';
    }
  }
  
  return { isValid: Object.keys(errors).length === 0, errors };
}

//validating booking
export function validateBooking(data) {
  const errors = {};
  
  // validation of event id(length, if exists)
  if (!data.event_id) {
    errors.event_id = 'Enter event ID';
  } else if (isNaN(data.event_id) || data.event_id < 1) {
    errors.event_id = 'Invalid event ID';
  }
  
  return { isValid: Object.keys(errors).length === 0, errors };
}

// login validation
export function validateLogin(data) {
  const errors = {};
  
  // email validation
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }
  
  //password validation
  if (!data.password) {
    errors.password = 'Password is required';
  }
  
  return { isValid: Object.keys(errors).length === 0, errors };
}

// Hashing a password with bcrypt for securiting storage
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

//comparing hash and password text
export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
