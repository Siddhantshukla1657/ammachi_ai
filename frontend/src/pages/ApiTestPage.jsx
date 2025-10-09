import React, { useState } from 'react';
import { getBackendUrl } from '../auth';
import { debugDashboard, testBackendConnectivity, testDashboardEndpoint } from '../utils/debug';

const ApiTestPage = () => {
  const [testResults, setTestResults] = useState([]);
  const [userId, setUserId] = useState('');

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const runDebugCheck = () => {
    clearResults();
    addResult('Running debug check...', 'info');
    
    const debugInfo = debugDashboard();
    if (debugInfo.userId) {
      setUserId(debugInfo.userId);
      addResult(`Found userId: ${debugInfo.userId}`, 'success');
    } else {
      addResult('No valid userId found', 'error');
    }
  };

  const testBackend = async () => {
    addResult('Testing backend connectivity...', 'info');
    const success = await testBackendConnectivity();
    addResult(success ? 'Backend connectivity test passed' : 'Backend connectivity test failed', success ? 'success' : 'error');
  };

  const testDashboardEndpoint = async () => {
    if (!userId) {
      addResult('No userId provided. Run debug check first.', 'error');
      return;
    }

    try {
      addResult(`Testing dashboard endpoint with userId: ${userId}`, 'info');
      const backendUrl = getBackendUrl();
      addResult(`Using backend URL: ${backendUrl}`, 'info');
      
      const response = await fetch(`${backendUrl}/api/farmers/dashboard/${userId}`);
      addResult(`Response status: ${response.status}`, response.ok ? 'success' : 'error');
      
      if (response.ok) {
        const data = await response.json();
        addResult(`Success! Received data for farmer: ${data.data?.farmer?.name}`, 'success');
        console.log('Dashboard data:', data);
      } else {
        const errorText = await response.text();
        addResult(`Error response: ${errorText}`, 'error');
      }
    } catch (error) {
      addResult(`Request failed: ${error.message}`, 'error');
      console.error('Dashboard test error:', error);
    }
  };

  const testInvalidEndpoint = async () => {
    try {
      addResult('Testing invalid endpoint...', 'info');
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/invalid-endpoint`);
      addResult(`Invalid endpoint response: ${response.status}`, 'info');
    } catch (error) {
      addResult(`Invalid endpoint test failed: ${error.message}`, 'error');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>API Test Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter userId (24-character hex string)"
          style={{ 
            padding: '8px', 
            marginRight: '10px', 
            width: '300px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
        <button 
          onClick={runDebugCheck}
          style={{ 
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Run Debug Check
        </button>
        <button 
          onClick={testBackend}
          style={{ 
            padding: '8px 16px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Test Backend
        </button>
        <button 
          onClick={clearResults}
          style={{ 
            padding: '8px 16px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Results
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testDashboardEndpoint}
          style={{ 
            padding: '8px 16px',
            background: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Test Dashboard Endpoint
        </button>
        <button 
          onClick={testInvalidEndpoint}
          style={{ 
            padding: '8px 16px',
            background: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Invalid Endpoint
        </button>
      </div>

      <div style={{ 
        border: '1px solid #e5e7eb', 
        borderRadius: '4px', 
        padding: '15px',
        backgroundColor: '#f9fafb'
      }}>
        <h3>Test Results</h3>
        {testResults.length === 0 ? (
          <p>No test results yet. Run a test to see results here.</p>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {testResults.map((result, index) => (
              <div 
                key={index} 
                style={{ 
                  padding: '8px', 
                  marginBottom: '5px', 
                  backgroundColor: 
                    result.type === 'success' ? '#dcfce7' : 
                    result.type === 'error' ? '#fee2e2' : 
                    '#f0f9ff',
                  borderLeft: `4px solid ${
                    result.type === 'success' ? '#22c55e' : 
                    result.type === 'error' ? '#ef4444' : 
                    '#3b82f6'
                  }`,
                  fontFamily: 'monospace',
                  fontSize: '14px'
                }}
              >
                [{result.timestamp}] {result.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiTestPage;