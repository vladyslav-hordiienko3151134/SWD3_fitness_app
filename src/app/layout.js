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
        {!loading && (
          <nav className="navbar">
            <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <Link href="/" style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '28px', height: '28px', background: 'var(--primary)', borderRadius: '6px', display: 'grid', placeItems: 'center', color: 'white', fontSize: '0.9rem' }}>F</div>
                  FITNESS
                </Link>
                
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <Link href="/events" style={{ fontSize: '0.9rem', color: pathname.startsWith('/events') ? 'var(--primary)' : 'var(--text-secondary)' }}>Events</Link>
                  {user?.role === 'organizer' && <Link href="/events/create" style={{ fontSize: '0.9rem', color: pathname === '/events/create' ? 'var(--primary)' : 'var(--text-secondary)' }}>Create</Link>}
                  {(user?.role === 'user' || user?.role === 'organizer') && (
                    <Link href="/my-booking" style={{ fontSize: '0.9rem', color: pathname === '/my-booking' ? 'var(--primary)' : 'var(--text-secondary)' }}>
                      {user.role === 'organizer' ? 'My Schedule' : 'My Bookings'}
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <>
                      <Link href="/admin/users" style={{ fontSize: '0.9rem', color: pathname === '/admin/users' ? 'var(--primary)' : 'var(--text-secondary)' }}>Users</Link>
                      <Link href="/admin/bookings" style={{ fontSize: '0.9rem', color: pathname === '/admin/bookings' ? 'var(--primary)' : 'var(--text-secondary)' }}>All Bookings</Link>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {user ? user.first_name : 'Guest'}
                </span>
                {user ? (
                  <button className="btn-alt" onClick={handleLogout}>Logout</button>
                ) : (
                  <Link href="/login" className="btn">Login</Link>
                )}
              </div>
            </div>
          </nav>
        )}
        <main>{children}</main>
        <footer className="wrap" style={{ padding: '3rem 0', borderTop: '1px solid var(--border)', marginTop: '4rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          &copy; 2026 Fitness Booking App.
        </footer>
      </body>
    </html>
  );
}
