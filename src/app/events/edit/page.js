'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditEventPage({ params }) {
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const router = useRouter();

  // fetching current event data
  useEffect(() => {
    fetch(`/api/events/${params.id}`)
      .then(res => res.json())
      .then(data => setForm(data.event));
  }, [params.id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // submitting changed events
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch(`/api/events/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, capacity: parseInt(form.capacity) }),
    });
    if (res.ok) {
      router.push('/events');
    } else {
      const data = await res.json();
      setError(data.error || 'Update failed');
    }
  };

//JSX 
  return (
    <div>
      <h1>Edit event:</h1>
      <form onSubmit={handleSubmit}>
        <input name="title" value={form.title || ''} onChange={handleChange} required />
        <textarea name="description" value={form.description || ''} onChange={handleChange} rows="3" />
        <input name="instructor_name" value={form.instructor_name || ''} onChange={handleChange} required />
        <input name="event_date" type="date" value={form.event_date || ''} onChange={handleChange} required />
        <input name="start_time" type="time" value={form.start_time || ''} onChange={handleChange} required />
        <input name="end_time" type="time" value={form.end_time || ''} onChange={handleChange} required />
        <input name="location" value={form.location || ''} onChange={handleChange} required />
        <input name="capacity" type="number" value={form.capacity || ''} onChange={handleChange} required />
        <button type="submit">Update event</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}