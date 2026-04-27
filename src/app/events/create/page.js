'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateEventPage() {
    //"array" for storing data
  const [form, setForm] = useState({
    title: '',
    description: '',
    instructor_name: '',
    event_date: '',
    start_time: '',
    end_time: '',
    location: '',
    capacity: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // submitting new event
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, capacity: parseInt(form.capacity) }),
    });
    if (res.ok) {
      router.push('/events');
    } else {
      const data = await res.json();
      setError(data.error || 'Creation failed, try again');
    }
  };
//JSX
  return (
    <div>
      <h1>Create new event</h1>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" onChange={handleChange} required />
        <textarea name="description" placeholder="Description" onChange={handleChange} rows="3" />
        <input name="instructor_name" placeholder="Instructor Name" onChange={handleChange} required />
        <input name="event_date" type="date" onChange={handleChange} required />
        <input name="start_time" type="time" onChange={handleChange} required />
        <input name="end_time" type="time" onChange={handleChange} required />
        <input name="location" placeholder="Location" onChange={handleChange} required />
        <input name="capacity" type="number" placeholder="Capacity" onChange={handleChange} required />
        <button type="submit">Create Event</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}