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
    fetch('/api/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setUser(data?.user || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
  };

  // navbar wont be shown untill registration complete
  const hideNav = pathname === '/login' || pathname === '/register';

  return (
    <html lang="en">
      <body>
        {!hideNav && !loading && (
          <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', background: '#333', color: 'white', alignItems: 'center' }}>
            <Link href="/events" style={{ color: 'white', textDecoration: 'none' }}>Events</Link>
            {user?.role === 'organizer' && <Link href="/events/create" style={{ color: 'white', textDecoration: 'none' }}>Create Event</Link>}
            {user?.role === 'user' && <Link href="/my-booking" style={{ color: 'white', textDecoration: 'none' }}>My booking</Link>}
            {user?.role === 'admin' && (
              <>
                <Link href="/admin/users" style={{ color: 'white', textDecoration: 'none' }}>Manage Users</Link>
                <Link href="/admin/bookings" style={{ color: 'white', textDecoration: 'none' }}>All Bookings</Link>
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