import React, { useState } from 'react';
import './market.css';
import Sidebar from '../components/Sidebar.jsx';

const MOCK_PRICES = [
  { id: 'rice', name: 'Rice', price: '₹2400', unit: '/quintal', change: '+5.2%', quality: 'Premium', updated: '2 hours ago' },
  { id: 'coconut', name: 'Coconut', price: '₹35', unit: '/piece', change: '0%', quality: 'Standard', updated: '1 hour ago' },
  { id: 'pepper', name: 'Pepper', price: '₹520', unit: '/kg', change: '+8.1%', quality: 'Premium', updated: '30 min ago' },
  { id: 'cardamom', name: 'Cardamom', price: '₹1800', unit: '/kg', change: '-2.3%', quality: 'Premium', updated: '45 min ago' },
  { id: 'coffee', name: 'Coffee', price: '₹280', unit: '/kg', change: '+3.7%', quality: 'Standard', updated: '1 hour ago' },
  { id: 'rubber', name: 'Rubber', price: '₹165', unit: '/kg', change: '-0.5%', quality: 'Standard', updated: '3 hours ago' }
];

export default function Market() {
  const [location, setLocation] = useState('Kochi');
  const [lastUpdated] = useState(new Date());

  return (
    <div className="market-layout">
      <Sidebar />
      <main className="market-main">
        <div className="market-container">
          <header className="market-header">
            <h1 className="market-title">Market Prices</h1>
            <p className="market-sub">Live crop prices and market trends for better selling decisions</p>
          </header>

          <div className="market-controls">
            <div className="control-card">
              <label className="control-label">Select Market Location</label>
              <select className="control-select" value={location} onChange={(e) => setLocation(e.target.value)}>
                <option>Kochi</option>
                <option>Thrissur</option>
                <option>Alappuzha</option>
                <option>Kozhikode</option>
              </select>
              <div className="control-note">Showing prices for {location} market</div>
            </div>

            <div className="control-card status-card">
              <label className="control-label">Last Updated</label>
              <div className="updated-time">{lastUpdated.toLocaleString()}</div>
              <button className="refresh-btn" onClick={() => window.location.reload()}>⟳</button>
            </div>
          </div>

          <section className="prices-grid">
            {MOCK_PRICES.map(p => (
              <article key={p.id} className="price-card">
                <div className="price-card-head">
                  <div className="price-name">{p.name}</div>
                  <div className={`price-change ${p.change.startsWith('-') ? 'neg' : 'pos'}`}>{p.change}</div>
                </div>
                <div className="price-amount">{p.price}<span className="price-unit">{p.unit}</span></div>
                <div className="price-meta">
                  <div><span className="meta-label">Quality:</span> {p.quality}</div>
                  <div><span className="meta-label">Updated:</span> {p.updated}</div>
                </div>
              </article>
            ))}
          </section>

          <section className="market-lower">
            <div className="market-trends card">
              <h3 className="card-title">Market Trends</h3>
              <ul className="trend-list">
                <li>Rising Prices <span className="trend-count">3 crops</span></li>
                <li>Stable Prices <span className="trend-count">2 crops</span></li>
                <li>Falling Prices <span className="trend-count">1 crop</span></li>
              </ul>
            </div>

            <aside className="selling-tips card">
              <h3 className="card-title">Selling Tips</h3>
              <div className="tip">Best Time to Sell - Pepper and Rice showing strong upward trends. Consider selling soon.</div>
              <div className="tip muted">Hold Strategy - Cardamom prices are down. Consider waiting for better rates.</div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}
