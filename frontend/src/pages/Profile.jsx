import React, { useState, useEffect } from 'react';
import './profile.css';
import Sidebar from '../components/Sidebar.jsx';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      // Resolve logged-in user from existing session storage
      const storedProfileRaw = localStorage.getItem('ammachi_profile');
      const storedSessionRaw = localStorage.getItem('ammachi_session');
      const storedProfile = storedProfileRaw ? JSON.parse(storedProfileRaw) : null;
      const storedSession = storedSessionRaw ? JSON.parse(storedSessionRaw) : null;
      const userEmail = (storedProfile?.email || storedSession?.email || '').trim().toLowerCase();

      if (!userEmail) {
        throw new Error('No logged-in user found in local storage');
      }
      
      const response = await fetch(`http://localhost:5000/api/auth/profile/${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        setFormData(data.user);
      } else {
        // If user not found, try to get from auth token only; do not fabricate data
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
          try {
            const tokenResponse = await fetch('http://localhost:5000/api/auth/verify-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken: authToken })
            });
            const tokenData = await tokenResponse.json();
            if (tokenData.user) {
              setUser(tokenData.user);
              setFormData(tokenData.user);
              return;
            }
          } catch {}
        }
        // If still nothing, show minimal profile from email only
        setUser({ email: userEmail, displayName: userEmail.split('@')[0] });
        setFormData({ email: userEmail, displayName: userEmail.split('@')[0] });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to minimal profile only; no fake values
      setUser({ email: 'unknown', displayName: 'User' });
      setFormData({ email: 'unknown', displayName: 'User' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/profile/${user.email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(formData);
        setEditing(false);
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('authToken');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="profile-layout">
        <Sidebar />
        <main className="profile-main page-scroll">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="profile-layout">
      <Sidebar />
      <main className="profile-main page-scroll">

        <div className="profile-content">
          {/* User Summary Card */}
          <div className="user-summary-card">
            <div className="user-avatar">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="user-info">
              <h2>{user?.displayName || 'Ravi Kumar'}</h2>
              <p>Farmer • {user?.district || 'Wayanad'}</p>
            </div>
            <div className="user-tags">
              {user?.farmSize ? <span className="tag">{user.farmSize}</span> : null}
              {Array.isArray(user?.primaryCrops) ? <span className="tag">{user.primaryCrops.length} crops</span> : null}
            </div>
          </div>

          {/* Personal Information Card */}
          <div className="info-card">
            <div className="card-header">
              <h3>Personal Information</h3>
              {!editing && (
                <button className="edit-btn" onClick={() => setEditing(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Edit
                </button>
              )}
            </div>

            {!editing ? (
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="info-content">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">{user?.displayName || 'Ravi Kumar'}</span>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4L19 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="info-content">
                    <span className="info-label">Experience (years)</span>
                    <span className="info-value">{typeof user?.experience === 'number' ? `${user.experience} years` : '—'}</span>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="info-content">
                    <span className="info-label">Farm Size</span>
                    <span className="info-value">{user?.farmSize || '—'}</span>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4L19 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="info-content">
                    <span className="info-label">Primary Crops</span>
                    <div className="crop-tags">
                      {Array.isArray(user?.primaryCrops) && user.primaryCrops.length > 0
                        ? user.primaryCrops.map((crop, index) => (<span key={index} className="crop-tag">{crop}</span>))
                        : <span className="info-value">—</span>}
                    </div>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92H4.18C3.90257 21.9451 3.62306 21.9119 3.35925 21.8227C3.09543 21.7335 2.85322 21.5901 2.64796 21.4019C2.4427 21.2136 2.27909 20.9845 2.16747 20.7293C2.05585 20.4742 1.9989 20.1985 2 19.92V16.92M8 2H16L22 8V16.92H2V8L8 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="info-content">
                    <span className="info-label">Phone Number</span>
                    <span className="info-value">{user?.phoneNumber || '—'}</span>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="info-content">
                    <span className="info-label">District</span>
                    <span className="info-value">{user?.district || '—'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <form className="edit-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Experience (years)</label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Farm Size</label>
                    <input
                      type="text"
                      name="farmSize"
                      value={formData.farmSize || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>District</label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-btn">Save Changes</button>
                  <button type="button" className="cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>

          {/* App Settings Card */}
          <div className="info-card">
            <div className="card-header">
              <h3>App Settings</h3>
            </div>
            <div className="settings-item">
              <div className="settings-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4L19 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="settings-content">
                <span className="settings-label">Language</span>
                <span className="settings-value">Choose your preferred language</span>
              </div>
              <select className="language-select">
                <option value="english">English</option>
                <option value="malayalam">Malayalam</option>
              </select>
            </div>
          </div>

          {/* Activity Card */}
          <div className="activity-card">
            <h3>Your Activity</h3>
            <div className="activity-stats">
              <div className="stat-item">
                <span className="stat-number">{typeof user?.cropsScanned === 'number' ? user.cropsScanned : 0}</span>
                <span className="stat-label">Crops Scanned</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{typeof user?.questionsAsked === 'number' ? user.questionsAsked : 0}</span>
                <span className="stat-label">Questions Asked</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{typeof user?.daysActive === 'number' ? user.daysActive : 0}</span>
                <span className="stat-label">Days Active</span>
              </div>
            </div>
          </div>

          {message && (
            <div className="message">{message}</div>
          )}
        </div>
      </main>
    </div>
  );
}
