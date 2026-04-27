'use client';

import { useEffect, useState } from 'react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);      
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    role: 'attendee',
  });
  const [error, setError] = useState('');

  // fetching all users from backend 
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
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
    // password is required
    const payload = { ...form, password: 'Abc123!' };
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setForm({ first_name: '', last_name: '', phone: '', email: '', role: 'attendee' });
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
      const res = await fetch(`/api/admin/users/${userId}`, {
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
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
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
    <div>
      <h1>Admin</h1>

      <h2>Create new user</h2>
      <form onSubmit={handleCreate}>
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
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="attendee">User</option>
          <option value="organizer">Organizer</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Create</button>
      </form>

      <h2>All Users</h2>
      
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id}>
              {editing?.user_id === user.user_id ? (
                // edit mode
                <>
                  <td>{user.user_id}</td>
                  <td>
                    <input
                      value={editing.first_name}
                      onChange={(e) =>
                        setEditing({ ...editing, first_name: e.target.value })
                      }
                    />
                    <input
                      value={editing.last_name}
                      onChange={(e) =>
                        setEditing({ ...editing, last_name: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={editing.email}
                      onChange={(e) =>
                        setEditing({ ...editing, email: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={editing.role}
                      onChange={(e) =>
                        setEditing({ ...editing, role: e.target.value })
                      }
                    >
                      <option value="attendee">Attendee</option>
                      <option value="organizer">Organizer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <button onClick={() => handleUpdate(user.user_id)}>Save</button>
                    <button onClick={() => setEditing(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                //view mode
                <>
                  <td>{user.user_id}</td>
                  <td>{user.first_name} {user.last_name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button onClick={() => setEditing(user)}>Edit</button>
                    <button onClick={() => handleDelete(user.user_id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}