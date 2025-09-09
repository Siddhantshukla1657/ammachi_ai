import React, { useEffect, useRef, useState } from 'react';
import './dashboard.css';
import Sidebar from '../components/Sidebar.jsx';
import { FaCheckCircle, FaExclamationTriangle, FaLeaf, FaCloud, FaTint, FaWind, FaLightbulb } from 'react-icons/fa';

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
      } catch (e) {}
    }
    initChart();
    const handleResize = () => { if (chart) chart.resize(); }
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); if (chart) chart.dispose && chart.dispose(); };
  }, []);

  // Weather state (mock/fallback)
  const [weather] = useState({
    temp: 28,
    desc: 'Partly Cloudy',
    humidity: 75,
    wind: 12,
    icon: <FaCloud style={{fontSize: 32, color: "#3b7c5a"}} />
  });

  // Recent scans (mock/fallback)
  const recentScans = [
    {
      crop: 'Rice',
      status: 'Leaf Blast',
      statusType: 'warn',
      date: '5/15/2024',
      icon: <FaExclamationTriangle style={{color: '#c44', marginRight: 4}} />
    },
    {
      crop: 'Coconut',
      status: 'Healthy',
      statusType: 'ok',
      date: '5/18/2024',
      icon: <FaCheckCircle style={{color: '#1ea055', marginRight: 4}} />
    }
  ];

  // Tips (mock/fallback)
  const tips = [
    {
      title: 'Morning Care',
      desc: "Check for pest damage during early morning hours when they're most active.",
      color: '#fef9c3',
      border: '#fde68a'
    },
    {
      title: 'Watering Tip',
      desc: 'High humidity today - reduce watering to prevent fungal growth.',
      color: '#e0edff',
      border: '#a5b4fc'
    }
  ];

  return (
    <div className="dash-layout">
      <Sidebar />
      <main className="dashboard-main page-scroll dash-container">
        <div className="dashboard-content-wrapper">
        <div className="dash-card">
          <div className="dash-hero large-hero">
            <div className="hero-content-left">
              <h2 className="dash-welcome">
                Welcome {profile.name || session.name || 'Yashasvi'}!
                <span style={{
                  marginLeft: 8,
                  color: "#166534", // changed to a darker green
                  verticalAlign: "middle"
                }}>
                  <FaLeaf />
                </span>
              </h2>
              <p className="dash-text">Your crops are looking healthy today</p>
              <div className="hero-actions">
                <button className="btn-cta" onClick={() => window.location.hash = '#/detect'}>
                  <FaLeaf style={{marginRight: 6}} /> Scan Leaf
                </button>
                <button className="btn-cta outline" onClick={() => window.location.hash = '#/chat'}>
                  💬 Ask AI
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Three Main Blocks */}
        <div className="dash-grid three-cols" style={{display: 'flex', gap: 24, marginTop: 24}}>
          {/* Block 1: Crop Health */}
          <div className="card crop-health" style={{flex: 1, minWidth: 0}}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: 10}}>
              <FaLeaf style={{marginRight: 8, color: '#059669'}} />
              <strong style={{fontSize: '1.15rem'}}>Crop Health</strong>
            </div>
            {recentScans.map((scan, idx) => (
              <div key={idx} style={{display: 'flex', alignItems: 'center', marginBottom: 12}}>
                <span style={{fontWeight: 700, marginRight: 8}}>{scan.crop}</span>
                <span className={scan.statusType} style={{display: 'flex', alignItems: 'center', fontWeight: 700, color: scan.statusType === 'warn' ? '#c44' : '#1ea055', marginRight: 8}}>
                  {scan.icon} {scan.status}
                </span>
                <span style={{color: '#64748b', fontSize: 14}}>{scan.date}</span>
              </div>
            ))}
          </div>

          {/* Block 2: Today's Tips */}
          <div className="card todays-tips" style={{flex: 1, minWidth: 0}}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: 10}}>
              <FaLightbulb style={{marginRight: 8, color: '#fbbf24'}} />
              <strong style={{fontSize: '1.15rem'}}>Today's Tips</strong>
            </div>
            {tips.map((tip, idx) => (
              <div key={idx} style={{
                background: tip.color,
                border: `1.5px solid ${tip.border}`,
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 10
              }}>
                <div style={{fontWeight: 700, marginBottom: 2}}>{tip.title}</div>
                <div style={{fontSize: 15, color: '#334155'}}>{tip.desc}</div>
              </div>
            ))}
          </div>

          {/* Block 3: Weather */}
          <div className="card todays-weather" style={{flex: 1, minWidth: 0}}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: 10}}>
              <FaCloud style={{marginRight: 8, color: '#3b7c5a'}} />
              <strong style={{fontSize: '1.15rem'}}>Today's Weather</strong>
            </div>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: 4}}>
              <span style={{fontSize: 28, fontWeight: 800, marginRight: 10}}>{weather.temp}°C</span>
              <span style={{fontSize: 16, color: '#64748b'}}>{weather.desc}</span>
              <span style={{marginLeft: 'auto'}}>{weather.icon}</span>
            </div>
            <hr style={{border: 'none', borderTop: '1px solid #e5e7eb', margin: '10px 0'}} />
            <div style={{display: 'flex', gap: 18}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                <FaTint style={{color: '#3b82f6'}} />
                <span style={{fontSize: 14, color: '#64748b'}}>Humidity</span>
                <span style={{fontWeight: 700, marginLeft: 4}}>{weather.humidity}%</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                <FaWind style={{color: '#64748b'}} />
                <span style={{fontSize: 14, color: '#64748b'}}>Wind</span>
                <span style={{fontWeight: 700, marginLeft: 4}}>{weather.wind} km/h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Market Prices Section */}
        <div className="market-prices card" style={{marginTop: 24}}>
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
      </main>
    </div>
    
  );
}
