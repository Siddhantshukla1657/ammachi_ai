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

  if (!profile) return <div className="no-profile">No profile found. Please sign in.</div>;

  return (
    <div className="profile-layout">
      <Sidebar />
      <main className="profile-main page-scroll">
        <div className="profile-container">
          <aside className="profile-side">
            <div className="profile-summary card">
              <div className="profile-avatar">{profile.name ? profile.name[0] : 'A'}</div>
              <h3 className="profile-name">{profile.name}</h3>
              <div className="profile-meta">{profile.email || profile.phone}</div>

              <div className="summary-actions">
                <button className="btn-submit" onClick={() => { setEditing(true); setForm({ ...profile }); }}>Edit Profile</button>
                <button className="btn-outline" onClick={() => { localStorage.removeItem('ammachi_profile'); localStorage.removeItem('ammachi_session'); window.location.hash = '#/login'; }} style={{ marginLeft: 8 }}>Sign Out</button>
              </div>
            </div>
          </aside>

          <section className="profile-details card">
            <h2>Personal Information</h2>

            {!editing ? (
              <div className="profile-grid">
                <div><strong>Full Name</strong><div>{profile.name}</div></div>
                <div><strong>Phone</strong><div>{profile.phone}</div></div>
                <div><strong>Experience (years)</strong><div>{profile.experience}</div></div>
                <div><strong>District</strong><div>{profile.location ? profile.location.district : profile.district}</div></div>
                <div className="full-row"><strong>Farms</strong>
                  <div>
                    {(profile.farms || []).map((f,i) => (<div key={i} className="farm-item">{f.name} — {f.acres} acres {f.location ? `(${f.location})` : ''}</div>))}
                  </div>
                </div>
              </div>
            ) : (
              <form className="profile-form" onSubmit={(e) => { e.preventDefault(); save(); }}>
                <div className="profile-grid">
                  <label className="auth-label"><span className="label-text">Full Name</span><input className="auth-input" name="name" value={form.name || ''} onChange={onChange} /></label>
                  <label className="auth-label"><span className="label-text">Phone</span><input className="auth-input" name="phone" value={form.phone || ''} onChange={onChange} /></label>
                  <label className="auth-label"><span className="label-text">Experience</span><input className="auth-input" name="experience" value={form.experience || ''} onChange={onChange} /></label>
                  <label className="auth-label"><span className="label-text">District</span><input className="auth-input" name="district" value={(form.location && form.location.district) || form.district || ''} onChange={(e)=>{
                    const v = e.target.value;
                    setForm(prev => ({ ...prev, location: { ...(prev.location||{}), district: v }, district: v }));
                  }} /></label>

                  <div className="full-row">
                    <h4>Farms</h4>
                    <div className="farms-list">
                      {(form.farms || []).map((f, idx) => (
                        <div key={idx} className="farm-row">
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
                  </div>

                  <div className="full-row actions">
                    <button type="submit" className="btn-submit">Save Profile</button>
                    <button type="button" className="btn-outline" onClick={() => { setEditing(false); setForm({ ...profile }); }}>Cancel</button>
                  </div>
                </div>
              </form>
            )}

            {msg && <div className="card-note">{msg}</div>}
          </section>
        </div>
      </main>
    </div>
  );
}
