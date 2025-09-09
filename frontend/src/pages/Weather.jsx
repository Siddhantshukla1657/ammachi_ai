import React, { useState, useEffect } from 'react';
import './weather.css';
import Sidebar from '../components/Sidebar.jsx';


const DISTRICTS = {
  'Thiruvananthapuram': { lat: 8.5241, lon: 76.9366 },
  'Kochi': { lat: 9.9312, lon: 76.2673 },
  'Thrissur': { lat: 10.5276, lon: 76.2144 },
  'Kozhikode': { lat: 11.2588, lon: 75.7804 },
  'Kollam': { lat: 8.8932, lon: 76.6141 }
};


export default function Weather(){
  const [district, setDistrict] = useState('Thiruvananthapuram');
  const [current, setCurrent] = useState(null);
  const [daily, setDaily] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('daily');


  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 2;
   
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { lat, lon } = DISTRICTS[district] || DISTRICTS['Thiruvananthapuram'];
       
        // Create an array of promises for the API calls
        const promises = [
          fetch(`/api/weather/current?lat=${lat}&lon=${lon}`),
          fetch(`/api/weather/daily?lat=${lat}&lon=${lon}`),
          fetch(`/api/weather/hourly?lat=${lat}&lon=${lon}`)
        ];
       
        // Use Promise.allSettled to handle partial failures
        const results = await Promise.allSettled(promises);
        if (!mounted) return;
       
        // Check for any rejected promises
        const failedRequests = results.filter(r => r.status === 'rejected');
        if (failedRequests.length > 0) {
          console.warn(`${failedRequests.length} API requests failed:`, failedRequests);
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying... Attempt ${retryCount} of ${maxRetries}`);
            setTimeout(load, 1000); // Retry after 1 second
            return;
          } else {
            throw new Error(`Failed to fetch weather data after ${maxRetries} attempts`);
          }
        }
       
        // Check if any of the API calls returned non-OK status
        const responses = results.map(r => r.value);
        const failedResponses = responses.filter(res => !res.ok);
       
        if (failedResponses.length > 0) {
          const statusCodes = responses.map(res => res.status).join('/');
          const msg = `Weather API returned status codes: ${statusCodes}`;
          console.warn(msg);
         
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying... Attempt ${retryCount} of ${maxRetries}`);
            setTimeout(load, 1000); // Retry after 1 second
            return;
          } else {
            throw new Error(`API returned error status codes: ${statusCodes}`);
          }
        }
       
        // All responses are OK, parse the JSON
        const [curRes, dailyRes, hourlyRes] = responses;
       
        // Parse the JSON responses with error handling
        const parseJsonSafely = async (response, fallbackValue = {}) => {
          try {
            return await response.json();
          } catch (e) {
            console.error('Failed to parse JSON response', e);
            return fallbackValue;
          }
        };
       
        const [curJson, dailyJson, hourlyJson] = await Promise.all([
          parseJsonSafely(curRes),
          parseJsonSafely(dailyRes),
          parseJsonSafely(hourlyRes)
        ]);
       
        // Update state with the fetched data
        setCurrent(curJson);
       
        // Process daily forecast data
        const days = dailyJson.list ? dailyJson.list.slice(0, 7) : [];
        setDaily(days);
       
        // Process hourly forecast data
        const hours = hourlyJson.list ? hourlyJson.list.slice(0, 24) : [];
        setHourly(hours);
       
        // Reset retry count on success
        retryCount = 0;
      } catch (e) {
        console.error('Weather fetch failed', e);
        setError(e.message || 'Failed to fetch weather data. Please try again later.');
      } finally {
        if (mounted) setLoading(false);
      }
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
 
  const formatTime = (timestamp) => {
    if (!timestamp) return '—';
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
 
  const formatDate = (timestamp) => {
    if (!timestamp) return '—';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };
 
  const getWeatherIcon = (weatherCode) => {
    if (!weatherCode) return '☁️';
    const code = weatherCode.toLowerCase();
    if (code.includes('clear')) return '☀️';
    if (code.includes('cloud')) return '☁️';
    if (code.includes('rain')) return '🌧️';
    if (code.includes('snow')) return '❄️';
    if (code.includes('thunder')) return '⚡';
    if (code.includes('mist') || code.includes('fog')) return '🌫️';
    return '☁️';
  };


  return (
    <div className="weather-layout">
      <Sidebar />
      <main className="weather-main page-scroll">
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


          {loading && (
            <div className="weather-loading">
              <div className="loading-spinner"></div>
              <div className="loading-text">Loading weather data for {district}...</div>
            </div>
          )}
         
          {error && (
            <div className="weather-error">
              <div className="error-icon">⚠️</div>
              <div className="error-message">
                <strong>Error:</strong> {error}
                <div className="error-help">
                  Please ensure:
                  <ul>
                    <li>Backend server is running at http://localhost:5000</li>
                    <li>OPENWEATHER_API_KEY is properly set in the backend .env file</li>
                    <li>Your internet connection is working</li>
                  </ul>
                  <button className="retry-button" onClick={() => window.location.reload()}>Retry</button>
                </div>
              </div>
            </div>
          )}


          <div className="weather-top">
            <div className="current-weather card">
              <div className="cw-head">Current Weather - {district}</div>
              <div className="cw-body">
                <div className="cw-left">
                  <div className="cw-icon">{current ? getWeatherIcon(current.weather?.[0]?.main) : '☁️'}</div>
                  <div className="cw-temp">{current ? formatTemp(current.main?.temp) : '—'}</div>
                  <div className="cw-cond">{current ? `${current.weather?.[0]?.description || ''}` : '—'}<br/>
                    <span className="muted">{current ? `Feels like ${Math.round(current.main?.feels_like || 0)}°C` : ''}</span>
                  </div>
                </div>
                <div className="cw-right">
                  <div className="cw-meta"><strong>Humidity</strong><div>{current ? `${current.main?.humidity}%` : '—'}</div></div>
                  <div className="cw-meta"><strong>Wind Speed</strong><div>{current ? `${current.wind?.speed} m/s` : '—'}</div></div>
                  <div className="cw-meta"><strong>Pressure</strong><div>{current ? `${current.main?.pressure} hPa` : '—'}</div></div>
                  <div className="cw-meta"><strong>Visibility</strong><div>{current ? `${(current.visibility/1000)||0} km` : '—'}</div></div>
                  <div className="cw-meta"><strong>Rain Chance</strong><div>{daily && daily[0] ? popPercent(daily[0]) : '—'}</div></div>
                  <div className="cw-meta"><strong>Updated</strong><div>{current ? new Date(current.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '—'}</div></div>
                </div>
              </div>
            </div>


            <aside className="advisories card">
              <h3>Farming Advisories</h3>
              {current && current.main?.humidity > 70 ? (
                <div className="adv">Watering Advisory - Reduce watering today due to high humidity ({current.main?.humidity}%). {daily && daily[0]?.pop > 0.3 ? 'Rain expected tomorrow.' : ''}</div>
              ) : (
                <div className="adv">Watering Advisory - {current ? `Current humidity is ${current.main?.humidity}%. ` : ''}Regular watering recommended.</div>
              )}
              {current && current.main?.humidity > 75 ? (
                <div className="adv muted">Pest Alert - High humidity may increase fungal diseases. Monitor crops closely.</div>
              ) : null}
              {daily && daily.slice(0, 3).every(d => !d.pop || d.pop < 0.4) ? (
                <div className="adv muted">Harvesting Window - Good weather conditions for harvesting in the next few days.</div>
              ) : null}
            </aside>
          </div>


          <div className="forecast-tabs">
            <button
              className={`tab-button ${activeTab === 'daily' ? 'active' : ''}`}
              onClick={() => setActiveTab('daily')}
            >
              7-Day Forecast
            </button>
            <button
              className={`tab-button ${activeTab === 'hourly' ? 'active' : ''}`}
              onClick={() => setActiveTab('hourly')}
            >
              Hourly Forecast
            </button>
          </div>


          {activeTab === 'daily' && (
            <section className="seven-day">
              <h3>7-Day Forecast</h3>
              <div className="day-row">
                {(daily.length ? daily : Array.from({length:7})).map((d,i)=> {
                  const timestamp = d?.dt || Math.floor(Date.now()/1000);
                  console.log('Day data:', d); // Debug log to see what data is available
                  return (
                    <div key={i} className={`day-card ${i===0? 'active':''}`}>
                      <div className="day-name">{i===0? 'Today' : new Date(timestamp * 1000).toLocaleDateString(undefined,{weekday:'short'})}</div>
                      <div className="day-icon">{getWeatherIcon(d?.weather?.[0]?.main)}</div>
                      <div className="day-temp">{d?.temp ? `${Math.round(d.temp)}°C` : d?.main?.temp ? `${Math.round(d.main.temp)}°C` : '—'}</div>
                      <div className="day-cond muted">{ d?.weather?.[0]?.main || (i===0? 'Partly Cloudy' : 'Rain') }</div>
                      <div className="day-pop muted">{ popPercent(d) }</div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}


          {activeTab === 'hourly' && (
            <section className="hourly-forecast">
              <h3>Hourly Forecast</h3>
              <div className="hour-row">
                {(hourly.length ? hourly : Array.from({length:24})).map((h,i)=> {
                  const timestamp = h?.dt || Math.floor(Date.now()/1000) + i*3600;
                  console.log('Hour data:', h); // Debug log to see what data is available
                  return (
                    <div key={i} className="hour-card">
                      <div className="hour-time">{formatTime(timestamp)}</div>
                      <div className="hour-icon">{getWeatherIcon(h?.weather?.[0]?.main)}</div>
                      <div className="hour-temp">{h?.main?.temp ? `${Math.round(h.main.temp)}°C` : '—'}</div>
                      <div className="hour-cond muted">{ h?.weather?.[0]?.main || 'Cloudy' }</div>
                      <div className="hour-pop muted">{ popPercent(h) }</div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}