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
      const storedProfileRaw = localStorage.getItem('ammachi_profile');
      const storedSessionRaw = localStorage.getItem('ammachi_session');
      const authToken = localStorage.getItem('authToken');
      
      const storedProfile = storedProfileRaw ? JSON.parse(storedProfileRaw) : null;
      const storedSession = storedSessionRaw ? JSON.parse(storedSessionRaw) : null;
      const userEmail = (storedProfile?.email || storedSession?.email || '').trim().toLowerCase();

      if (!userEmail) {
        throw new Error('No logged-in user found in local storage');
      }
      
      // First try to get profile from auth API
      const response = await fetch(`/api/auth/profile/${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      
      if (data.success) {
        const u = {
          ...data.user,
          farms: Array.isArray(data.user?.farms) ? data.user.farms : [],   // normalize
        };
        setUser(u);
        setFormData(u);
      } else {
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
              const u = { ...tokenData.user, farms: [] };
              setUser(u);
              setFormData(u);
              return;
            }
          } catch {}
        }
        const fallback = { email: userEmail, displayName: userEmail.split('@')[0], farms: [] };
        setUser(fallback);
        setFormData(fallback);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      const fallback = { email: 'unknown', displayName: 'User', farms: [] };
      setUser(fallback);
      setFormData(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Nested updater for farms
  const handleFarmChange = (idx, field, value) => {
    setFormData(prev => {
      const farms = Array.isArray(prev.farms) ? [...prev.farms] : [];
      farms[idx] = { ...(farms[idx] || {}), [field]: value };
      return { ...prev, farms };
    });
  };

  const addFarm = () => {
    setFormData(prev => ({
      ...prev,
      farms: [...(prev.farms || []), { farmName: '', acres: '', location: '', crops: '' }]
    }));
  };

  const removeFarm = (idx) => {
    setFormData(prev => {
      const farms = [...(prev.farms || [])];
      farms.splice(idx, 1);
      return { ...prev, farms };
    });
  };

  const handleSave = async () => {
    try {
      const userEmail = user?.email;
      if (!userEmail) {
        setMessage('Unable to update profile: no user email found');
        return;
      }

      const response = await fetch(`/api/auth/profile/${encodeURIComponent(userEmail)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setUser(formData);
        setEditing(false);
        setMessage('Profile updated successfully!');
        
        // Update local storage with new data
        const currentProfile = JSON.parse(localStorage.getItem('ammachi_profile') || '{}');
        const updatedProfile = { ...currentProfile, ...formData };
        localStorage.setItem('ammachi_profile', JSON.stringify(updatedProfile));
        
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update profile: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile: Network error');
    }
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('userEmail');
    localStorage.removeItem('authToken');
    localStorage.removeItem('ammachi_profile');
    localStorage.removeItem('ammachi_session');
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
        <div className="profile-content-wrapper">
          <div className="profile-content">
            {/* User Summary Card */}
            <div className="user-summary-card">
              <div className="user-avatar">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="user-info">
                <h2>{user?.displayName || 'User'}</h2>
                <p>{user?.district ? `Farmer • ${user.district}` : 'Farmer'}</p>
              </div>
              <div className="user-tags">
                {user?.language ? <span className="tag">{user.language}</span> : null}
                {user?.state ? <span className="tag">{user.state}</span> : null}
                {typeof user?.experience === 'number' ? <span className="tag">{user.experience} yrs</span> : null}
              </div>
            </div>

            {/* Personal Information */}
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
                <>
                  <div className="info-grid">
                    {/* Full Name */}
                    <InfoItem label="Full Name" icon="user" value={user?.displayName || '—'} />

                    {/* Email */}
                    <InfoItem label="Email" icon="mail" value={user?.email || '—'} />

                    {/* Phone */}
                    <InfoItem label="Phone Number" icon="phone" value={user?.phoneNumber || '—'} />

                    {/* Language */}
                    <InfoItem label="Language" icon="globe" value={user?.language || '—'} />

                    {/* Experience */}
                    <InfoItem
                      label="Experience (years)"
                      icon="briefcase"
                      value={typeof user?.experience === 'number' ? `${user.experience}` : '—'}
                    />

                    {/* Number of farms */}
                    <InfoItem
                      label="Number of farms"
                      icon="layers"
                      value={typeof user?.numberOfFarms === 'number' ? `${user.numberOfFarms}` : (user?.farms?.length ?? '—')}
                    />

                    {/* State */}
                    <InfoItem label="State" icon="map" value={user?.state || '—'} />

                    {/* District */}
                    <InfoItem label="District" icon="pin" value={user?.district || '—'} />
                  </div>

                  {/* Farms block */}
                  <div className="card-header" style={{ marginTop: '1rem' }}>
                    <h3>Farms</h3>
                  </div>
                  <div className="farms-grid">
                    {(user?.farms || []).length === 0 ? (
                      <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                        <div className="info-content">
                          <span className="info-value">No farms added.</span>
                        </div>
                      </div>
                    ) : (
                      user.farms.map((farm, i) => (
                        <div className="farm-card" key={i}>
                          <h4>Farm {i + 1}{farm?.farmName ? ` — ${farm.farmName}` : ''}</h4>
                          <div className="farm-field">
                            <span className="farm-label">Farm Name</span>
                            {farm?.farmName || '—'}
                          </div>
                          <div className="farm-field">
                            <span className="farm-label">Acres</span>
                            {farm?.acres ?? '—'}
                          </div>
                          <div className="farm-field">
                            <span className="farm-label">Location</span>
                            {farm?.location || '—'}
                          </div>
                          <div className="farm-field" style={{ gridColumn: '1 / -1' }}>
                            <span className="farm-label">Crops</span>
                            {Array.isArray(farm?.crops) ? farm.crops.join(', ') : (farm?.crops || '—')}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
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
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        readOnly
                        title="Email cannot be changed"
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
                      <label>Language</label>
                      <select
                        name="language"
                        value={formData.language || ''}
                        onChange={handleInputChange}
                        className="language-select"
                        style={{ backgroundColor: '#66BB6A', color: '#f3f5f4' }}
                      >
                        <option value="">Select</option>
                        <option value="English">English</option>
                        <option value="Malayalam">Malayalam</option>
                        <option value="Hindi">Hindi</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Experience (years)</label>
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience ?? ''}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Number of farms</label>
                      <input
                        type="number"
                        name="numberOfFarms"
                        value={formData.numberOfFarms ?? (formData.farms?.length ?? '')}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state || ''}
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

                  {/* Farms editor */}
                  <div className="card-header" style={{ marginTop: '0.5rem' }}>
                    <h3>Farms</h3>
                    <button type="button" className="edit-btn" onClick={addFarm}>Add Farm</button>
                  </div>

                  <div className="farms-grid">
                    {(formData.farms || []).map((farm, i) => (
                      <div className="farm-card" key={i}>
                        <h4>
                          Farm {i + 1}
                          <button
                            type="button"
                            className="edit-btn"
                            style={{ float: 'right', padding: '0.25rem 0.6rem' }}
                            onClick={() => removeFarm(i)}
                          >
                            Remove
                          </button>
                        </h4>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="farm-label">Farm Name</label>
                          <input
                            type="text"
                            value={farm?.farmName || ''}
                            onChange={(e) => handleFarmChange(i, 'farmName', e.target.value)}
                          />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="farm-label">Acres</label>
                          <input
                            type="number"
                            value={farm?.acres ?? ''}
                            onChange={(e) => handleFarmChange(i, 'acres', e.target.value)}
                          />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="farm-label">Location</label>
                          <input
                            type="text"
                            value={farm?.location || ''}
                            onChange={(e) => handleFarmChange(i, 'location', e.target.value)}
                          />
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / -1', margin: 0 }}>
                          <label className="farm-label">Crops (comma separated)</label>
                          <input
                            type="text"
                            value={
                              Array.isArray(farm?.crops)
                                ? farm.crops.join(', ')
                                : (farm?.crops || '')
                            }
                            onChange={(e) => {
                              // store as string; backend can normalize to array
                              handleFarmChange(i, 'crops', e.target.value);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="form-actions" style={{ marginTop: '1rem' }}>
                    <button type="submit" className="save-btn">Save Changes</button>
                    <button type="button" className="cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>

            {/* App Settings */}
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
                <select
                  className="language-select"
                  value={formData.language || user?.language || 'English'}
                  onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                >
                  <option value="English">English</option>
                  <option value="Malayalam">Malayalam</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>
            </div>

            {/* Activity */}
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

            {message && <div className="message">{message}</div>}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------- Small icon component for readability ---------- */
function InfoItem({ label, value, icon }) {
  const Icon = () => {
    switch (icon) {
      case 'user': return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 21V19C20 17.9 19.58 16.92 18.83 16.17C18.08 15.42 17.06 15 16 15H8C6.94 15 5.92 15.42 5.17 16.17C4.42 16.92 4 17.9 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 7C16 9.21 14.21 11 12 11C9.79 11 8 9.21 8 7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
      case 'mail': return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4H20V20H4V4Z" stroke="currentColor" strokeWidth="2"/><path d="M4 6L12 13L20 6" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
      case 'phone': return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 16.92V19.92C22 20.98 21.12 21.86 20.06 21.86C10.72 21.3 2.7 13.28 2.14 3.94C2.14 2.88 3.02 2 4.08 2H7.08C7.53 2 7.94 2.24 8.15 2.63L9.9 5.94C10.08 6.28 10.05 6.68 9.82 6.98L8.37 8.87C9.77 11.61 12.11 13.95 14.85 15.35L16.74 13.9C17.04 13.67 17.44 13.64 17.78 13.82L21.09 15.57C21.48 15.78 21.72 16.19 21.72 16.64L22 16.92Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
      case 'globe': return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M3 12H21M12 3C14.5 6.5 14.5 17.5 12 21M12 3C9.5 6.5 9.5 17.5 12 21" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
      case 'briefcase': return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 7H21V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V7Z" stroke="currentColor" strokeWidth="2"/><path d="M8 7V5C8 3.9 8.9 3 10 3H14C15.1 3 16 3.9 16 5V7" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
      case 'layers': return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/><path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/><path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
      case 'map': return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 3L15 5L21 3V17L15 19L9 17L3 19V5L9 3Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
      case 'pin': return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.6 3.95 5.32 5.64 3.64C7.32 1.95 9.61 1 12 1C14.39 1 16.68 1.95 18.36 3.64C20.05 5.32 21 7.6 21 10Z" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
      default: return null;
    }
  };

  return (
    <div className="info-item">
      <div className="info-icon"><Icon /></div>
      <div className="info-content">
        <span className="info-label">{label}</span>
        <span className="info-value">{value}</span>
      </div>
    </div>
  );
}
