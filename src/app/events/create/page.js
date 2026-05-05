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
    <div className="wrap" style={{ display: 'grid', placeItems: 'center', minHeight: '90vh', padding: '4rem 1.5rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '600px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2.5rem', fontSize: '2.25rem' }}>Create New <span className="neon">Event</span></h1>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <input name="title" placeholder="Event Title" onChange={handleChange} required />
          
          <textarea 
            name="description" 
            placeholder="Event Description" 
            onChange={handleChange} 
            rows="4"
            style={{ 
              width: '100%', 
              padding: '1rem', 
              borderRadius: '12px', 
              background: 'var(--surface-alt)', 
              border: '1px solid var(--border)', 
              color: 'white',
              fontFamily: 'inherit',
              fontSize: '1.1rem',
              outline: 'none',
              resize: 'none'
            }}
          />
          
          <input name="instructor_name" placeholder="Instructor Name" onChange={handleChange} required />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '0.5rem' }}>Date</label>
              <input name="event_date" type="date" onChange={handleChange} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '0.5rem' }}>Start</label>
              <input name="start_time" type="time" onChange={handleChange} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '0.5rem' }}>End</label>
              <input name="end_time" type="time" onChange={handleChange} required />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <input name="location" placeholder="Location" onChange={handleChange} required />
            <input name="capacity" type="number" placeholder="Capacity" onChange={handleChange} required />
          </div>
          
          <button type="submit" className="btn" style={{ padding: '1rem', marginTop: '1rem' }}>
            Publish Event
          </button>
        </form>
        
        {error && <p style={{ color: '#ef4444', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>{error}</p>}
      </div>
    </div>
  );
}
