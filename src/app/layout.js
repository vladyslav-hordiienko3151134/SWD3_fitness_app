'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import './globals.css';

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/user/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setUser(data?.user || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
  };

  // navbar wont be shown untill registration complete
  const hideNav = pathname === '/login' || pathname === '/register';

  return (
    <html lang="en">
      <body>
        {!hideNav && !loading && (
          <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', background: '#f0f0f0', alignItems: 'center' }}>
            <Link href="/events">Events</Link>
            {user?.role === 'organizer' && <Link href="/events/create">Create Event</Link>}
            {user?.role === 'attendee' && <Link href="/my-bookings">My Bookings</Link>}
            {user?.role === 'admin' && (
              <>
                <Link href="/admin/users">Manage Users</Link>
                <Link href="/admin/bookings">All Bookings</Link>
              </>
            )}
            <span style={{ marginLeft: 'auto' }}>
              Hello, {user?.first_name} ({user?.role})
            </span>
            <button onClick={handleLogout}>Logout</button>
          </nav>
        )}
        <main>{children}</main>
      </body>
    </html>
  );
}