// Debug utility for diagnosing dashboard issues
export const debugDashboard = () => {
  console.log('=== Dashboard Debug Information ===');
  
  // Check localStorage items
  const profile = localStorage.getItem('ammachi_profile');
  const session = localStorage.getItem('ammachi_session');
  
  console.log('Raw profile in localStorage:', profile);
  console.log('Raw session in localStorage:', session);
  
  try {
    const profileObj = JSON.parse(profile || '{}');
    const sessionObj = JSON.parse(session || '{}');
    
    console.log('Parsed Profile:', profileObj);
    console.log('Parsed Session:', sessionObj);
    
    // Check for user ID in various locations
    const userIdSources = {
      'session.userId': sessionObj.userId,
      'session.id': sessionObj.id,
      'session._id': sessionObj._id,
      'profile._id': profileObj._id,
      'profile.id': profileObj.id,
      'profile.userId': profileObj.userId
    };
    
    console.log('UserId sources:', userIdSources);
    
    // Check for user ID
    const userId = sessionObj.userId || sessionObj.id || sessionObj._id || 
                  profileObj._id || profileObj.id || profileObj.userId;
                  
    console.log('Extracted userId:', userId);
    console.log('UserId type:', typeof userId);
    console.log('UserId length:', userId ? userId.length : 'N/A');
    
    // Validate userId format
    if (userId) {
      if (typeof userId === 'string' && userId.length === 24) {
        console.log('✓ UserId format appears valid (24-character hex string)');
      } else {
        console.warn('⚠ UserId format may be invalid. Expected 24-character hex string.');
      }
    } else {
      console.warn('⚠ No valid userId found in profile or session');
    }
    
    return { profile: profileObj, session: sessionObj, userId };
  } catch (error) {
    console.error('Error parsing localStorage data:', error);
    return { error: 'Failed to parse localStorage data' };
  }
};

// Function to test backend connectivity
export const testBackendConnectivity = async () => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    console.log('Testing backend connectivity to:', backendUrl);
    
    // Test basic connectivity
    const healthResponse = await fetch(`${backendUrl}/api/health`);
    console.log('Health check response:', healthResponse.status, await healthResponse.json());
    
    // Test CORS
    const corsResponse = await fetch(`${backendUrl}/api/test-cors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: true })
    });
    console.log('CORS test response:', corsResponse.status, await corsResponse.json());
    
    return true;
  } catch (error) {
    console.error('Backend connectivity test failed:', error);
    return false;
  }
};

// Function to test dashboard endpoint with a specific userId
export const testDashboardEndpoint = async (userId) => {
  if (!userId) {
    console.error('No userId provided for testing');
    return false;
  }
  
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    console.log('Testing dashboard endpoint with userId:', userId);
    
    const response = await fetch(`${backendUrl}/api/farmers/dashboard/${userId}`);
    console.log('Dashboard endpoint response:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Dashboard data:', data);
      return true;
    } else {
      const errorText = await response.text();
      console.error('Dashboard endpoint error:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('Dashboard endpoint test failed:', error);
    return false;
  }
};