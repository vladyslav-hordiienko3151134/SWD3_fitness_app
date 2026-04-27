'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');

  // fetching events and current user
  const fetchEvents = async () => {
    const res = await fetch('/api/events');
    const data = await res.json();
    setEvents(data.events || []);
  };

  useEffect(() => {
    fetch('/api/user/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data?.user));
    fetchEvents().then(() => setLoading(false));
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
    if (!confirm('Delete this event? All bookings will be lost.')) return;
    const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
    if (res.ok) {
      fetchEvents();
    } else {
      const err = await res.json();
      alert(err.error || 'Delete failed');
    }
  };


  return (
    <div>
      <h1>Upcoming Fitness Events</h1>
      {message && <p>{message}</p>}
      {events.length === 0 && <p>No events found.</p>}
      {events.map(event => {
        const isFullyBooked = event.current_bookings >= event.capacity;
        const isPast = new Date(event.event_date) < new Date();
        const canBook = user?.role === 'attendee' && !isFullyBooked && !isPast;

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
            <hr />
          </div>
        );
      })}
    </div>
  );
}