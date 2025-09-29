import React, { useEffect, useRef, useState } from 'react';
import './dashboard.css';
import Sidebar from '../components/Sidebar.jsx';
import { FaCheckCircle, FaExclamationTriangle, FaLeaf, FaCloud, FaTint, FaWind, FaLightbulb, FaSync, FaInfoCircle } from 'react-icons/fa';
import TranslatedText from '../components/TranslatedText';
import { useLanguage } from '../context/LanguageContext';
import { getBackendUrl } from '../auth'; // Import the getBackendUrl function

export default function Dashboard() {
  const { language } = useLanguage();
  const profile = (() => {
    try { return JSON.parse(localStorage.getItem('ammachi_profile') || '{}'); } catch { return {}; }
  })();
  const session = (() => {
    try { return JSON.parse(localStorage.getItem('ammachi_session') || '{}'); } catch { return {}; }
  })();

  // Get user ID from session or profile
  const userId = session.userId || profile._id || profile.id;

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [marketData, setMarketData] = useState([]);
  const [cropHealthData, setCropHealthData] = useState([]);
  const [realTimeMarketData, setRealTimeMarketData] = useState([]); // New state for real-time market data

  function signOut() {
    localStorage.removeItem('ammachi_session');
    window.location.hash = '#/login';
  }

  const chartRef = useRef(null);

  // Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    if (!userId) {
      console.warn('No user ID available for dashboard data fetch');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Use the getBackendUrl function to construct the proper URL
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/farmers/dashboard/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
        setMarketData(data.data.marketPrices || []);
        setCropHealthData(data.data.cropHealth || []);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch dashboard data:', response.status);
        // Set fallback data
        setDashboardData(getFallbackDashboardData());
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      // Set fallback data
      setDashboardData(getFallbackDashboardData());
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch real-time market data separately
  const fetchRealTimeMarketData = async () => {
    try {
      const backendUrl = getBackendUrl();
      // Get farmer's district from profile or use default
      const district = profile.district || 'Ernakulam';
      const state = profile.state || 'Kerala';
      
      // Get markets for the district
      const marketsResponse = await fetch(`${backendUrl}/api/market/markets?state=${state}&district=${district}`);
      if (!marketsResponse.ok) {
        throw new Error('Failed to fetch markets');
      }
      
      const marketsData = await marketsResponse.json();
      const market = marketsData.data && marketsData.data.length > 0 ? marketsData.data[0] : 'Ernakulam';
      
      // Get farmer's crops or use defaults
      const crops = profile.crops && profile.crops.length > 0 ? profile.crops : ['Rice', 'Coconut', 'Pepper'];
      
      // Fetch market prices for each crop
      const marketPrices = await Promise.all(
        crops.slice(0, 3).map(async (crop) => {
          try {
            const response = await fetch(
              `${backendUrl}/api/market/prices?state=${state}&market=${market}&commodity=${crop}`
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data && data.data.length > 0) {
                const priceData = data.data[0];
                return {
                  crop: crop,
                  price: priceData.modal_price || priceData.max_price || 0,
                  change: calculatePriceChange(data.data),
                  market: priceData.market,
                  updated: new Date().toISOString()
                };
              }
            }
            // Return mock data if API fails
            return {
              crop: crop,
              price: getMockPrice(crop),
              change: { percentage: Math.random() > 0.5 ? 2.5 : -1.3, direction: Math.random() > 0.5 ? 'up' : 'down' },
              market: market,
              updated: new Date().toISOString()
            };
          } catch (error) {
            console.error(`Error fetching market data for ${crop}:`, error);
            // Return mock data if API fails
            return {
              crop: crop,
              price: getMockPrice(crop),
              change: { percentage: Math.random() > 0.5 ? 2.5 : -1.3, direction: Math.random() > 0.5 ? 'up' : 'down' },
              market: market,
              updated: new Date().toISOString()
            };
          }
        })
      );
      
      // Filter out null results and update state
      const validMarketData = marketPrices.filter(data => data !== null);
      setRealTimeMarketData(validMarketData);
    } catch (error) {
      console.error('Error fetching real-time market data:', error);
      // Set fallback data
      const fallbackData = [
        { crop: 'Rice', price: 2850, change: { percentage: 5.2, direction: 'up' }, market: 'Ernakulam' },
        { crop: 'Coconut', price: 12, change: { percentage: -2.1, direction: 'down' }, market: 'Ernakulam' },
        { crop: 'Pepper', price: 58000, change: { percentage: 8.7, direction: 'up' }, market: 'Ernakulam' }
      ];
      setRealTimeMarketData(fallbackData);
    }
  };

  // Helper function to get mock prices
  const getMockPrice = (crop) => {
    const mockPrices = {
      'Rice': 2850,
      'Coconut': 12,
      'Pepper': 58000,
      'Cardamom': 1200,
      'Rubber': 160
    };
    return mockPrices[crop] || Math.floor(Math.random() * 10000) + 1000;
  };

  // Calculate price change based on historical data
  const calculatePriceChange = (priceData) => {
    if (priceData.length < 2) {
      return { percentage: 0, direction: 'up' };
    }
    
    const currentPrice = priceData[0].modal_price || priceData[0].max_price || 0;
    const previousPrice = priceData[1].modal_price || priceData[1].max_price || 0;
    
    if (previousPrice === 0) {
      return { percentage: 0, direction: 'up' };
    }
    
    const changePercent = ((currentPrice - previousPrice) / previousPrice) * 100;
    return {
      percentage: parseFloat(changePercent.toFixed(1)),
      direction: changePercent >= 0 ? 'up' : 'down'
    };
  };

  // Fallback data for when API fails
  const getFallbackDashboardData = () => {
    return {
      farmer: {
        name: profile.name || session.name || 'Farmer',
        crops: profile.crops || ['Rice', 'Coconut', 'Pepper'],
        district: profile.district || 'Ernakulam'
      },
      cropHealth: [
        { crop: 'Rice', status: 'Leaf Blast', severity: 'moderate', date: new Date().toISOString() },
        { crop: 'Coconut', status: 'Healthy', severity: 'none', date: new Date().toISOString() }
      ],
      marketPrices: [
        { crop: 'Rice', price: 2850, change: { percentage: 5.2, direction: 'up' }, market: 'Ernakulam' },
        { crop: 'Coconut', price: 12, change: { percentage: -2.1, direction: 'down' }, market: 'Ernakulam' },
        { crop: 'Pepper', price: 58000, change: { percentage: 8.7, direction: 'up' }, market: 'Ernakulam' }
      ],
      weather: {
        temp: 28,
        desc: 'Partly Cloudy',
        humidity: 75,
        wind: 12
      }
    };
  };

  // Fallback market data when API fails
  const getFallbackMarketData = (profile) => {
    return [
      { crop: 'Rice', price: 2850, change: { percentage: 5.2, direction: 'up' }, market: 'Ernakulam' },
      { crop: 'Coconut', price: 12, change: { percentage: -2.1, direction: 'down' }, market: 'Ernakulam' },
      { crop: 'Pepper', price: 58000, change: { percentage: 8.7, direction: 'up' }, market: 'Ernakulam' }
    ];
  };

  // Auto-refresh dashboard data every 5 minutes
  useEffect(() => {
    fetchDashboardData();
    fetchRealTimeMarketData(); // Fetch real-time market data
    
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchRealTimeMarketData(); // Refresh real-time market data
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [userId]);

  // Manual refresh function
  const handleRefresh = () => {
    fetchDashboardData();
    fetchRealTimeMarketData(); // Refresh real-time market data
  };

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
        
        // Use real market data if available, otherwise fallback to dashboard data
        const chartData = realTimeMarketData.length > 0 ? 
          generateChartData(realTimeMarketData) : 
          (marketData.length > 0 ? generateChartData(marketData) : getDefaultChartData());
        
        const option = {
          color: ['#1ea055', '#89d7a0', '#66c184'],
          tooltip: { trigger: 'axis', backgroundColor: 'rgba(4,36,22,0.95)', textStyle: { color: '#fff' } },
          legend: { show: true, data: chartData.legend, top: 8, left: 'center', itemGap: 24, textStyle: { color: '#066241' } },
          grid: { left: 40, right: 20, bottom: 30, top: 70 },
          xAxis: { type: 'category', data: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], boundaryGap: false, axisLine: { lineStyle: { color: '#cfeee0' } }, axisLabel: { color: '#2b6b4a' } },
          yAxis: { type: 'value', axisLine: { lineStyle: { color: '#cfeee0' } }, axisLabel: { color: '#2b6b4a' }, splitLine: { lineStyle: { color: 'rgba(47,180,106,0.06)' } } },
          toolbox: { feature: { saveAsImage: {} } },
          series: chartData.series
        };
        chart.setOption(option);
      } catch (e) {}
    }
    initChart();
    const handleResize = () => { if (chart) chart.resize(); }
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); if (chart) chart.dispose && chart.dispose(); };
  }, [marketData, realTimeMarketData]);

  // Generate chart data from real market prices
  const generateChartData = (marketPrices) => {
    const legend = marketPrices.map(item => item.crop);
    const series = marketPrices.map((item, index) => {
      // Generate trend data based on current price
      const basePrice = item.price;
      const trendData = Array.from({ length: 7 }, (_, i) => {
        const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
        return Math.round(basePrice * (1 + variation));
      });
      
      const colors = ['#1ea055', '#89d7a0', '#66c184', '#2fb46a', '#4ade80'];
      
      return {
        name: item.crop,
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: trendData,
        areaStyle: { color: `rgba(47,180,106,${0.14 - index * 0.02})` },
        lineStyle: { color: colors[index] || '#1ea055', width: 3 - index * 0.5 }
      };
    });
    
    return { legend, series };
  };

  // Default chart data for fallback
  const getDefaultChartData = () => {
    return {
      legend: ['Rice', 'Coconut', 'Pepper'],
      series: [
        { name: 'Rice', type: 'line', smooth: true, showSymbol: false, data: [2850,2860,2840,2850,2870,2880,2890], areaStyle: { color: 'rgba(47,180,106,0.14)' }, lineStyle: { color: '#1ea055', width: 3 } },
        { name: 'Coconut', type: 'line', smooth: true, showSymbol: false, data: [11,11.5,11.8,12,11.9,12.1,12], areaStyle: { color: 'rgba(137,215,160,0.12)' }, lineStyle: { color: '#89d7a0', width: 2 } },
        { name: 'Pepper', type: 'line', smooth: true, showSymbol: false, data: [56000,56500,56300,57000,57200,58000,57800], areaStyle: { color: 'rgba(102,193,132,0.10)' }, lineStyle: { color: '#66c184', width: 2 } }
      ]
    };
  };

  // Weather state with API integration
  const [weather, setWeather] = useState({
    temp: 28,
    desc: 'Partly Cloudy',
    humidity: 75,
    wind: 12,
    icon: <FaCloud style={{fontSize: 32, color: "#3b7c5a"}} />
  });
  
  // Update weather from dashboard data
  useEffect(() => {
    if (dashboardData?.weather) {
      setWeather({
        temp: dashboardData.weather.temp,
        desc: dashboardData.weather.desc,
        humidity: dashboardData.weather.humidity,
        wind: dashboardData.weather.wind,
        icon: getWeatherIcon(dashboardData.weather.desc)
      });
    }
  }, [dashboardData]);
  
  // Fetch weather data from API (kept as fallback if dashboard doesn't provide weather)
  useEffect(() => {
    if (!dashboardData?.weather) {
      const fetchWeatherData = async () => {
        try {
          const backendUrl = getBackendUrl();
          // Using Thiruvananthapuram as default location
          const { lat, lon } = { lat: 8.5241, lon: 76.9366 };
          
          // Fetch current weather data
          const response = await fetch(`${backendUrl}/api/weather/current?lat=${lat}&lon=${lon}`);
          
          if (!response.ok) {
            throw new Error(`Weather API returned status: ${response.status}`);
          }
          
          const data = await response.json();
          
          // Update weather state with real data
          setWeather({
            temp: Math.round(data.main?.temp || 28),
            desc: data.weather?.[0]?.description || 'Partly Cloudy',
            humidity: data.main?.humidity || 75,
            wind: Math.round(data.wind?.speed || 12),
            icon: getWeatherIcon(data.weather?.[0]?.main)
          });
        } catch (error) {
          console.error('Failed to fetch weather data:', error);
          // Keep the default weather data on error
        }
      };
      
      fetchWeatherData();
    }
  }, [dashboardData]);
  
  // Helper function to get weather icon based on condition
  const getWeatherIcon = (weatherCode) => {
    if (!weatherCode) return <FaCloud style={{fontSize: 32, color: "#3b7c5a"}} />;
    const code = weatherCode.toLowerCase();
    if (code.includes('clear')) return <FaCloud style={{fontSize: 32, color: "#f59e0b"}} />;
    if (code.includes('cloud')) return <FaCloud style={{fontSize: 32, color: "#3b7c5a"}} />;
    if (code.includes('rain')) return <FaTint style={{fontSize: 32, color: "#3b82f6"}} />;
    if (code.includes('snow')) return <FaCloud style={{fontSize: 32, color: "#e5e7eb"}} />;
    if (code.includes('thunder')) return <FaExclamationTriangle style={{fontSize: 32, color: "#f59e0b"}} />;
    if (code.includes('mist') || code.includes('fog')) return <FaCloud style={{fontSize: 32, color: "#9ca3af"}} />;
    return <FaCloud style={{fontSize: 32, color: "#3b7c5a"}} />;
  };

  // Recent scans from API data or fallback
  const recentScans = cropHealthData.length > 0 ? cropHealthData.map(scan => ({
    crop: scan.crop,
    status: scan.status === 'Healthy' ? 'Healthy' : scan.status,
    statusType: scan.status === 'Healthy' || !scan.status ? 'ok' : 'warn',
    date: new Date(scan.date).toLocaleDateString(),
    // Include more detailed information
    scientificName: scan.scientificName || '',
    identificationProbability: scan.plantIdentificationProbability || 0,
    severity: scan.severity || 'none',
    healthAssessment: scan.healthAssessment || 'Not assessed',
    icon: scan.status === 'Healthy' || !scan.status ? 
      <FaCheckCircle style={{color: '#1ea055', marginRight: 4}} /> : 
      <FaExclamationTriangle style={{color: '#c44', marginRight: 4}} />
  })) : [];

  // Crop-specific farming tips based on user's registered crops
  const [tips, setTips] = useState([]);

  // Generate crop-specific tips based on user's crops
  useEffect(() => {
    const userCrops = profile.crops || [];
    const cropTips = [];
    
    // Add general tips that apply to all crops
    cropTips.push({
      title: 'General Farming Tip',
      desc: 'Regular monitoring of your crops can help detect issues early and improve yields.',
      color: '#fef9c3',
      border: '#fde68a'
    });
    
    // Add crop-specific tips only for crops the user actually has
    if (userCrops.includes('Rice')) {
      cropTips.push({
        title: 'Rice Care',
        desc: 'Maintain proper water levels in your paddy fields. Too much or too little water can affect yield.',
        color: '#dbeafe',
        border: '#93c5fd'
      });
    }
    
    if (userCrops.includes('Coconut')) {
      cropTips.push({
        title: 'Coconut Care',
        desc: 'Regularly check for signs of coconut mite infestation. Early detection is key to preventing damage.',
        color: '#fee2e2',
        border: '#fca5a5'
      });
    }
    
    if (userCrops.includes('Pepper')) {
      cropTips.push({
        title: 'Pepper Care',
        desc: 'Ensure good drainage to prevent root rot. Support vines with proper trellising for better growth.',
        color: '#dcfce7',
        border: '#86efac'
      });
    }
    
    if (userCrops.includes('Cardamom')) {
      cropTips.push({
        title: 'Cardamom Care',
        desc: 'Cardamom thrives in shaded, humid conditions. Maintain mulch to retain soil moisture.',
        color: '#f0fdfa',
        border: '#5eead4'
      });
    }
    
    if (userCrops.includes('Rubber')) {
      cropTips.push({
        title: 'Rubber Care',
        desc: 'Regular tapping should be done in the morning. Avoid tapping during dry seasons to prevent tree stress.',
        color: '#f0f9ff',
        border: '#bae6fd'
      });
    }
    
    // Add weather-based tips
    if (weather.desc) {
      if (weather.desc.toLowerCase().includes('rain')) {
        cropTips.push({
          title: 'Rain Alert',
          desc: 'Rainy conditions detected. Ensure proper drainage to prevent waterlogging in your fields.',
          color: '#dbeafe',
          border: '#93c5fd'
        });
      } else if (weather.desc.toLowerCase().includes('clear') || weather.desc.toLowerCase().includes('sun')) {
        cropTips.push({
          title: 'Sunny Day',
          desc: 'Good conditions for field work. Consider irrigation if soil moisture is low.',
          color: '#fef3c7',
          border: '#fcd34d'
        });
      }
      
      if (weather.humidity > 70) {
        cropTips.push({
          title: 'High Humidity',
          desc: `High humidity (${weather.humidity}%) - Monitor for fungal diseases and ensure proper air circulation.`,
          color: '#e0edff',
          border: '#a5b4fc'
        });
      } else if (weather.humidity < 40) {
        cropTips.push({
          title: 'Low Humidity',
          desc: `Low humidity (${weather.humidity}%) - Increase irrigation frequency to maintain soil moisture.`,
          color: '#fee2e2',
          border: '#fca5a5'
        });
      }
    }
    
    setTips(cropTips);
  }, [profile.crops, weather]);

  return (
    <div className="dash-layout">
      <Sidebar />
      <main className="dashboard-main page-scroll dash-container">
        <div className="dashboard-content-wrapper">
        <div className="dash-card">
          <div className="dash-hero large-hero">
            <div className="hero-content-left">
              <h2 className="dash-welcome">
                Welcome {dashboardData?.farmer?.name || profile.name || session.name || 'Yashasvi'}!
                <span style={{
                  marginLeft: 8,
                  color: "#166534", // changed to a darker green
                  verticalAlign: "middle"
                }}>
                  <FaLeaf />
                </span>
                {isLoading && (
                  <span style={{ marginLeft: 8, fontSize: '0.8rem', color: '#666' }}>
                    <FaSync className="fa-spin" /> Loading...
                  </span>
                )}
              </h2>
              <p className="dash-text">
                {cropHealthData.length > 0 ? 
                  <>
                    {cropHealthData.filter(scan => scan.status === 'Healthy' || !scan.status).length} <TranslatedText text="of" /> {cropHealthData.length} <TranslatedText text="recent scans show healthy crops" />
                  </> :
                  <TranslatedText text="Your crops are looking healthy today" />
                }
              </p>
              {lastUpdated && (
                <p style={{ fontSize: '0.9rem', color: '#666', margin: '8px 0' }}>
                  <TranslatedText text="Last updated" />: {lastUpdated.toLocaleTimeString()}
                  <button 
                    onClick={handleRefresh}
                    style={{
                      marginLeft: '10px',
                      background: 'none',
                      border: 'none',
                      color: '#059669',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                    disabled={isLoading}
                  >
                    <FaSync className={isLoading ? 'fa-spin' : ''} /> <TranslatedText text="Refresh" />
                  </button>
                </p>
              )}
              <div className="hero-actions">
                <button className="btn-cta" onClick={() => window.location.hash = '#/detect'}>
                  <FaLeaf style={{marginRight: 6}} /> <TranslatedText text="Scan Leaf" />
                </button>
                <button className="btn-cta outline" onClick={() => window.location.hash = '#/chat'}>
                  💬 <TranslatedText text="Ask AI" />
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
              <strong style={{fontSize: '1.15rem'}}><TranslatedText text="Crop Health" /></strong>
            </div>
            {recentScans.length > 0 ? (
              recentScans.map((scan, idx) => (
                <div key={idx} style={{marginBottom: 16, padding: '12px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0'}}>
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: 8}}>
                    <span style={{fontWeight: 700, marginRight: 8, fontSize: '1.1rem'}}>{scan.crop}</span>
                    <span className={scan.statusType} style={{display: 'flex', alignItems: 'center', fontWeight: 700, color: scan.statusType === 'warn' ? '#c44' : '#1ea055', marginRight: 8}}>
                      {scan.icon} {scan.status}
                    </span>
                    {scan.identificationProbability > 0 && (
                      <span style={{fontSize: '0.8rem', color: '#64748b', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: 4}}>
                        {scan.identificationProbability}% confidence
                      </span>
                    )}
                  </div>
                  {scan.scientificName && (
                    <div style={{fontSize: '0.9rem', color: '#475569', marginBottom: 4}}>
                      <em>{scan.scientificName}</em>
                    </div>
                  )}
                  <div style={{display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: '#64748b'}}>
                    <span style={{marginRight: 12}}>
                      Scanned: {scan.date}
                    </span>
                    {scan.severity !== 'none' && (
                      <span style={{marginRight: 12}}>
                        Severity: <span style={{fontWeight: 600, color: scan.severity === 'severe' ? '#c44' : scan.severity === 'moderate' ? '#f59e0b' : '#1ea055'}}>
                          {scan.severity}
                        </span>
                      </span>
                    )}
                  </div>
                  {scan.healthAssessment && scan.healthAssessment !== 'Not assessed' && (
                    <div style={{fontSize: '0.85rem', color: '#475569', marginTop: 4}}>
                      Assessment: {scan.healthAssessment}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{display: 'flex', alignItems: 'center', padding: '20px 0'}}>
                <FaInfoCircle style={{marginRight: 8, color: '#64748b'}} />
                <span style={{color: '#64748b'}}><TranslatedText text="Not detected any crops yet" /></span>
              </div>
            )}
          </div>

          {/* Block 2: Today's Tips */}
          <div className="card todays-tips" style={{flex: 1, minWidth: 0}}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: 10}}>
              <FaLightbulb style={{marginRight: 8, color: '#fbbf24'}} />
              <strong style={{fontSize: '1.15rem'}}><TranslatedText text="Today's Tips" /></strong>
            </div>
            {tips.length > 0 ? (
              tips.map((tip, idx) => (
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
              ))
            ) : (
              <div style={{display: 'flex', alignItems: 'center', padding: '20px 0'}}>
                <FaInfoCircle style={{marginRight: 8, color: '#64748b'}} />
                <span style={{color: '#64748b'}}><TranslatedText text="No specific tips available for your crops" /></span>
              </div>
            )}
          </div>

          {/* Block 3: Weather */}
          <div className="card todays-weather" style={{flex: 1, minWidth: 0}}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: 10, justifyContent: 'space-between'}}>
              <div style={{display: 'flex', alignItems: 'center'}}>
                <FaCloud style={{marginRight: 8, color: '#3b7c5a'}} />
                <strong style={{fontSize: '1.15rem'}}><TranslatedText text="Today's Weather" /></strong>
              </div>
              <button 
                onClick={() => window.location.hash = '#/weather'}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#059669',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <TranslatedText text="View Details" />
              </button>
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
                <span style={{fontSize: 14, color: '#64748b'}}><TranslatedText text="Humidity" /></span>
                <span style={{fontWeight: 700, marginLeft: 4}}>{weather.humidity}%</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                <FaWind style={{color: '#64748b'}} />
                <span style={{fontSize: 14, color: '#64748b'}}><TranslatedText text="Wind" /></span>
                <span style={{fontWeight: 700, marginLeft: 4}}>{weather.wind} km/h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Market Prices Section */}
        <div className="market-prices card" style={{marginTop: 24, marginBottom: '40px'}}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3><TranslatedText text="Market Prices" /></h3>
            <button 
              onClick={() => window.location.hash = '#/market'}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#059669',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              View All Markets
            </button>
          </div>
          <div className="market-row">
            {(realTimeMarketData.length > 0 ? realTimeMarketData : (marketData.length > 0 ? marketData : getFallbackMarketData(profile))).map((item, index) => (
              <div key={index} className="price-summary">
                <div className="p-name">{item.crop}</div>
                <div className="p-value">₹{item.price}</div>
                <div className={`p-change ${item.change?.direction === 'up' ? 'pos' : 'neg'}`}>
                  {item.change?.direction === 'up' ? '+' : ''}{item.change?.percentage || item.change}%
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                  {item.market}
                </div>
              </div>
            ))}
          </div>
          <div className="market-chart card-chart" ref={chartRef} />
        </div>
        </div>
      </main>
    </div>
    
  );
}

