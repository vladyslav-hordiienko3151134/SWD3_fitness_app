'use client';

import { useEffect, useState } from 'react';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);

  // fetch user's bookings
  const fetchBookings = async () => {
    const res = await fetch('/api/bookings');
    const data = await res.json();
    setBookings(data.bookings || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // cancelling a booking
  const cancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    const res = await fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' });
    if (res.ok) {
      fetchBookings();
    } else {
      const err = await res.json();
      alert(err.error || 'Cancellation failed, try again');
    }
  };

//JSX
  return (
    <div>
      <h1>My bookings:</h1>
      {bookings.length === 0 && <p>You have no bookings yet</p>}
      {bookings.map(booking => (
        <div key={booking.booking_id}>
          <h3>{booking.title}</h3>
          <p>{booking.event_date} at {booking.start_time}</p>
          <p>Location: {booking.location}</p>
          <p>Status: {booking.status}</p>
          {booking.status === 'confirmed' && (
            <button onClick={() => cancelBooking(booking.booking_id)}>Cancel booking</button>
          )}
          <hr />
        </div>
      ))}
    </div>
  );
}