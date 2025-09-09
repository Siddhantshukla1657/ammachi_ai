import React, { useState } from 'react';
import './weather.css';
import Sidebar from '../components/Sidebar.jsx';

const DAYS = ['Today','Tomorrow','Wed','Thu','Fri','Sat','Sun'];

export default function Weather(){
  const [district, setDistrict] = useState('Thiruvananthapuram');

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
              <option>Thiruvananthapuram</option>
              <option>Kochi</option>
              <option>Thrissur</option>
            </select>
          </div>

          <div className="weather-top">
            <div className="current-weather card">
              <div className="cw-head">Current Weather - {district}</div>
              <div className="cw-body">
                <div className="cw-left">
                  <div className="cw-temp">28°C</div>
                  <div className="cw-cond">Partly Cloudy<br/><span className="muted">Feels like 30°C</span></div>
                </div>
                <div className="cw-right">
                  <div className="cw-meta"><strong>Humidity</strong><div>75%</div></div>
                  <div className="cw-meta"><strong>Wind Speed</strong><div>12 km/h</div></div>
                  <div className="cw-meta"><strong>Visibility</strong><div>8 km</div></div>
                  <div className="cw-meta"><strong>Rain Chance</strong><div>40%</div></div>
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
              {DAYS.map((d,i)=> (
                <div key={i} className={`day-card ${i===0? 'active':''}`}>
                  <div className="day-name">{d}</div>
                  <div className="day-temp">{i===0? '28°C' : `${24+i}°C`}</div>
                  <div className="day-cond muted">{i===0? 'Partly Cloudy' : 'Rain'}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
