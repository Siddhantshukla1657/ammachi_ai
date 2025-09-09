import React, { useState, useEffect } from 'react';
import './sidebar.css';

const logoUrl = 'https://cdn.builder.io/api/v1/image/assets%2Fc21b63e7074b4525a6e3164505c4a230%2Fac56160c2de4493283652bdd34caa4b0?format=webp&width=300';

export default function Sidebar() {
  const [current, setCurrent] = useState(() => {
    return (window.location.hash || '#/').replace('#/','') || 'dashboard';
  });

  useEffect(() => {
    const onHash = () => setCurrent((window.location.hash || '#/').replace('#/','') || 'dashboard');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

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

  const items = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'chat', label: 'Chat', icon: '💬' },
    { key: 'detect', label: 'Detect', icon: '🔎' },
    { key: 'weather', label: 'Weather', icon: '☁️' },
    { key: 'market', label: 'Market', icon: '📈' },
    { key: 'community', label: 'Community', icon: '👥' },
    { key: 'profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={logoUrl} alt="Ammachi AI" className="sidebar-logo" />
        <div>
          <div className="sidebar-title">Ammachi AI</div>
          <div className="sidebar-subtitle">Your Farm Assistant</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map(item => (
          <button
            key={item.key}
            className={`sidebar-nav-item ${current === item.key ? 'is-active' : ''}`}
            onClick={() => navigate(item.key)}
            aria-current={current === item.key ? 'page' : undefined}
          >
            <span className="sidebar-icon" aria-hidden>{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{profile && profile.name ? profile.name[0] : 'A'}</div>
          <div className="user-name">{profile ? (profile.name || 'Farmer') : 'Guest'}</div>
        </div>
        <button className="sidebar-signout" onClick={signOut}>Logout</button>
      </div>
    </aside>
  );
}
