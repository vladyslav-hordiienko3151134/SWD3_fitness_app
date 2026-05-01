'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState(null); // state to store user data
  const [loading, setLoading] = useState(true); // state for loading status

  //checking if user is logged in when the page loads
  useEffect(() => {
    fetch('/api/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data?.user || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Navigation</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {/*Link available to everyone*/}
            <li style={{ marginBottom: '1rem' }}>
              <Link href="/events" style={{ fontSize: '1.1rem', textDecoration: 'none', color: 'blue' }}>
                All Events
              </Link>
            </li>

            {user ? (
              <>
                {/*Links for logged in users*/}
                <li style={{ marginBottom: '1rem' }}>
                  <Link href="/my-booking" style={{ fontSize: '1.1rem', textDecoration: 'none', color: 'blue' }}>
                    My Bookings
                  </Link>
                </li>

                {/*Link only for admins*/}
                {user.role === 'admin' && (
                  <li style={{ marginBottom: '1rem' }}>
                    <Link href="/admin/users" style={{ fontSize: '1.1rem', textDecoration: 'none', color: 'red' }}>
                      Admin: Manage Users
                    </Link>
                  </li>
                )}

                {/*User info and logout*/}
                <li style={{ marginTop: '2rem' }}>
                  <p>User: {user.first_name} {user.last_name} ({user.role})</p>
                  <button onClick={async () => {
                    await fetch('/api/logout', { method: 'POST' });
                    window.location.reload();
                  }}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                {/*Links for guests*/}
                <li style={{ marginBottom: '1rem' }}>
                  <Link href="/login" style={{ fontSize: '1.1rem', textDecoration: 'none', color: 'blue' }}>
                    Login
                  </Link>
                </li>
                <li style={{ marginBottom: '1rem' }}>
                  <Link href="/register" style={{ fontSize: '1.1rem', textDecoration: 'none', color: 'blue' }}>
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      )}
    </div>
  );
}
