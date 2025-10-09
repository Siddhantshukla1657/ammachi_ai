import React, { useState, useEffect } from 'react';
import { auth } from '../auth';

export default function FirebaseTest() {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runFirebaseTest = async () => {
    setLoading(true);
    try {
      // Test Firebase app initialization
      const app = auth.app;
      const config = app.options;
      
      setTestResults({
        status: 'success',
        message: 'Firebase initialized successfully',
        config: {
          apiKey: config.apiKey ? '✅ Set' : '❌ Missing',
          authDomain: config.authDomain || '❌ Missing',
          projectId: config.projectId || '❌ Missing'
        }
      });
    } catch (error) {
      setTestResults({
        status: 'error',
        message: 'Firebase initialization failed',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runFirebaseTest();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Firebase Connection Test</h1>
      
      <button 
        onClick={runFirebaseTest} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Testing...' : 'Run Test Again'}
      </button>

      {testResults && (
        <div style={{
          padding: '15px',
          borderRadius: '4px',
          backgroundColor: testResults.status === 'success' ? '#d4edda' : '#f8d7da',
          border: `1px solid ${testResults.status === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          <h3>Test Results</h3>
          <p><strong>Status:</strong> {testResults.message}</p>
          
          {testResults.config && (
            <div>
              <h4>Configuration Check:</h4>
              <ul>
                <li>API Key: {testResults.config.apiKey}</li>
                <li>Auth Domain: {testResults.config.authDomain}</li>
                <li>Project ID: {testResults.config.projectId}</li>
              </ul>
            </div>
          )}
          
          {testResults.error && (
            <div>
              <h4>Error Details:</h4>
              <p>{testResults.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}