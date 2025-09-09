import React, { useState, useEffect } from 'react';
import './weather.css';
import Sidebar from '../components/Sidebar.jsx';

const DISTRICTS = {
  'Thiruvananthapuram': { lat: 8.5241, lon: 76.9366 },
  'Kochi': { lat: 9.9312, lon: 76.2673 },
  'Thrissur': { lat: 10.5276, lon: 76.2144 }
};

export default function Weather(){
  const [district, setDistrict] = useState('Thiruvananthapuram');
  const [current, setCurrent] = useState(null);
  const [daily, setDaily] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { lat, lon } = DISTRICTS[district] || DISTRICTS['Thiruvananthapuram'];
        const [curRes, dailyRes] = await Promise.all([
          fetch(`/api/weather/current?lat=${lat}&lon=${lon}`),
          fetch(`/api/weather/daily?lat=${lat}&lon=${lon}`)
        ]);
        if (!mounted) return;
        if (!curRes.ok || !dailyRes.ok) {
          const msg = `Weather API returned ${curRes.status} / ${dailyRes.status}`;
          console.warn(msg);
          setError(msg);
          setLoading(false);
          return;
        }
        const curJson = await curRes.json();
        const d = await dailyRes.json();
        setCurrent(curJson);
        const days = d.daily || (d.list ? d.list.slice(0,7) : []);
        setDaily(days.slice(0,7));
      } catch (e) {
        console.warn('Weather fetch failed', e);
        setError(e.message || 'Failed to fetch weather');
      } finally { if (mounted) setLoading(false); }
    }
    load();
    return () => { mounted = false; };
  }, [district]);

  const formatTemp = (t) => (t ? `${Math.round(t)}°C` : '—');
  const popPercent = (d) => {
    if (!d) return '';
    if (typeof d.pop === 'number') return `${Math.round(d.pop * 100)}%`;
    if (d.rain) return `${Math.round(d.rain)}%`;
    return '';
  };

  return (
    <div className="weather-layout">
      <Sidebar />
      <main className="weather-main">
        <div className="weather-container">
          <header className="weather-header">
            <h1 className="weather-title">Weather Forecast</h1>
            <p className="weather-sub">7-day weather prediction with farming advisories</p>
          </header>

          <div className="weather-controls">
            <label className="control-label">Select District:</label>
            <select className="control-select" value={district} onChange={(e)=>setDistrict(e.target.value)}>
              {Object.keys(DISTRICTS).map(k => <option key={k}>{k}</option>)}
            </select>
          </div>

          {loading && <div className="weather-loading">Loading weather data…</div>}
          {error && <div className="weather-error">{error}. Ensure backend is running at http://localhost:5000 and OPENWEATHER_API_KEY is set.</div>}

          <div className="weather-top">
            <div className="current-weather card">
              <div className="cw-head">Current Weather - {district}</div>
              <div className="cw-body">
                <div className="cw-left">
                  <div className="cw-temp">{current ? formatTemp(current.main?.temp) : '—'}</div>
                  <div className="cw-cond">{current ? `${current.weather?.[0]?.description || ''}` : '—'}<br/><span className="muted">{current ? `Feels like ${Math.round(current.main?.feels_like || 0)}°C` : ''}</span></div>
                </div>
                <div className="cw-right">
                  <div className="cw-meta"><strong>Humidity</strong><div>{current ? `${current.main?.humidity}%` : '—'}</div></div>
                  <div className="cw-meta"><strong>Wind Speed</strong><div>{current ? `${current.wind?.speed} m/s` : '—'}</div></div>
                  <div className="cw-meta"><strong>Visibility</strong><div>{current ? `${(current.visibility/1000)||0} km` : '—'}</div></div>
                  <div className="cw-meta"><strong>Rain Chance</strong><div>{daily && daily[0] ? popPercent(daily[0]) : '—'}</div></div>
                </div>
              </div>
            </div>

            <aside className="advisories card">
              <h3>Farming Advisories</h3>
              <div className="adv">Watering Advisory - Reduce watering today due to high humidity. Rain expected tomorrow.</div>
              <div className="adv muted">Pest Alert - High humidity may increase fungal diseases. Monitor crops closely.</div>
              <div className="adv muted">Harvesting Window - Good weather conditions for harvesting until Wednesday.</div>
            </aside>
          </div>

          <section className="seven-day">
            <h3>7-Day Forecast</h3>
            <div className="day-row">
              { (daily.length ? daily : Array.from({length:7})).map((d,i)=> (
                <div key={i} className={`day-card ${i===0? 'active':''}`}>
                  <div className="day-name">{i===0? 'Today' : new Date((d.dt||Date.now()/1000) * 1000).toLocaleDateString(undefined,{weekday:'short'})}</div>
                  <div className="day-temp">{ formatTemp(d?.temp?.day ?? d?.main?.temp) }</div>
                  <div className="day-cond muted">{ d?.weather?.[0]?.main || (i===0? 'Partly Cloudy' : 'Rain') }</div>
                  <div className="day-pop muted">{ popPercent(d) }</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
