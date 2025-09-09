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

  const icons = {
    dashboard: (
      <svg width="22" height="22" fill="none" stroke="#2fb46a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/></svg>
    ),
    chat: (
      <svg width="22" height="22" fill="none" stroke="#2b9ee6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    ),
    detect: (
      <svg width="22" height="22" fill="none" stroke="#a259f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="3"/></svg>
    ),
    weather: (
      <svg width="22" height="22" fill="none" stroke="#2b9ee6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 18a5 5 0 0 0-9.9-1H7a4 4 0 1 0 0 8h10a4 4 0 0 0 0-8h-.1z"/><circle cx="12" cy="12" r="5"/></svg>
    ),
    market: (
      <svg width="22" height="22" fill="none" stroke="#2fb46a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 17v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2"/><rect x="1" y="17" width="22" height="6" rx="2"/></svg>
    ),
    community: (
      <svg width="22" height="22" fill="none" stroke="#f31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a7.5 7.5 0 0 1 13 0"/></svg>
    ),
    profile: (
      <svg width="22" height="22" fill="none" stroke="#063f2d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a7.5 7.5 0 0 1 13 0"/></svg>
    ),
    logout: (
      <svg width="22" height="22" fill="none" stroke="#f31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7"/><rect x="3" y="3" width="7" height="18" rx="2"/></svg>
    )
  };

  const items = [
    { key: 'dashboard', label: 'Dashboard', icon: icons.dashboard },
    { key: 'chat', label: 'Chat', icon: icons.chat },
    { key: 'detect', label: 'Detect', icon: icons.detect },
    { key: 'weather', label: 'Weather', icon: icons.weather },
    { key: 'market', label: 'Market', icon: icons.market },
    { key: 'profile', label: 'Profile', icon: icons.profile }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={logoUrl} alt="Ammachi AI" className="sidebar-logo" />
        <div>
          <div className="sidebar-title">Ammachi AI</div>
          <div className="sidebar-subtitle">Your Farming Assistant</div>
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
        {/* <div className="sidebar-user">
          <div className="user-avatar">{profile && profile.name ? profile.name[0] : 'A'}</div>
          <div className="user-name">{profile ? (profile.name || 'Farmer') : 'Guest'}</div>
        </div> */}
        <button className="sidebar-signout" onClick={signOut}>
          {/* <span className="sidebar-icon">{icons.logout}</span> */}
          Logout</button>
      </div>
    </aside>
  );
}
