import React from 'react';
import './sidebar.css';

const logoUrl = 'https://cdn.builder.io/api/v1/image/assets%2Fc21b63e7074b4525a6e3164505c4a230%2Fac56160c2de4493283652bdd34caa4b0?format=webp&width=300';

export default function Sidebar() {
  function navigate(h) {
    window.location.hash = `#/${h}`;
    try { window.dispatchEvent(new HashChangeEvent('hashchange')); } catch(e) {}
  }

  function signOut() {
    localStorage.removeItem('ammachi_profile');
    localStorage.removeItem('ammachi_session');
    window.location.hash = '#/login';
    try { window.dispatchEvent(new HashChangeEvent('hashchange')); } catch(e) {}
  }

  const profile = (() => { try { return JSON.parse(localStorage.getItem('ammachi_profile') || 'null'); } catch { return null; } })();

  return (
    <aside className="app-sidebar">
      <div className="sidebar-top">
        <img src={logoUrl} alt="Ammachi AI" className="sidebar-logo" />
        <div className="app-name">Ammachi AI</div>
      </div>

      <nav className="sidebar-nav">
        <button className="nav-item" onClick={() => navigate('dashboard')}>Dashboard</button>
        <button className="nav-item" onClick={() => navigate('chat')}>Chat</button>
        <button className="nav-item" onClick={() => navigate('detect')}>Detect</button>
        <button className="nav-item" onClick={() => navigate('weather')}>Weather</button>
        <button className="nav-item" onClick={() => navigate('market')}>Market</button>
        <button className="nav-item" onClick={() => navigate('profile')}>Profile</button>
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-profile">
          <div className="profile-thumb">{profile && profile.name ? profile.name[0] : 'A'}</div>
          <div className="profile-name">{profile ? (profile.name || 'Farmer') : 'Guest'}</div>
        </div>
        <button className="signout" onClick={signOut}>Logout</button>
      </div>
    </aside>
  );
}
