import React, { useState, useEffect } from 'react';
import { getBackendUrl } from '../auth';

export default function ApiTest() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = [];
    const backendUrl = getBackendUrl();

    // Test 1: Basic connectivity
    try {
      const response = await fetch(`${backendUrl}/api/health`);
      const data = await response.json();
      results.push({
        name: 'Backend Connectivity',
        status: response.ok ? 'PASS' : 'FAIL',
        details: response.ok ? 'Successfully connected to backend' : `Status: ${response.status}`,
        data: data
      });
    } catch (error) {
      results.push({
        name: 'Backend Connectivity',
        status: 'FAIL',
        details: `Error: ${error.message}`,
        data: null
      });
    }

    // Test 2: CORS endpoint
    try {
      const response = await fetch(`${backendUrl}/api/test-cors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      results.push({
        name: 'CORS Configuration',
        status: response.ok ? 'PASS' : 'FAIL',
        details: response.ok ? 'CORS is properly configured' : `Status: ${response.status}`,
        data: data
      });
    } catch (error) {
      results.push({
        name: 'CORS Configuration',
        status: 'FAIL',
        details: `Error: ${error.message}`,
        data: null
      });
    }

    // Test 3: Market API
    try {
      const response = await fetch(`${backendUrl}/api/market/markets?state=Kerala&district=Ernakulam`);
      const data = await response.json();
      results.push({
        name: 'Market API',
        status: response.ok ? 'PASS' : 'FAIL',
        details: response.ok ? 'Market API is working' : `Status: ${response.status}`,
        data: data
      });
    } catch (error) {
      results.push({
        name: 'Market API',
        status: 'FAIL',
        details: `Error: ${error.message}`,
        data: null
      });
    }

    // Test 4: Weather API
    try {
      const response = await fetch(`${backendUrl}/api/weather/current?lat=10&lon=76`);
      const data = await response.json();
      results.push({
        name: 'Weather API',
        status: response.ok ? 'PASS' : 'FAIL',
        details: response.ok ? 'Weather API is working' : `Status: ${response.status}`,
        data: data
      });
    } catch (error) {
      results.push({
        name: 'Weather API',
        status: 'FAIL',
        details: `Error: ${error.message}`,
        data: null
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>API Connection Test</h1>
      <p>Backend URL: {getBackendUrl()}</p>
      
      <button 
        onClick={runTests} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Running Tests...' : 'Run Tests Again'}
      </button>

      <div style={{ marginTop: '20px' }}>
        {testResults.map((test, index) => (
          <div 
            key={index} 
            style={{
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '15px',
              marginBottom: '10px',
              backgroundColor: test.status === 'PASS' ? '#d4edda' : '#f8d7da'
            }}
          >
            <h3 style={{ margin: '0 0 10px 0' }}>
              {test.name} - 
              <span style={{ 
                color: test.status === 'PASS' ? '#155724' : '#721c24',
                marginLeft: '10px'
              }}>
                {test.status}
              </span>
            </h3>
            <p style={{ margin: '5px 0' }}>{test.details}</p>
            {test.data && (
              <details>
                <summary>Response Data</summary>
                <pre style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '10px', 
                  borderRadius: '4px',
                  maxHeight: '200px',
                  overflow: 'auto'
                }}>
                  {JSON.stringify(test.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}