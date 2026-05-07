//Sofiia Vedenieva/3150837

import bcrypt from 'bcryptjs';

export function validateUser(data, isUpdate = false) {
  const errors = {};

  // validation for first_name
  if (!isUpdate || data.first_name !== undefined) {
    //checking for empty string
    const firstName = typeof data.first_name === 'string' ? data.first_name.trim() : data.first_name;
    if (!firstName || (typeof firstName === 'string' && firstName.length < 2)) {
      errors.first_name = 'First name must be at least 2 characters';
    } else if (typeof firstName === 'string' && firstName.length > 50) {
      errors.first_name = 'First name must be less than 50 characters';
    } else if (typeof firstName !== 'string' || !/^[a-zA-Z\s-]+$/.test(firstName)) {
      errors.first_name = 'Used inappropriate characters in first name';
    }
  }

  // validation for last_name
  if (!isUpdate || data.last_name !== undefined) {
    //checking if the name is empty or too short
    const lastName = typeof data.last_name === 'string' ? data.last_name.trim() : data.last_name;
    if (!lastName || (typeof lastName === 'string' && lastName.length < 2)) {
      errors.last_name = 'Last name must be at least 2 characters';
    } else if (typeof lastName === 'string' && lastName.length > 50) {
      errors.last_name = 'Last name must be less than 50 characters';
    } else if (typeof lastName !== 'string' || !/^[a-zA-Z\s-]+$/.test(lastName)) {
      errors.last_name = 'Used inappropriate characters in last name';
    }
  }
  // emial should be entered
  if (!isUpdate || data.email !== undefined) {
    const email = typeof data.email === 'string' ? data.email.trim() : data.email;
    if (!email) {
      errors.email = 'Email is required';
      //email should be in valid format
    } else if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email format';
    } else if (email.length > 60) {
      errors.email = 'Email should be less than 60 characters';
    }
  }
  //password check (password must nbe 6> and <100)
  if (!isUpdate || data.password !== undefined) {
    //password must be at least 6 characters
    if (data.password && (typeof data.password !== 'string' || data.password.length < 6)) {
      errors.password = 'Password must be at least 6 characters';
    } else if (data.password && typeof data.password === 'string' && data.password.length > 100) {
      errors.password = 'Password must be less than 100 characters';
    }
  }

  if (!isUpdate && data.role && !['admin', 'organizer', 'user'].includes(data.role)) {
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
    const title = typeof data.title === 'string' ? data.title.trim() : data.title;
    if (!title || (typeof title === 'string' && title.length < 3)) {
      errors.title = 'Title must be at least 3 characters';
    } else if (typeof title === 'string' && title.length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }
  }
  //description validation
  if (data.description !== undefined) {
    const description = typeof data.description === 'string' ? data.description.trim() : data.description;
    if (typeof description === 'string' && description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }
  }
  //validating instructor name 
  if (!isUpdate || data.instructor_name !== undefined) {
    //checking the length 
    const instructorName = typeof data.instructor_name === 'string' ? data.instructor_name.trim() : data.instructor_name;
    if (!instructorName || (typeof instructorName === 'string' && instructorName.length < 2)) {
      errors.instructor_name = 'Instructor name must be at least 2 characters';
    } else if (typeof instructorName === 'string' && instructorName.length > 100) {
      errors.instructor_name = 'Instructor name must be less than 100 characters';
    }
  }
  //validation of event date
  if (!isUpdate || data.event_date !== undefined) {
    if (!data.event_date) {
      //checking if the date exists
      errors.event_date = 'Please, enter event date';
    } else if (typeof eventDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
      errors.event_date = 'Invalid date format (YYYY-MM-DD)';
    } else {
      const parsedDate = new Date(eventDate);
      if (isNaN(parsedDate.getTime()) || eventDate !== parsedDate.toISOString().split('T')[0]) {
        errors.event_date = 'Invalid date';
      }
    }
  }
  //validation of starting time
  if (!isUpdate || data.start_time !== undefined) {
    //checking the format of time
    const startTime = typeof data.start_time === 'string' ? data.start_time.trim() : data.start_time;
    if (!startTime) {
      errors.start_time = 'Enter start time';
    } else if (typeof startTime !== 'string' || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(startTime)) {
      errors.start_time = 'Invalid time format (HH:MM)';
    }
  }

  //validation of end time
  if (!isUpdate || data.end_time !== undefined) {
    //checking if the time exists
    const endTime = typeof data.end_time === 'string' ? data.end_time.trim() : data.end_time;
    if (!endTime) {
      errors.end_time = 'End time is required';
    } else if (typeof endTime !== 'string' || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(endTime)) {
      errors.end_time = 'Invalid time format (HH:MM)';
    } else if (!errors.start_time && data.start_time) {
      const startTimeTrimmed = typeof data.start_time === 'string' ? data.start_time.trim() : data.start_time;
      if (endTime <= startTimeTrimmed) {
        errors.end_time = 'End time must be after start time';
      }
    }
  }

  //location validation 
  if (!isUpdate || data.location !== undefined) {
    const location = typeof data.location === 'string' ? data.location.trim() : data.location;
    if (!location) {
      errors.location = 'Enter location';
    } else if (typeof location === 'string' && location.length > 200) {
      errors.location = 'Location must be less than 200 characters';
    }
  }

  //capacity validation 
  if (!isUpdate || data.capacity !== undefined) {
    //checking the number
    if (!data.capacity) {
      errors.capacity = 'Capacity is required';
    } else {
      const capacityNum = Number(data.capacity);
      if (!Number.isInteger(capacityNum) || capacityNum < 1) {
        errors.capacity = 'Capacity must be at least 1';
      } else if (capacityNum >= 100) {
        errors.capacity = 'Capacity must be less than 100';
      }
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

//validating booking
export function validateBooking(data) {
  const errors = {};

  // validation of event id
  if (!data.event_id) {
    errors.event_id = 'Enter event ID';
  } else {
    const eventIdNum = Number(data.event_id);
    if (!Number.isInteger(eventIdNum) || eventIdNum < 1) {
      errors.event_id = 'Invalid event ID';
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

// login validation
export function validateLogin(data) {
  const errors = {};

  // email validation
  const email = typeof data.email === 'string' ? data.email.trim() : data.email;
  if (!email) {
    errors.email = 'Email is required';
  } else if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
