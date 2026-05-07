//Mariia Kolodiazhna 3149166
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  //store user data, loading status, edit mode, form data, and messages
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  //get current user profile on page load
  useEffect(() => {
    fetch('/api/me')
      .then(res => {
        if (!res.ok) throw new Error('Not logged in');
        return res.json();
      })
      .then(data => {
        setUser(data.user);
        setForm({
          first_name: data.user.first_name || '',
          last_name: data.user.last_name || '',
          phone: data.user.phone || '',
          email: data.user.email || '',
          password: ''
        });
        setLoading(false);
      })
      .catch(() => {
        router.push('/login');
      });
  }, []);

  //form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage('');
    setError('');
  };

  //submit profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    //only send fields that have values
    const updateData = {
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone,
      email: form.email
    };
    
    //include password if user entered a new one
    if (form.password && form.password.trim() !== '') {
      updateData.password = form.password;
    }

    const res = await fetch('/api/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    const data = await res.json();

    if (res.ok) {
      setUser(data.user);
      setIsEditing(false);
      setMessage('Profile updated successfully!');
      setForm({
        ...form,
        //clear password field
        password: '' 
      });
    } else {
      setError(data.error || 'Update failed, please try again');
    }
  };

  //cancel editing mode
  const handleCancel = () => {
    setIsEditing(false);
    setForm({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      password: ''
    });
    setMessage('');
    setError('');
  };

  //loading state while fetching user data
  if (loading) {
    return (
      <div className="wrap" style={{ paddingTop: '8rem' }}>
        Loading profile...
      </div>
    );
  }

  return (
    <div className="wrap" style={{ paddingTop: '4rem' }}>
      <h1 className="title" style={{ marginBottom: '3rem' }}>
        My <span className="neon">Profile</span>
      </h1>

      {/* SUCCESS MESSAGE */}
      {message && (
        <div className="card" style={{ 
          marginBottom: '2rem', 
          textAlign: 'center', 
          background: 'rgba(16, 185, 129, 0.1)', 
          border: '1px solid var(--accent)',
          color: 'var(--accent)'
        }}>
          {message}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="card" style={{ 
          marginBottom: '2rem', 
          textAlign: 'center', 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid #ef4444',
          color: '#ef4444'
        }}>
          {error}
        </div>
      )}

      <section className="card">
        {!isEditing ? (
          // VIEW MODE - display user information
          <>
            <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Account Information</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Full Name</div>
              <div style={{ fontSize: '1.1rem' }}>{user.first_name} {user.last_name}</div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Email Address</div>
              <div style={{ fontSize: '1.1rem' }}>{user.email}</div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Phone Number</div>
              <div style={{ fontSize: '1.1rem' }}>{user.phone || 'Not provided'}</div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Account Type</div>
              <div>
                <span style={{ 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '9999px', 
                  background: 'var(--surface-alt)', 
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  {user.role}
                </span>
              </div>
            </div>

            <button 
              className="btn" 
              onClick={() => setIsEditing(true)}
              style={{ width: '100%' }}
            >
              Edit Profile
            </button>
          </>
        ) : (
          // EDIT MODE - form to update user information
          <>
            <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Edit Profile</h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' }}>
                    First Name
                  </label>
                  <input
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' }}>
                    Last Name
                  </label>
                  <input
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' }}>
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' }}>
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' }}>
                    New Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Leave empty to keep current password"
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn" style={{ flex: 1 }}>
                    Save Changes
                  </button>
                  <button type="button" className="btn-alt" onClick={handleCancel} style={{ flex: 1 }}>
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  );
}