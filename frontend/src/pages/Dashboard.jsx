import React from 'react';
import './dashboard.css';

import Sidebar from '../components/Sidebar.jsx';

export default function Dashboard() {
  const profile = (() => {
    try { return JSON.parse(localStorage.getItem('ammachi_profile') || '{}'); } catch { return {}; }
  })();
  const session = (() => {
    try { return JSON.parse(localStorage.getItem('ammachi_session') || '{}'); } catch { return {}; }
  })();

  function signOut() {
    localStorage.removeItem('ammachi_session');
    window.location.hash = '#/login';
  }

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <Sidebar />
      <section className="dash-container" style={{ flex: 1 }}>
        <header className="dash-header">
          <h1 className="dash-title">Dashboard</h1>
          <button className="dash-signout" onClick={signOut}>Sign Out</button>
        </header>
        <div className="dash-card">
          <h2 className="dash-welcome">Welcome {profile.name || session.name || 'Farmer'}!</h2>
          <p className="dash-text">You are signed in. This is the starting point for your tools and insights.</p>
        </div>
      </section>
    </div>
  );
}
