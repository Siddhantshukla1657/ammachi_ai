import React, { useState, useEffect } from 'react';
import './profile.css';
import { db } from '../auth.js';
import { doc, setDoc } from 'firebase/firestore';

import Sidebar from '../components/Sidebar.jsx';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const p = JSON.parse(localStorage.getItem('ammachi_profile') || 'null');
    setProfile(p);
    setForm(p ? { ...p } : null);
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function save() {
    setMsg('');
    if (!form) return;
    try {
      await setDoc(doc(db, 'farmers', form.farmerId), form);
      localStorage.setItem('ammachi_profile', JSON.stringify(form));
      setProfile(form);
      setEditing(false);
      setMsg('Saved to Firestore.');
    } catch (err) {
      console.warn('Failed to save to Firestore, saving locally', err);
      try {
        const list = JSON.parse(localStorage.getItem('local_farmers') || '[]');
        const idx = list.findIndex(x => x.farmerId === form.farmerId);
        if (idx >= 0) list[idx] = form; else list.push(form);
        localStorage.setItem('local_farmers', JSON.stringify(list));
        localStorage.setItem('ammachi_profile', JSON.stringify(form));
        setProfile(form);
        setEditing(false);
        setMsg('Saved locally.');
      } catch (e) {
        console.error('Local save failed', e);
        setMsg('Failed to save profile.');
      }
    }
  }

  if (!profile) return <div style={{ padding: 24 }}>No profile found. Please sign in.</div>;

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <Sidebar />
      <main className="profile-page" style={{ flex: 1 }}>
        <header className="profile-hero">
          <div className="profile-avatar">{profile.name ? profile.name[0] : 'A'}</div>
          <div>
            <h1 className="profile-name">{profile.name}</h1>
            <div className="profile-meta">{profile.farmerId} • {profile.location ? profile.location.district : profile.district}</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn-outline" onClick={() => { localStorage.removeItem('ammachi_profile'); localStorage.removeItem('ammachi_session'); window.location.hash = '#/login'; }}>Sign Out</button>
          </div>
        </header>

        <section className="profile-card">
          <h2>Personal Information</h2>
          {!editing ? (
            <div className="profile-grid">
              <div><strong>Full Name</strong><div>{profile.name}</div></div>
              <div><strong>Phone</strong><div>{profile.phone}</div></div>
              <div><strong>Experience (years)</strong><div>{profile.experience}</div></div>
              <div><strong>District</strong><div>{profile.location ? profile.location.district : profile.district}</div></div>
              <div><strong>Farms</strong><div>{(profile.farms || []).map((f,i) => (<div key={i} className="farm-item">{f.name} — {f.acres} acres {f.location ? `(${f.location})` : ''}</div>))}</div></div>
              <div style={{ gridColumn: '1/-1', marginTop: 12 }}>
                <button className="btn-submit" onClick={() => { setEditing(true); setForm({ ...profile }); }}>Edit Profile</button>
              </div>
            </div>
          ) : (
            <div>
              <div className="profile-grid">
                <label className="auth-label"><span className="label-text">Full Name</span><input className="auth-input" name="name" value={form.name || ''} onChange={onChange} /></label>
                <label className="auth-label"><span className="label-text">Phone</span><input className="auth-input" name="phone" value={form.phone || ''} onChange={onChange} /></label>
                <label className="auth-label"><span className="label-text">Experience</span><input className="auth-input" name="experience" value={form.experience || ''} onChange={onChange} /></label>
                <label className="auth-label"><span className="label-text">District</span><input className="auth-input" name="district" value={(form.location && form.location.district) || form.district || ''} onChange={(e)=>{
                  // keep location.district in sync
                  const v = e.target.value;
                  setForm(prev => ({ ...prev, location: { ...(prev.location||{}), district: v }, district: v }));
                }} /></label>
                <div style={{ gridColumn: '1/-1', marginTop: 8 }}>
                  <h4>Farms</h4>
                  {(form.farms || []).map((f, idx) => (
                    <div key={idx} className="field-row" style={{ marginBottom: 8 }}>
                      <input className="auth-input" placeholder="Farm name" value={f.name || ''} onChange={(e) => {
                        const farms = (form.farms || []).slice(); farms[idx] = { ...farms[idx], name: e.target.value }; setForm(prev => ({ ...prev, farms }));
                      }} />
                      <input className="auth-input" placeholder="Acres" value={f.acres || ''} onChange={(e) => {
                        const farms = (form.farms || []).slice(); farms[idx] = { ...farms[idx], acres: e.target.value }; setForm(prev => ({ ...prev, farms }));
                      }} />
                      <input className="auth-input" placeholder="Location" value={f.location || ''} onChange={(e) => {
                        const farms = (form.farms || []).slice(); farms[idx] = { ...farms[idx], location: e.target.value }; setForm(prev => ({ ...prev, farms }));
                      }} />
                    </div>
                  ))}
                </div>
                <div style={{ gridColumn: '1/-1', marginTop: 12 }}>
                  <button className="btn-submit" onClick={save}>Save Profile</button>
                  <button className="btn-outline" onClick={() => { setEditing(false); setForm({ ...profile }); }} style={{ marginLeft: 8 }}>Cancel</button>
                </div>
              </div>
            </div>
          )}
          {msg && <div style={{ marginTop: 12 }}>{msg}</div>}
        </section>
      </main>
    </div>
  );
}
