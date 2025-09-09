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
    <div className="dash-layout">
      <Sidebar />
      <section className="dash-container dash-main">
        <header className="dash-header">
          <h1 className="dash-title">Dashboard</h1>
          <button className="dash-signout" onClick={signOut}>Sign Out</button>
        </header>

        <div className="dash-card">
          <div className="dash-hero">
            <div>
              <h2 className="dash-welcome">Welcome back, {profile.name || session.name || 'Farmer'}!</h2>
              <p className="dash-text">Your crops are looking healthy today</p>
            </div>

            <div className="dash-stats">
              <div className="stat"><div className="label">Scans Done</div><div className="value">2</div></div>
              <div className="stat"><div className="label">Current Temp</div><div className="value">32°C</div></div>
              <div className="stat"><div className="label">Rice Price</div><div className="value">₹2850</div></div>
              <div className="stat"><div className="label">Healthy Crops</div><div className="value">1</div></div>
            </div>
          </div>

          <div className="dash-grid">
            <div className="card"> <strong>Recent Scans</strong>
              <p className="card-note">No recent scans yet.</p>
            </div>
            <div className="card"> <strong>Weather Forecast</strong>
              <p className="card-note">Weather insights will appear here.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
