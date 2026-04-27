'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (res.ok) {
      router.push('/');
    } else {
      setError(data.error || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto' }}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input name="first_name" placeholder="First Name" onChange={handleChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
        <input name="last_name" placeholder="Last Name" onChange={handleChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
        <input name="phone" placeholder="Phone" onChange={handleChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
        <input name="password" type="password" placeholder="Password (min 6 chars)" onChange={handleChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
        <button type="submit">Register</button>
      </form>
      {error && <p>{error}</p>}
      <p>Already have an account? <Link href="/login">Login</Link></p>
    </div>
  );
}