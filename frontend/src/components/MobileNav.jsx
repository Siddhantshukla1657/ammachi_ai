import React from 'react';
import './mobile-nav.css';

export default function MobileNav(){
  function navigate(h){
    window.location.hash = '#/' + h;
    try { window.dispatchEvent(new HashChangeEvent('hashchange')); } catch(e){}
  }

  return (
    <nav className="mobile-nav">
      <button className="mn-item" onClick={() => navigate('dashboard')}>🏠<span>Dashboard</span></button>
      <button className="mn-item" onClick={() => navigate('chat')}>💬<span>Chat</span></button>
      <button className="mn-item" onClick={() => navigate('detect')}>🔎<span>Detect</span></button>
      <button className="mn-item" onClick={() => navigate('weather')}>☁️<span>Weather</span></button>
      <button className="mn-item" onClick={() => navigate('market')}>💰<span>Market</span></button>
    </nav>
  );
}
