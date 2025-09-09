import React, { useEffect, useRef, useState } from 'react';
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

  const chartRef = useRef(null);

  useEffect(() => {
    let chart;
    async function initChart() {
      try {
        let echarts;
        try {
          echarts = await new Function('return import("echarts")')();
        } catch (err) {
          // try CDN fallback
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
          tooltip: { trigger: 'axis', backgroundColor: 'rgba(4,36,22,0.95)', textStyle: { color: '#fff' } },
          legend: { show: true, data: ['Rice','Coconut','Pepper'], top: 8, left: 'center', itemGap: 24, textStyle: { color: '#066241' } },
          grid: { left: 40, right: 20, bottom: 30, top: 70 },
          xAxis: { type: 'category', data: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], boundaryGap: false, axisLine: { lineStyle: { color: '#cfeee0' } }, axisLabel: { color: '#2b6b4a' } },
          yAxis: { type: 'value', axisLine: { lineStyle: { color: '#cfeee0' } }, axisLabel: { color: '#2b6b4a' }, splitLine: { lineStyle: { color: 'rgba(47,180,106,0.06)' } } },
          toolbox: { feature: { saveAsImage: {} } },
          series: [
            { name: 'Rice', type: 'line', smooth: true, showSymbol: false, data: [2850,2860,2840,2850,2870,2880,2890], areaStyle: { color: 'rgba(47,180,106,0.14)' }, lineStyle: { color: '#1ea055', width: 3 } },
            { name: 'Coconut', type: 'line', smooth: true, showSymbol: false, data: [11,11.5,11.8,12,11.9,12.1,12], areaStyle: { color: 'rgba(137,215,160,0.12)' }, lineStyle: { color: '#89d7a0', width: 2 }, yAxisIndex: 0 },
            { name: 'Pepper', type: 'line', smooth: true, showSymbol: false, data: [56000,56500,56300,57000,57200,58000,57800], areaStyle: { color: 'rgba(102,193,132,0.10)' }, lineStyle: { color: '#66c184', width: 2 }, yAxisIndex: 0 }
          ]
        };
        chart.setOption(option);
      } catch (e) {
        // chart not available or failed - silently continue
      }
    }
    initChart();
    const handleResize = () => { if (chart) chart.resize(); }
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); if (chart) chart.dispose && chart.dispose(); };
  }, []);

  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadWeather() {
      try {
        // default to Kerala if profile has no coords
        const lat = (profile && profile.lat) || 10.8505;
        const lon = (profile && profile.lon) || 76.2711;
        const res = await fetch(`/api/weather/daily?lat=${lat}&lon=${lon}`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        if (!mounted) return;
        const daily = data.daily || data.list || [];
        const items = (daily.slice(0, 3)).map(d => {
          const temp = d.temp?.day ?? d.main?.temp ?? null;
          const pop = typeof d.pop === 'number' ? Math.round(d.pop * 100) : (d.rain ? Math.round(d.rain * 100) : null);
          return { temp, pop, dt: d.dt };
        });
        setForecast(items);
      } catch (e) {
        // fallback: leave forecast null so UI shows placeholder
        setForecast(null);
      }
    }
    loadWeather();
    return () => { mounted = false; };
  }, [profile]);

  return (
    <div className="dash-layout">
      <Sidebar />
      <section className="dash-container dash-main">
        <header className="dash-header">
          <h1 className="dash-title">Dashboard</h1>
          <button className="dash-signout" onClick={signOut}>Sign Out</button>
        </header>

        <div className="dash-card">
          <div className="dash-hero large-hero">
            <div className="hero-content-left">
              <h2 className="dash-welcome">Welcome back, {profile.name || session.name || 'Yashasvi'}! 🌿</h2>
              <p className="dash-text">Your crops are looking healthy today</p>

              <div className="hero-actions">
                <button className="btn-cta" onClick={() => window.location.hash = '#/detect'}>📸 Scan Leaf</button>
                <button className="btn-cta outline" onClick={() => window.location.hash = '#/chat'}>💬 Ask AI</button>
              </div>
            </div>

          </div>

          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-value">2</div>
              <div className="stat-label">Scans Done</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">☁️</div>
              <div className="stat-value">32°C</div>
              <div className="stat-label">Current Temp</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-value">₹2850</div>
              <div className="stat-label">Rice Price</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-value">1</div>
              <div className="stat-label">Healthy Crops</div>
            </div>
          </div>

          <div className="advisory blue">💧 Light rain expected in evening - good for rice planting</div>

          <div className="dash-grid two-cols">
            <div className="card recent-scans">
              <div className="card-header">
                <strong>Recent Scans</strong>
                <button className="link-arrow">→</button>
              </div>

              <div className="scan-list">
                <div className="scan-entry">
                  <img className="scan-thumb-image" src="https://cdn.builder.io/api/v1/image/assets%2Fc21b63e7074b4525a6e3164505c4a230%2F3ddc0c823b964e55b3d4814b09f7fdf5?format=webp&width=120" alt="rice" />
                  <div className="scan-meta">
                    <div className="scan-title">Rice <span className="warn">⚠ Leaf Blast</span></div>
                    <div className="scan-sub">5/15/2024</div>
                  </div>
                </div>

                <div className="scan-entry">
                  <div className="scan-thumb-placeholder" />
                  <div className="scan-meta">
                    <div className="scan-title">Coconut <span className="ok">✓ Healthy</span></div>
                    <div className="scan-sub">5/18/2024</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card weather-forecast">
              <div className="card-header"><strong>Weather Forecast</strong><button className="link-arrow">→</button></div>
              <div className="weather-cards">
                {forecast && forecast.length ? (
                  forecast.map((f, idx) => (
                    <div className="weather-card" key={String(f.dt || idx)}>
                      <div className="w-temp">{f.temp ? `${Math.round(f.temp)}°C` : '—'}</div>
                      <div className="w-desc">{(f.pop !== null && f.pop !== undefined) ? `Rain ${f.pop}%` : ''}</div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="weather-card"> <div className="w-temp">32°C</div><div className="w-desc">Rain 60%</div></div>
                    <div className="weather-card"> <div className="w-temp">31°C</div><div className="w-desc">Rain 30%</div></div>
                    <div className="weather-card"> <div className="w-temp">33°C</div><div className="w-desc">Rain 10%</div></div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="market-prices card">
            <h3>Market Prices</h3>
            <div className="market-row">
              <div className="price-summary">
                <div className="p-name">Rice</div>
                <div className="p-value">₹2850</div>
                <div className="p-change pos">+5.2%</div>
              </div>

              <div className="price-summary">
                <div className="p-name">Coconut</div>
                <div className="p-value">₹12</div>
                <div className="p-change neg">-2.1%</div>
              </div>

              <div className="price-summary">
                <div className="p-name">Pepper</div>
                <div className="p-value">₹58000</div>
                <div className="p-change pos">+8.7%</div>
              </div>
            </div>

            <div className="market-chart card-chart" ref={chartRef} />
          </div>

        </div>
      </section>
    </div>
  );
}
