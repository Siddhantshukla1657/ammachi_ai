import React, { useState, useEffect } from 'react';
import './weather.css';
import Sidebar from '../components/Sidebar.jsx';
import TranslatedText from '../components/TranslatedText';
import { useLanguage } from '../context/LanguageContext';
import { getBackendUrl } from '../auth'; // Import the backend URL function


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
  const [expandedDay, setExpandedDay] = useState(null);


  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 2;
   
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { lat, lon } = DISTRICTS[district] || DISTRICTS['Thiruvananthapuram'];
       
        // Use proper backend URL for API calls
        const backendUrl = getBackendUrl();
       
        // Create an array of promises for the API calls
        const promises = [
          fetch(`${backendUrl}/api/weather/current?lat=${lat}&lon=${lon}`),
          fetch(`${backendUrl}/api/weather/daily?lat=${lat}&lon=${lon}`),
          fetch(`${backendUrl}/api/weather/hourly?lat=${lat}&lon=${lon}`)
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
        // The API provides 16 items (every 3 hours for 48 hours), not 24
        const hours = hourlyJson.list ? hourlyJson.list.slice(0, 16) : [];
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

  const getFarmingTip = (dayData) => {
    if (!dayData) return '';
    const temp = dayData.temp || dayData.main?.temp;
    const humidity = dayData.humidity || dayData.main?.humidity;
    const pop = dayData.pop || 0;
    const windSpeed = dayData.wind?.speed || 0;

    if (pop > 0.7) return '🌧️ Heavy rain expected - Avoid field work';
    if (pop > 0.4) return '🌦️ Light rain - Good for watering, avoid harvesting';
    if (temp > 35) return '☀️ Hot day - Water early morning or evening';
    if (temp < 15) return '❄️ Cool day - Good for planting and transplanting';
    if (humidity > 80) return '💧 High humidity - Watch for fungal diseases';
    if (windSpeed > 5) return '💨 Windy conditions - Secure crops and equipment';
    return '🌱 Good weather for farming activities';
  };

  const popPercent = (d) => {
    if (!d) return '';
    if (typeof d.pop === 'number') return `${Math.round(d.pop * 100)}%`;
    if (d.rain) return `${Math.round(d.rain)}%`;
    return '';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '—';
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
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

  const toggleDayExpansion = (dayIndex) => {
    setExpandedDay(expandedDay === dayIndex ? null : dayIndex);
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
              <div className="loading-text"><TranslatedText text="Loading weather data for" /> {district}...</div>
            </div>
          )}
         
          {error && (
            <div className="weather-error">
              <div className="error-icon">⚠️</div>
              <div className="error-message">
                <strong><TranslatedText text="Error" />:</strong> {error}
                <div className="error-help">
                  <TranslatedText text="Please ensure" />:
                  <ul>
                    <li><TranslatedText text="Backend server is running at" /> {import.meta.env.VITE_BACKEND_URL}</li>
                    <li>OPENWEATHER_API_KEY <TranslatedText text="is properly set in the backend .env file" /></li>
                    <li><TranslatedText text="Your internet connection is working" /></li>
                  </ul>
                  <button className="retry-button" onClick={() => window.location.reload()}><TranslatedText text="Retry" /></button>
                </div>
              </div>
            </div>
          )}


          <div className="weather-top">
            <div className="current-weather card">
              <div className="cw-head"><TranslatedText text="Current Weather" /> - {district}</div>
              <div className="cw-body">
                <div className="cw-left">
                  <div className="cw-icon">{current ? getWeatherIcon(current.weather?.[0]?.main) : '☁️'}</div>
                  <div className="cw-temp">{current ? formatTemp(current.main?.temp) : '—'}</div>
                  <div className="cw-cond">{current ? `${current.weather?.[0]?.description || ''}` : '—'}<br/>
                    <span className="muted">{current ? <><TranslatedText text="Feels like" /> {Math.round(current.main?.feels_like || 0)}°C</> : ''}</span>
                  </div>
                </div>
                <div className="cw-right">
                  <div className="cw-meta"><strong><TranslatedText text="Humidity" /></strong><div>{current ? `${current.main?.humidity}%` : '—'}</div></div>
                  <div className="cw-meta"><strong><TranslatedText text="Wind Speed" /></strong><div>{current ? `${current.wind?.speed} m/s` : '—'}</div></div>
                  <div className="cw-meta"><strong><TranslatedText text="Pressure" /></strong><div>{current ? `${current.main?.pressure} hPa` : '—'}</div></div>
                  <div className="cw-meta"><strong><TranslatedText text="Visibility" /></strong><div>{current ? `${(current.visibility/1000)||0} km` : '—'}</div></div>
                  <div className="cw-meta"><strong><TranslatedText text="Rain Chance" /></strong><div>{daily && daily[0] ? popPercent(daily[0]) : '—'}</div></div>
                  <div className="cw-meta"><strong><TranslatedText text="Updated" /></strong><div>{current ? new Date(current.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '—'}</div></div>
                </div>
              </div>
            </div>


            <aside className="advisories card">
              <h3><TranslatedText text="Farming Advisories" /></h3>
              {current && current.main?.humidity > 70 ? (
                <div className="adv"><TranslatedText text="Watering Advisory" /> - <TranslatedText text="Reduce watering today due to high humidity" /> ({current.main?.humidity}%). {daily && daily[0]?.pop > 0.3 ? <TranslatedText text="Rain expected tomorrow" /> : ''}</div>
              ) : (
                <div className="adv"><TranslatedText text="Watering Advisory" /> - {current ? <><TranslatedText text="Current humidity is" /> {current.main?.humidity}%. </> : ''}<TranslatedText text="Regular watering recommended" />.</div>
              )}
              {current && current.main?.humidity > 75 ? (
                <div className="adv muted"><TranslatedText text="Pest Alert" /> - <TranslatedText text="High humidity may increase fungal diseases. Monitor crops closely" />.</div>
              ) : null}
              {daily && daily.slice(0, 3).every(d => !d.pop || d.pop < 0.4) ? (
                <div className="adv muted"><TranslatedText text="Harvesting Window" /> - <TranslatedText text="Good weather conditions for harvesting in the next few days" />.</div>
              ) : null}
            </aside>
          </div>


          <div className="forecast-tabs">
            <button
              className={`tab-button ${activeTab === 'daily' ? 'active' : ''}`}
              onClick={() => setActiveTab('daily')}
            >
              <TranslatedText text="7-Day Forecast" />
            </button>
            <button
              className={`tab-button ${activeTab === 'hourly' ? 'active' : ''}`}
              onClick={() => setActiveTab('hourly')}
            >
              <TranslatedText text="Hourly Forecast" />
            </button>
          </div>


          {activeTab === 'daily' && (
            <section className="seven-day">
              <h3><TranslatedText text="7-Day Forecast" /></h3>
              <div className="day-row">
                {(daily.length ? daily : Array.from({length:7})).map((d,i)=> {
                  const timestamp = d?.dt || Math.floor(Date.now()/1000);
                  const isExpanded = expandedDay === i;
                  const temp = d?.temp || d?.main?.temp;
                  const tempMax = d?.temp_max || d?.main?.temp_max;
                  const tempMin = d?.temp_min || d?.main?.temp_min;
                  const humidity = d?.humidity || d?.main?.humidity;
                  const windSpeed = d?.wind?.speed || 0;
                  const pressure = d?.main?.pressure || 0;
                  
                  return (
                    <div 
                      key={i} 
                      className={`day-card ${i===0? 'active':''} ${isExpanded ? 'expanded' : ''}`}
                      onClick={() => toggleDayExpansion(i)}
                    >
                      <div className="day-expand-icon">▼</div>
                      <div className="day-card-header">
                        <div>
                          <div className="day-name">{i===0? 'Today' : new Date(timestamp * 1000).toLocaleDateString(undefined,{weekday:'short'})}</div>
                          <div className="day-icon">{getWeatherIcon(d?.weather?.[0]?.main)}</div>
                        </div>
                        <div className="day-temp">{temp ? `${Math.round(temp)}°C` : '—'}</div>
                      </div>
                      
                      <div className="day-cond muted">{ d?.weather?.[0]?.main || (i===0? 'Partly Cloudy' : 'Rain') }</div>
                      <div className="day-pop muted">{ popPercent(d) }</div>
                      
                      
                      {/* Temperature progress bar */}
                      {(tempMax || tempMin) && (
                        <div className="temp-progress">
                          <div 
                            className="temp-progress-fill" 
                            style={{ 
                              width: tempMax && tempMin ? 
                                `${Math.min(100, Math.max(0, ((temp - tempMin) / (tempMax - tempMin)) * 100))}%` : 
                                '50%' 
                            }}
                          ></div>
                        </div>
                      )}
                      
                      
                      {/* UV Index simulation */}
                      <div className={`uv-index ${temp > 30 ? 'uv-high' : temp > 25 ? 'uv-moderate' : 'uv-low'}`}>
                        ☀️ UV {temp > 30 ? 'High' : temp > 25 ? 'Moderate' : 'Low'}
                      </div>
                      
                      {isExpanded && (
                        <div className="day-details">
                          {/* Weather status badge */}
                          <div className={`weather-status ${
                            d?.weather?.[0]?.main?.toLowerCase().includes('clear') ? 'status-sunny' :
                            d?.weather?.[0]?.main?.toLowerCase().includes('cloud') ? 'status-cloudy' :
                            d?.weather?.[0]?.main?.toLowerCase().includes('rain') ? 'status-rainy' :
                            d?.weather?.[0]?.main?.toLowerCase().includes('storm') ? 'status-stormy' : 'status-cloudy'
                          }`}>
                            {d?.weather?.[0]?.main || 'Partly Cloudy'}
                          </div>
                          
                          <div className="day-weather-desc">{d?.weather?.[0]?.description || 'Partly cloudy'}</div>
                          
                          {(tempMax || tempMin) && (
                            <div className="day-temp-range">
                              <span className="day-temp-high">↑ {tempMax ? `${Math.round(tempMax)}°C` : '—'}</span>
                              <span className="day-temp-low">↓ {tempMin ? `${Math.round(tempMin)}°C` : '—'}</span>
                            </div>
                          )}
                          
                          
                          <div className="day-detail-row">
                            <span className="day-detail-label">Rain Chance</span>
                            <span className="day-detail-value">{popPercent(d)}</span>
                          </div>
                          
                          <div className="day-farming-tip">
                            {getFarmingTip(d)}
                          </div>
                        </div>
                      )}
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
                {(hourly && hourly.length > 0 ? hourly : Array.from({length: 16})).map((hourlyData, i) => {
                  // For actual data, use the timestamp from the API
                  // For placeholder data, calculate timestamps at 3-hour intervals starting from now
                  const baseTime = Math.floor(Date.now() / 1000);
                  const timestamp = hourlyData?.dt || (baseTime + (i * 3 * 3600));
                  
                  return (
                    <div key={i} className="hour-card">
                      <div className="hour-time">{formatTime(timestamp)}</div>
                      <div className="hour-icon">{getWeatherIcon(hourlyData?.weather?.[0]?.main)}</div>
                      <div className="hour-temp">{hourlyData?.main?.temp ? `${Math.round(hourlyData.main.temp)}°C` : '—'}</div>
                      <div className="hour-cond muted">{ hourlyData?.weather?.[0]?.description || hourlyData?.weather?.[0]?.main || 'Cloudy' }</div>
                      <div className="hour-pop muted">{ popPercent(hourlyData) }</div>
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