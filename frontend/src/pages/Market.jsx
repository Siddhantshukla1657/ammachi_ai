import React, { useState, useEffect, useRef } from 'react';
import './market.css';
import Sidebar from '../components/Sidebar.jsx';

const MOCK_PRICES = [
  { id: 'rice', name: 'Rice', price: '₹2400', unit: '/quintal', change: '+5.2%', quality: 'Premium', updated: '2 hours ago' },
  { id: 'coconut', name: 'Coconut', price: '₹35', unit: '/piece', change: '0%', quality: 'Standard', updated: '1 hour ago' },
  { id: 'pepper', name: 'Pepper', price: '₹520', unit: '/kg', change: '+8.1%', quality: 'Premium', updated: '30 min ago' }
];

export default function Market() {
  const [location, setLocation] = useState('Kochi');
  const [lastUpdated] = useState(new Date());
  const chartRef = useRef(null);

  useEffect(() => {
    let chart;
    async function init() {
      try {
        let echarts;
        try {
          echarts = await new Function('return import("echarts")')();
        } catch (err) {
          // dynamic import failed (likely dev-tool import analysis). Try CDN fallback
          if (!window.echarts) {
            await new Promise((resolve, reject) => {
              const s = document.createElement('script');
              s.src = 'https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js';
              s.onload = resolve; s.onerror = reject; document.head.appendChild(s);
            }).catch(() => {});
          }
          echarts = window.echarts;
        }

        if (!chartRef.current || !echarts) return;
        chart = (echarts.init ? echarts.init(chartRef.current) : window.echarts.init(chartRef.current));
        const option = {
          color: ['#1ea055', '#89d7a0', '#66c184'],
          tooltip: { trigger: 'axis' },
          legend: { data: ['Rice','Coconut','Pepper'], top: 8, left: 'center', itemGap: 20, textStyle: { color: '#066241' } },
          grid: { left: 40, right: 10, bottom: 30, top: 60 },
          xAxis: { type: 'category', data: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], axisLine: { lineStyle: { color: '#cfeee0' } }, axisLabel: { color: '#2b6b4a' } },
          yAxis: { type: 'value', axisLine: { lineStyle: { color: '#cfeee0' } }, axisLabel: { color: '#2b6b4a' }, splitLine: { lineStyle: { color: 'rgba(47,180,106,0.06)' } } },
          toolbox: { feature: { saveAsImage: {} } },
          series: [
            { name: 'Rice', type: 'line', smooth: true, showSymbol: false, data: [2400,2420,2430,2410,2440,2460,2480], areaStyle: { color: 'rgba(30,180,85,0.12)' }, lineStyle: { width: 2 } },
            { name: 'Coconut', type: 'line', smooth: true, showSymbol: false, data: [32,33,34,33,35,36,36], areaStyle: { color: 'rgba(137,215,160,0.08)' }, lineStyle: { width: 2 } },
            { name: 'Pepper', type: 'line', smooth: true, showSymbol: false, data: [500,510,520,515,530,540,560], areaStyle: { color: 'rgba(102,193,132,0.06)' }, lineStyle: { width: 2 } }
          ]
        };
        chart.setOption(option);
      } catch (e) {}
    }
    init();
    const onResize = () => { if (chart) chart.resize(); };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); if (chart) chart.dispose && chart.dispose(); };
  }, []);

  return (
    <div className="market-layout">
      <Sidebar />
      <main className="market-main page-scroll">
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

          <div className="market-chart card">
            <div ref={chartRef} className="chart-area" />
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
