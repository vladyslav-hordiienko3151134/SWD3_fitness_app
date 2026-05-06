'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function EditEventPage() {
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  // fetching current event data
  useEffect(() => {
    if (id) {
      fetch(`/api/events?id=${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.event) {
            // format date for input
            if (data.event.event_date) {
              data.event.event_date = new Date(data.event.event_date).toISOString().split('T')[0];
            }
            setForm(data.event);
          } else {
            setError(data.error || 'Event not found');
          }
        });
    }
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // submitting changed events
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch(`/api/events?id=${id}`, {
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
    <div className="wrap" style={{ display: 'grid', placeItems: 'center', minHeight: '90vh', padding: '4rem 1.5rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '600px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2.5rem', fontSize: '2.25rem' }}>Edit <span className="neon">Event</span></h1>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '0.5rem' }}>Title</label>
            <input name="title" value={form.title || ''} onChange={handleChange} required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '0.5rem' }}>Description</label>
            <textarea 
              name="description" 
              value={form.description || ''} 
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
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '0.5rem' }}>Instructor</label>
            <input name="instructor_name" value={form.instructor_name || ''} onChange={handleChange} required />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '0.5rem' }}>Date</label>
              <input name="event_date" type="date" value={form.event_date || ''} onChange={handleChange} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '0.5rem' }}>Start</label>
              <input name="start_time" type="time" value={form.start_time || ''} onChange={handleChange} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '0.5rem' }}>End</label>
              <input name="end_time" type="time" value={form.end_time || ''} onChange={handleChange} required />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '0.5rem' }}>Location</label>
              <input name="location" value={form.location || ''} onChange={handleChange} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '0.5rem' }}>Capacity</label>
              <input name="capacity" type="number" value={form.capacity || ''} onChange={handleChange} required />
            </div>
          </div>
          
          <button type="submit" className="btn" style={{ padding: '1rem', marginTop: '1rem' }}>
            Update Changes
          </button>
        </form>
        
        {error && <p style={{ color: '#ef4444', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>{error}</p>}
      </div>
    </div>
  );
}
