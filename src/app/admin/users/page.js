'use client';

import { useEffect, useState } from 'react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);      
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [error, setError] = useState('');

  // fetching all users from backend 
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/user/search');
      if (!res.ok) throw new Error('Error');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // creating new user
  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    const payload = { ...form };
    try {
      const res = await fetch('/api/admin/user/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setForm({ first_name: '', last_name: '', phone: '', email: '', password: '', role: 'user' });
        fetchUsers();
      } else {
        setError(data.message || data.error || 'Creation failed, try again');
      }
    } catch (err) {
      setError('Error');
    }
  };

  // updating user
  const handleUpdate = async (userId) => {
    try {
      const res = await fetch(`/api/admin/user/update?id=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });
      if (res.ok) {
        setEditing(null);
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.message || 'Update failed, try again');
      }
    } catch (err) {
      alert('Update failed');
    }
  };

  // deleting users
  const handleDelete = async (userId) => {
    if (!confirm('Are you sure u want to delete this user?')) return;
    try {
      const res = await fetch(`/api/admin/user/delete?id=${userId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.message || 'Delete failed, try again');
      }
    } catch (err) {
      alert('Delete failed, try again');
    }
  };

  return (
    <div className="wrap" style={{ paddingTop: '4rem' }}>
      <h1 className="title" style={{ marginBottom: '3rem' }}>Admin <span className="neon">Panel</span></h1>

      <section className="card" style={{ marginBottom: '4rem' }}>
        <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Create new user</h2>
        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <input
            placeholder="First name"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            required
          />
          <input
            placeholder="Last name"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            required
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'var(--surface-alt)', border: '1px solid var(--border)', color: 'white' }}
          >
            <option value="user">User</option>
            <option value="organizer">Organizer</option>
            <option value="admin">Admin</option>
          </select>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn" style={{ width: '200px' }}>Create User</button>
          </div>
        </form>
        {error && <p style={{ color: '#ef4444', marginTop: '1rem' }}>{error}</p>}
      </section>

      <section className="card">
        <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>All Users</h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem' }}>ID</th>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Role</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_id} style={{ borderBottom: '1px solid var(--border)' }}>
                  {editing?.user_id === user.user_id ? (
                    // edit mode
                    <>
                      <td style={{ padding: '1rem' }}>{user.user_id}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            value={editing.first_name}
                            onChange={(e) => setEditing({ ...editing, first_name: e.target.value })}
                            style={{ padding: '0.5rem' }}
                          />
                          <input
                            value={editing.last_name}
                            onChange={(e) => setEditing({ ...editing, last_name: e.target.value })}
                            style={{ padding: '0.5rem' }}
                          />
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <input
                          value={editing.email}
                          onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                          style={{ padding: '0.5rem' }}
                        />
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <select
                          value={editing.role}
                          onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                          style={{ padding: '0.5rem', borderRadius: '8px', background: 'var(--surface-alt)', border: '1px solid var(--border)', color: 'white' }}
                        >
                          <option value="user">User</option>
                          <option value="organizer">Organizer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn" onClick={() => handleUpdate(user.user_id)} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Save</button>
                          <button className="btn-alt" onClick={() => setEditing(null)} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Cancel</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    //view mode
                    <>
                      <td style={{ padding: '1rem' }}>{user.user_id}</td>
                      <td style={{ padding: '1rem' }}>{user.first_name} {user.last_name}</td>
                      <td style={{ padding: '1rem' }}>{user.email}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', background: 'var(--surface-alt)', fontSize: '0.8rem' }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn-alt" onClick={() => setEditing(user)} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Edit</button>
                          <button className="btn-alt" onClick={() => handleDelete(user.user_id)} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: '#ef4444' }}>Delete</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
