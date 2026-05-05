'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetching bookings
  const fetchAllBookings = async () => {
    const res = await fetch('/api/bookings');
    const data = await res.json();
    setBookings(data.bookings || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllBookings();
  }, []);

  // updating booking
  const updateStatus = async (bookingId, newStatus) => {
    const res = await fetch(`/api/bookings?id=${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) fetchAllBookings();
    else alert('Update failed');
  };

  if (loading) return <div className="wrap" style={{ paddingTop: '8rem' }}>Loading...</div>;

  return (
    <div className="wrap" style={{ paddingTop: '4rem' }}>
      <h1 className="title" style={{ marginBottom: '3rem' }}>Booking <span className="neon">Management</span></h1>

      <section className="card">
        <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>All active bookings</h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem' }}>ID</th>
                <th style={{ padding: '1rem' }}>Member</th>
                <th style={{ padding: '1rem' }}>Session</th>
                <th style={{ padding: '1rem' }}>Date</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.booking_id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>{booking.booking_id}</td>
                  <td style={{ padding: '1rem' }}>{booking.user_name}</td>
                  <td style={{ padding: '1rem' }}>{booking.event_title}</td>
                  <td style={{ padding: '1rem' }}>{new Date(booking.event_date).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '9999px', 
                      background: booking.status === 'confirmed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                      color: booking.status === 'confirmed' ? 'var(--accent)' : '#ef4444',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {booking.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      {booking.status === 'confirmed' && (
                        <button onClick={() => updateStatus(booking.booking_id, 'cancelled')} className="btn-alt" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: '#ef4444' }}>Cancel</button>
                      )}
                      {booking.status === 'cancelled' && (
                        <button onClick={() => updateStatus(booking.booking_id, 'confirmed')} className="btn-alt" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--accent)' }}>Restore</button>
                      )}
                      <Link href={`/events/edit?id=${booking.class_id}`} className="btn-alt" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                        Edit Class
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
