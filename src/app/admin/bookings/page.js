'use client';

import { useEffect, useState } from 'react';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetching bookings
  const fetchAllBookings = async () => {
    const res = await fetch('/api/admin/bookings');
    const data = await res.json();
    setBookings(data.bookings || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllBookings();
  }, []);

  // updating booking
  const updateStatus = async (bookingId, newStatus) => {
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) fetchAllBookings();
    else alert('Update failed');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>All bookings :</h1>
      <table border="1">
        <thead>
          <tr><th>ID</th><th>User</th><th>Event</th><th>Date</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {bookings.map(booking => (
            <tr key={booking.booking_id}>
              <td>{booking.booking_id}</td>
              <td>{booking.user_name}</td>
              <td>{booking.event_title}</td>
              <td>{booking.event_date}</td>
              <td>{booking.status}</td>
              <td>
                {booking.status === 'confirmed' && (
                  <button onClick={() => updateStatus(booking.booking_id, 'cancelled')}>Cancel</button>
                )}
                {booking.status === 'cancelled' && (
                  <button onClick={() => updateStatus(booking.booking_id, 'confirmed')}>Restore</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
       </table>
    </div>
  );
}