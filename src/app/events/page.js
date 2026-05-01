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
      console.error('Fetch events error:', err);
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
      fetchEvents(); // refresh to update available spots
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

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Upcoming Fitness Events</h1>
      {message && <p>{message}</p>}
      {events.length === 0 && <p>No events found.</p>}
      {events.map(event => {
        const isFullyBooked = event.current_bookings >= event.capacity;
        const isPast = new Date(event.event_date_time) < new Date();
        const canBook = user && user.role === 'user' && !isFullyBooked && !isPast;

        return (
          <div key={event.event_id}>
            <h2>{event.title}</h2>
            <p><strong>Instructor:</strong> {event.instructor_name}</p>
            <p><strong>Date:</strong> {event.event_date} | {event.start_time} – {event.end_time}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Available spots:</strong> {event.capacity - event.current_bookings} / {event.capacity}</p>
            {canBook && <button onClick={() => handleBooking(event.event_id)}>Book </button>}
            {isFullyBooked && <p>Event is full</p>}
            {isPast && <p>Event already took place</p>}
            {(user?.role === 'organizer' || user?.role === 'admin') && (
              <div>
                <Link href={`/events/edit/${event.event_id}`}>Edit</Link>
                <button onClick={() => handleDelete(event.event_id)}>Delete</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
