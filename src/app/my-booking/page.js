'use client';

import { useEffect, useState } from 'react';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch user's bookings
  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Fetch bookings error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // cancelling a booking
  const cancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    const res = await fetch(`/api/bookings?id=${bookingId}`, { method: 'DELETE' });
    if (res.ok) {
      fetchBookings();
    } else {
      const err = await res.json();
      alert(err.error || 'Cancellation failed, try again');
    }
  };

//JSX
  return (
    <div className="wrap" style={{ paddingTop: '4rem' }}>
      <h1 className="title" style={{ marginBottom: '3rem' }}>My <span className="neon">Bookings</span></h1>
      
      {loading ? (
        <p>Loading your schedule...</p>
      ) : bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>You haven't booked any sessions yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
          {bookings.map(booking => (
            <div key={booking.booking_id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{booking.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Booking ID: #{booking.booking_id}</p>
              </div>

              <div style={{ marginBottom: '2rem', fontSize: '0.9rem', flex: 1 }}>
                <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📅</span> {new Date(booking.event_date).toLocaleDateString()} at {booking.start_time}
                </div>
                <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📍</span> {booking.location}
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '9999px', 
                    background: booking.status === 'confirmed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                    color: booking.status === 'confirmed' ? 'var(--accent)' : '#ef4444',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    {booking.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 'auto' }}>
                {booking.status === 'confirmed' && (
                  <button 
                    onClick={() => cancelBooking(booking.booking_id)} 
                    className="btn-alt" 
                    style={{ width: '100%', padding: '0.8rem', color: '#ef4444' }}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
