import React, { useMemo, useState, useEffect } from 'react';
import './auth.css';
import VideoBackground from '../components/VideoBackground.jsx';
import { getBackendUrl } from '../auth.js';

function makeFarmerId() {
  const t = Date.now().toString(36).slice(-6);
  const r = Math.random().toString(36).slice(2, 6);
  return `FMR${t}${r}`.toUpperCase();
}

function saveLocalFarm(payload) {
  try {
    const list = JSON.parse(localStorage.getItem('local_farmers') || '[]');
    list.push(payload);
    localStorage.setItem('local_farmers', JSON.stringify(list));
    return true;
  } catch (e) {
    console.warn('Failed to save local farmer', e);
    return false;
  }
}

function navigateToDashboard() {
  try {
    window.location.hash = '#/dashboard';
    try { window.dispatchEvent(new HashChangeEvent('hashchange')); } catch (e) {}
  } catch (e) {
    console.warn('Navigation failed', e);
  }
}

const initial = {
  farmerId: '',
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  language: 'malayalam',
  experience: 0,
  farmSize: '',
  state: 'Kerala',
  district: '',
  numFarms: 1,
  farms: [{ name: '', acres: '', location: '', crops: '' }]
};

export default function SignUp() {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    setForm(f => ({ ...f, farmerId: makeFarmerId() }));
    try {
      const pref = JSON.parse(localStorage.getItem('ammachi_oauth_prefill') || 'null');
      if (pref) {
        setForm(f => ({ ...f, name: pref.name || f.name, email: pref.email || f.email }));
        localStorage.removeItem('ammachi_oauth_prefill');
      }
    } catch (e) {}
  }, []);

  const cropList = useMemo(
    () =>
      (form.farms || [])
        .flatMap(f => (f.crops || '').split(',').map(c => c.trim()))
        .filter(Boolean),
    [form.farms]
  );

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'experience' || name === 'numFarms' ? Number(value) : value
    }));
  }

  function onFarmChange(index, key, value) {
    setForm(prev => {
      const farms = prev.farms.slice();
      farms[index] = { ...farms[index], [key]: value };
      return { ...prev, farms };
    });
  }

  useEffect(() => {
    const n = Number(form.numFarms) || 1;
    setForm(prev => {
      const farms = prev.farms.slice(0, n);
      while (farms.length < n) farms.push({ name: '', acres: '', location: '', crops: '' });
      return { ...prev, farms };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.numFarms]);

  function validate(payload) {
    if (!payload.name) return 'Name is required.';
    if (!payload.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) return 'A valid email is required.';
    if (!payload.phone || payload.phone.trim().length < 7) return 'A valid phone number is required.';
    if (!payload.password || payload.password.length < 6) return 'Password is required (minimum 6 characters).';
    if (payload.password !== payload.confirmPassword) return 'Passwords do not match.';
    if (!payload.district) return 'District is required.';
    if (!payload.state) return 'State is required.';
    if (!payload.farms || payload.farms.length === 0) return 'Please enter at least one farm.';
    for (let i = 0; i < payload.farms.length; i++) {
      const f = payload.farms[i];
      if (!f.name) return `Farm #${i + 1} name is required.`;
      if (!f.acres) return `Farm #${i + 1} acres is required.`;
      if (!f.crops || String(f.crops).trim().length === 0) return `Farm #${i + 1} crops are required.`;
    }
    return null;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setInfo('');

    const payload = {
      farmerId: form.farmerId,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password || '',
      confirmPassword: form.confirmPassword || '',
      language: form.language || 'malayalam',
      crops: cropList,
      experience: Number(form.experience) || 0,
      farmSize: form.farmSize || '',
      state: form.state || 'Kerala',
      district: form.district || '',
      farms: (form.farms || []).map(f => ({
        name: String(f.name || '').trim(),
        acres: String(f.acres || '').trim(),
        location: String(f.location || '').trim(),
        crops: String(f.crops || '').split(',').map(c => c.trim()).filter(Boolean)
      })),
      createdAt: new Date().toISOString()
    };

    const v = validate(payload);
    if (v) { setError(v); return; }

    try {
      const farmerPayload = {
        email: payload.email,
        password: payload.password,
        displayName: payload.name,
        name: payload.name,
        phone: payload.phone,
        language: payload.language,
        experience: payload.experience,
        farmSize: payload.farmSize,
        state: payload.state,
        district: payload.district,
        farms: payload.farms,
        crops: payload.crops
      };

      const res = await fetch(`${getBackendUrl()}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(farmerPayload)
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('ammachi_profile', JSON.stringify({
          email: data.user.email,
          displayName: data.user.displayName,
          id: data.user.id,
          ...payload
        }));
        localStorage.setItem('ammachi_session', JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          name: data.user.displayName
        }));

        setInfo('Account created successfully! You are now signed in.');
        navigateToDashboard();
        return;
      }

      const errorData = await res.json();
      console.warn('Auth register failed', res.status, errorData);
      setError(errorData.error || 'Registration failed. Please try again.');
    } catch (err) {
      console.error('Registration failed', err);
      setError('Failed to create account. Please check your connection and try again.');
    }
  }

  return (
    <section className="auth-shell">
      <VideoBackground />
      <div className="auth-container">
        <a href="#/" className="back-home" aria-label="Back to home">← Back to Home</a>

        <div className="auth-card">
          <div className="auth-card-inner">
            <h2 className="auth-title">Farmer Sign Up</h2>
            <p className="auth-note">Create your account to access the dashboard. All fields are required.</p>

            {error && <div className="auth-error" role="alert">{error}</div>}
            {info && (
              <div style={{
                background: 'rgba(45, 90, 71, 0.06)',
                padding: 10,
                borderRadius: 8,
                color: '#2d5a47',
                marginBottom: 12,
                border: '2px solid rgba(45, 90, 71, 0.2)'
              }}>
                {info}
              </div>
            )}

            <form className="auth-form" onSubmit={onSubmit} noValidate>
              <div className="field-row">
                <label className="auth-label">
                  <span className="label-text">Name</span>
                  <input className="auth-input" name="name" value={form.name} onChange={onChange} placeholder="Enter your name here" />
                </label>
                <label className="auth-label">
                  <span className="label-text">Email</span>
                  <input className="auth-input" type="email" name="email" value={form.email} onChange={onChange} placeholder="xyz@gmail.com" />
                </label>
              </div>

              <div className="field-row">
                <label className="auth-label">
                  <span className="label-text">Phone</span>
                  <input className="auth-input" name="phone" value={form.phone} onChange={onChange} placeholder="Enter your mobile number here"/>
                </label>
                <label className="auth-label">
                  <span className="label-text">Language</span>
                  <select className="auth-input" name="language" value={form.language} onChange={onChange}>
                    <option value="malayalam">Malayalam</option>
                    <option value="english">English</option>
                  </select>
                </label>
              </div>

              <div className="field-row">
                <label className="auth-label">
                  <span className="label-text">Password</span>
                  <input className="auth-input" type="password" name="password" value={form.password} onChange={onChange} placeholder="Minimum 8 characters"/>
                </label>
                <label className="auth-label">
                  <span className="label-text">Confirm Password</span>
                  <input className="auth-input" type="password" name="confirmPassword" value={form.confirmPassword} onChange={onChange} placeholder='Re-enter the same password'/>
                </label>
              </div>

              <div className="field-row">
                <label className="auth-label">
                  <span className="label-text">Experience (years)</span>
                  <input className="auth-input" type="number" name="experience" min="0" value={form.experience} onChange={onChange} />
                </label>
                <label className="auth-label">
                  <span className="label-text">Number of farms</span>
                  <input className="auth-input" type="number" name="numFarms" min="1" value={form.numFarms} onChange={onChange} />
                </label>
              </div>

              {/* State + District in the same row */}
              <div className="field-row">
                <label className="auth-label">
                  <span className="label-text">State</span>
                  <select className="auth-input" name="state" value={form.state} onChange={onChange}>
                    <option value="Kerala">Kerala</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label className="auth-label">
                  <span className="label-text">District</span>
                  <input className="auth-input" name="district" value={form.district} onChange={onChange} placeholder='Enter your district name here'/>
                </label>
              </div>

              <div style={{ marginTop: 8 }}>
               
                {form.farms.map((f, idx) => (
                  <div key={idx} className="field-row farm-row" style={{ marginBottom: 8 }}>
                    <label className="auth-label">
                      <span className="label-text">Farm Name</span>
                      <input className="auth-input" value={f.name} onChange={(e) => onFarmChange(idx, 'name', e.target.value)} placeholder='Name of your farm' />
                    </label>
                    <label className="auth-label">
                      <span className="label-text">Farm Area</span>
                      <input className="auth-input" value={f.acres} onChange={(e) => onFarmChange(idx, 'acres', e.target.value)} placeholder='Number of acres'/>
                    </label>
                    <label className="auth-label">
                      <span className="label-text">Farm Location</span>
                      <input className="auth-input" value={f.location} onChange={(e) => onFarmChange(idx, 'location', e.target.value)} placeholder='Location of your farm'/>
                    </label>
                    <label className="auth-label">
                      <span className="label-text">Crops</span>
                      <input
                        className="auth-input "
                        value={f.crops || ''}
                        onChange={(e) => onFarmChange(idx, 'crops', e.target.value)}
                        placeholder="rice, coconut, etc."
                      />
                    </label>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 2 }}>
                <button className="btn-submit" type="submit">Create Account</button>
                <a className="btn-outline" href="#/login">Back to Sign In</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}