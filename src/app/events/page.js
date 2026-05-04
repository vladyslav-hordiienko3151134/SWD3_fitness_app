'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // fetching events and current user
  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const userRes = await fetch('/api/me');
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);
        }
        await fetchEvents();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // booking event
  const handleBooking = async (eventId) => {
    setMessage('');
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: eventId }),
    });
    if (res.ok) {
      setMessage('Booking successful!');
      fetchEvents();
    } else {
      const err = await res.json();
      setMessage(err.error || 'Booking failed');
    }
  };

  // deleting event
  const handleDelete = async (eventId) => {
    if (!confirm('Delete this event?')) return;
    const res = await fetch(`/api/events?id=${eventId}`, { method: 'DELETE' });
    if (res.ok) {
      fetchEvents();
    } else {
      const err = await res.json();
      alert(err.error || 'Delete failed');
    }
  };

  if (loading) return <div className="wrap" style={{ paddingTop: '8rem' }}>Loading...</div>;

  return (
    <div className="wrap" style={{ paddingTop: '4rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 className="title">Upcoming <span className="neon">Events</span></h1>
      </header>

      {message && (
        <div className="navbar" style={{ padding: '1rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center', color: message.includes('success') ? 'var(--accent)' : '#ef4444' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
        {events.map(event => {
          const isFullyBooked = event.current_bookings >= event.capacity;
          const isPast = new Date(event.event_date_time) < new Date();
          const canBook = user && user.role === 'user' && !isFullyBooked && !isPast;

          return (
            <div key={event.event_id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{event.title}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>with {event.instructor_name}</p>
              </div>

              <div style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>
                <div style={{ marginBottom: '0.5rem' }}>📍 {event.location}</div>
                <div style={{ marginBottom: '0.5rem' }}>📅 {event.event_date} @ {event.start_time}</div>
                <div style={{ color: isFullyBooked ? '#ef4444' : 'var(--accent)' }}>
                  {isFullyBooked ? 'Fully Booked' : `${event.capacity - event.current_bookings} spots left`}
                </div>
              </div>

              <div style={{ marginTop: 'auto' }}>
                {canBook && (
                  <button onClick={() => handleBooking(event.event_id)} className="btn" style={{ width: '100%', padding: '0.8rem' }}>
                    Book Now
                  </button>
                )}
                {isPast && <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Completed</div>}
                {!user && !isPast && (
                  <Link href="/login" className="btn-alt" style={{ display: 'block', textAlign: 'center', width: '100%' }}>
                    Login to Book
                  </Link>
                )}

                {(user?.role === 'organizer' || user?.role === 'admin') && (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <Link href={`/events/edit?id=${event.event_id}`} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Edit</Link>
                    <button onClick={() => handleDelete(event.event_id)} style={{ background: 'transparent', color: '#ef4444', fontSize: '0.8rem' }}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

