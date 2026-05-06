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
    <div className="wrap" style={{ paddingTop: '2rem' }}>
      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minHeight: '50vh', justifyContent: 'center', marginBottom: '4rem' }}>
        <h1 className="title" style={{ fontSize: '4.5rem', marginBottom: '1.5rem', fontWeight: '800' }}>
          EVERY WORKOUT <span className="neon">COUNTS</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '3rem', maxWidth: '650px' }}>
          Elevate your training in our state-of-the-art environment. Premium equipment, expert instructors, and a community dedicated to growth.
        </p>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <Link href="/events" className="btn btn-big">View Schedule</Link>
          {!user && <Link href="/register" className="btn-alt btn-big">Join the Gym</Link>}
        </div>
      </section>

      <div style={{ width: '100%', aspectRatio: '16/8', borderRadius: '32px', marginBottom: '6rem', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
        <img 
          src="/images/gym.jpeg" 
          alt="Premium Gym Environment" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.style.background = 'linear-gradient(45deg, var(--surface), var(--background))';
            e.target.parentElement.innerHTML = '<div style="display:grid;place-items:center;height:100%;color:var(--text-secondary)">[ Gym Image: images/gym.jpeg ]</div>';
          }}
        />
      </div>

      <div style={{ marginBottom: '6rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '3.5rem', textAlign: 'center' }}>Explore Your <span className="neon">Potential</span></h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {!loading && (
            <>
              {/*Link available to everyone*/}
              <Link href="/events" className="card">
                <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>Group Classes</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '2rem', lineHeight: '1.6' }}>
                  From high-intensity HIIT to restorative yoga, discover the perfect session for your goals.
                </p>
                <div style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Schedule →
                </div>
              </Link>

              {user && user.role !== 'admin' && (
                <>
                  {/*Links for logged in users*/}
                  <Link href="/my-booking" className="card">
                    <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>Personal Schedule</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '2rem', lineHeight: '1.6' }}>
                      {user.role === 'organizer' 
                        ? 'Manage your upcoming classes and track your teaching schedule across the gym.'
                        : 'Manage your upcoming bookings and track your consistency across all your favorite classes.'}
                    </p>
                    <div style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {user.role === 'organizer' ? 'My Schedule →' : 'Dashboard →'}
                    </div>
                  </Link>
                </>
              )}

              {!user && (
                <>
                  {/*Links for guests*/}
                  <Link href="/login" className="card">
                    <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>Member Login</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '2rem', lineHeight: '1.6' }}>
                      Log in to your account to book classes, view your history, and manage your membership.
                    </p>
                    <div style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Login →
                    </div>
                  </Link>
                </>
              )}

              {user?.role === 'admin' && (
                <>
                  {/*Link only for admins*/}
                  <Link href="/admin/users" className="card">
                    <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>Management</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '2rem', lineHeight: '1.6' }}>
                      Administrative tools for managing users, overseeing bookings, and system maintenance.
                    </p>
                    <div style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Control Panel →
                    </div>
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '8rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '3.5rem', textAlign: 'center' }}>Meet Our <span className="neon">Coaches</span></h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '60px', overflow: 'hidden', margin: '0 auto 1.5rem', border: '2px solid var(--primary)' }}>
              <img 
                src="/images/coach1.jpeg" 
                alt="Cristiano Ronaldo" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.style.background = 'var(--surface-alt)';
                  e.target.parentElement.innerHTML = '<div style="display:grid;place-items:center;height:100%;font-weight:800;color:var(--primary)">CR7</div>';
                }}
              />
            </div>
            <h3 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Cristiano Ronaldo</h3>
            <p style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Elite Performance Coach</p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Widely recognized as the best coach in the industry. Cristiano brings unmatched discipline and a winning mentality to every training session
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '60px', overflow: 'hidden', margin: '0 auto 1.5rem', border: '2px solid var(--border)' }}>
              <img 
                src="/images/coach2.jpeg" 
                alt="Lionel Messi" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.style.background = 'var(--surface-alt)';
                  e.target.parentElement.innerHTML = '<div style="display:grid;place-items:center;height:100%;font-weight:800;color:var(--text-secondary)">LM10</div>';
                }}
              />
            </div>
            <h3 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Lionel Messi</h3>
            <p style={{ color: '#ef4444', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Junior Assistant</p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Often considered the worst coach on our team. Leo is mostly here for moral support and occasionally forgets where the dumbbells are
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
