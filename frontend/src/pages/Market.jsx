import React, { useState, useEffect, useRef } from 'react';
import './market.css';
import Sidebar from '../components/Sidebar.jsx';

// Kerala districts for market selection
const KERALA_DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
  'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
  'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
];

// Popular crops for Kerala farmers
const POPULAR_CROPS = ['Rice', 'Coconut', 'Pepper', 'Cardamom', 'Rubber', 'Ginger'];

export default function Market() {
  const [selectedDistrict, setSelectedDistrict] = useState('Ernakulam');
  const [selectedCrop, setSelectedCrop] = useState('Rice');
  const [marketData, setMarketData] = useState([]);
  const [availableMarkets, setAvailableMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const chartRef = useRef(null);

  // Fetch available markets when district changes
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/market/markets?state=Kerala&district=${selectedDistrict}`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          setAvailableMarkets(data.data);
          setSelectedMarket(data.data[0]); // Auto-select first market
        } else {
          setAvailableMarkets([]);
          setSelectedMarket('');
        }
      } catch (error) {
        console.error('Failed to fetch markets:', error);
        setError('Failed to load markets');
      } finally {
        setLoading(false);
      }
    };

    if (selectedDistrict) {
      fetchMarkets();
    }
  }, [selectedDistrict]);

  // Fetch market prices when market or crop changes
  useEffect(() => {
    const fetchMarketData = async () => {
      if (!selectedMarket || !selectedCrop) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `/api/market/prices?state=Kerala&market=${encodeURIComponent(selectedMarket)}&commodity=${encodeURIComponent(selectedCrop)}`
        );
        const data = await response.json();
        
        if (data.success) {
          setMarketData(data.data || []);
          setLastUpdated(new Date());
        } else {
          setError('Failed to fetch market data');
        }
      } catch (error) {
        console.error('Failed to fetch market data:', error);
        setError('Failed to connect to market API');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, [selectedMarket, selectedCrop]);

  // Initialize chart with market data
  useEffect(() => {
    let chart;
    async function initChart() {
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
        
        // Generate chart data from market data or use default
        const chartData = marketData.length > 0 
          ? generateChartData(marketData)
          : generateDefaultChartData();
        
        const option = {
          color: ['#3CB371', '#66CDAA', '#98FB98'], // mediumseagreen variations
          tooltip: { trigger: 'axis' },
          legend: { 
            data: [selectedCrop, 'Average Price', 'Price Trend'], 
            top: 8, 
            left: 'center', 
            itemGap: 20, 
            textStyle: { color: '#3CB371' } 
          },
          grid: { left: 40, right: 10, bottom: 30, top: 60 },
          xAxis: { 
            type: 'category', 
            data: chartData.dates,
            axisLine: { lineStyle: { color: '#B0E0B0' } }, 
            axisLabel: { color: '#3CB371' } 
          },
          yAxis: { 
            type: 'value', 
            axisLine: { lineStyle: { color: '#B0E0B0' } }, 
            axisLabel: { color: '#3CB371' }, 
            splitLine: { lineStyle: { color: 'rgba(60,179,113,0.1)' } } 
          },
          toolbox: { feature: { saveAsImage: {} } },
          series: [
            { 
              name: selectedCrop, 
              type: 'line', 
              smooth: true, 
              showSymbol: false, 
              data: chartData.prices, 
              areaStyle: { color: 'rgba(60,179,113,0.15)' }, 
              lineStyle: { width: 3, color: '#3CB371' } 
            }
          ]
        };
        chart.setOption(option);
      } catch (e) {
        console.error('Chart initialization failed:', e);
      }
    }
    
    initChart();
    const onResize = () => { if (chart) chart.resize(); };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); if (chart) chart.dispose && chart.dispose(); };
  }, [marketData, selectedCrop]);

  // Helper function to generate chart data from API response
  const generateChartData = (data) => {
    const dates = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const prices = data.length > 0 
      ? data.map(item => item.modal_price || item.max_price || 0)
      : [0, 0, 0, 0, 0, 0, 0];
    
    // If we have fewer data points, repeat the last value
    while (prices.length < 7) {
      prices.push(prices[prices.length - 1] || 0);
    }
    
    return { dates, prices: prices.slice(0, 7) };
  };

  // Helper function to generate default chart data
  const generateDefaultChartData = () => {
    return {
      dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      prices: [2400, 2420, 2430, 2410, 2440, 2460, 2480]
    };
  };

  // Helper function to calculate price change
  const calculatePriceChange = (item, index) => {
    if (marketData.length > 1 && index > 0) {
      const current = item.modal_price || item.max_price || 0;
      const previous = marketData[index - 1]?.modal_price || marketData[index - 1]?.max_price || current;
      const change = ((current - previous) / previous * 100).toFixed(1);
      return change >= 0 ? `+${change}%` : `${change}%`;
    }
    return '0%';
  };

  // Helper function to format update time
  const formatUpdateTime = (arrivalDate) => {
    if (!arrivalDate) return 'Recently';
    try {
      const date = new Date(arrivalDate);
      const now = new Date();
      const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
      if (diffHours < 1) return 'Recently';
      if (diffHours < 24) return `${diffHours} hours ago`;
      return `${Math.floor(diffHours / 24)} days ago`;
    } catch {
      return 'Recently';
    }
  };

  // Refresh function
  const handleRefresh = () => {
    setLastUpdated(new Date());
    // Trigger re-fetch by updating state
    setSelectedMarket(selectedMarket);
  };

  // Process market data for display
  const processedPrices = marketData.length > 0 
    ? marketData.slice(0, 6).map((item, index) => ({
        id: `${selectedCrop}-${index}`,
        name: `${selectedCrop} (${item.variety || 'Standard'})`,
        price: `₹${item.modal_price || item.max_price || 'N/A'}`,
        unit: selectedCrop === 'Rice' ? '/quintal' : '/kg',
        change: calculatePriceChange(item, index),
        quality: item.grade || 'Standard',
        updated: formatUpdateTime(item.arrival_date),
        market: item.market
      }))
    : [
        { id: 'rice', name: 'Rice', price: '₹2400', unit: '/quintal', change: '+5.2%', quality: 'Premium', updated: '2 hours ago' },
        { id: 'coconut', name: 'Coconut', price: '₹35', unit: '/piece', change: '0%', quality: 'Standard', updated: '1 hour ago' },
        { id: 'pepper', name: 'Pepper', price: '₹520', unit: '/kg', change: '+8.1%', quality: 'Premium', updated: '30 min ago' }
      ];

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
              <label className="control-label">Select District</label>
              <select 
                className="control-select" 
                value={selectedDistrict} 
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={loading}
              >
                {KERALA_DISTRICTS.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
              <div className="control-note">District: {selectedDistrict}</div>
            </div>

            <div className="control-card">
              <label className="control-label">Select Market</label>
              <select 
                className="control-select" 
                value={selectedMarket} 
                onChange={(e) => setSelectedMarket(e.target.value)}
                disabled={loading || availableMarkets.length === 0}
              >
                {availableMarkets.map(market => (
                  <option key={market} value={market}>{market}</option>
                ))}
              </select>
              <div className="control-note">
                {availableMarkets.length === 0 ? 'No markets found' : `${availableMarkets.length} markets available`}
              </div>
            </div>

            <div className="control-card">
              <label className="control-label">Select Crop</label>
              <select 
                className="control-select" 
                value={selectedCrop} 
                onChange={(e) => setSelectedCrop(e.target.value)}
                disabled={loading}
              >
                {POPULAR_CROPS.map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
              <div className="control-note">Crop: {selectedCrop}</div>
            </div>

            <div className="control-card status-card">
              <label className="control-label">Last Updated</label>
              <div className="updated-time">{lastUpdated.toLocaleString()}</div>
              <button className="refresh-btn" onClick={handleRefresh} disabled={loading}>
                {loading ? '⟳' : '⟳'}
              </button>
            </div>
          </div>

          {error && (
            <div className="market-error">
              <div className="error-icon">⚠️</div>
              <div className="error-message">{error}</div>
              <button className="retry-btn" onClick={handleRefresh}>Retry</button>
            </div>
          )}

          {loading && (
            <div className="market-loading">
              <div className="loading-spinner"></div>
              <div className="loading-text">Loading market data...</div>
            </div>
          )}

          <div className="market-chart card">
            <div ref={chartRef} className="chart-area" />
          </div>

          <section className="prices-grid">
            {processedPrices.map(p => (
              <article key={p.id} className="price-card">
                <div className="price-card-head">
                  <div className="price-name">{p.name}</div>
                  <div className={`price-change ${p.change.startsWith('-') ? 'neg' : 'pos'}`}>{p.change}</div>
                </div>
                <div className="price-amount">{p.price}<span className="price-unit">{p.unit}</span></div>
                <div className="price-meta">
                  <div><span className="meta-label">Quality:</span> {p.quality}</div>
                  <div><span className="meta-label">Updated:</span> {p.updated}</div>
                  {p.market && (
                    <div><span className="meta-label">Market:</span> {p.market}</div>
                  )}
                </div>
              </article>
            ))}
          </section>

          <section className="market-lower">
            <div className="market-trends card">
              <h3 className="card-title">Market Summary</h3>
              <div className="summary-stats">
                <div className="summary-item">
                  <span className="summary-label">Selected Market:</span>
                  <span className="summary-value">{selectedMarket || 'None'}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Data Points:</span>
                  <span className="summary-value">{marketData.length}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Average Price:</span>
                  <span className="summary-value">
                    {marketData.length > 0 
                      ? `₹${Math.round(marketData.reduce((sum, item) => sum + (item.modal_price || item.max_price || 0), 0) / marketData.length)}`
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>

            <aside className="selling-tips card">
              <h3 className="card-title">Market Insights</h3>
              <div className="tip">
                📊 Real-time data from AGMARKNET API provides accurate market prices across Kerala.
              </div>
              <div className="tip muted">
                💡 Tip: Compare prices across different markets in your district before selling.
              </div>
              {marketData.length > 0 && (
                <div className="tip">
                  📈 Current {selectedCrop} prices in {selectedMarket} market.
                </div>
              )}
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}
