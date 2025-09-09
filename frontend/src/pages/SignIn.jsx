import React, { useState, useEffect } from 'react';
import './auth.css';
import { auth, googleProvider } from '../auth.js';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

function findLocalProfile(identifier) {
  try {
    const list = JSON.parse(localStorage.getItem('local_farmers') || '[]');
    return list.find(p => p.email === identifier || p.phone === identifier || p.farmerId === identifier) || null;
  } catch { return null; }
}

export default function SignIn() {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  function onChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  useEffect(() => {
    let mounted = true;
    async function handleRedirect() {
      try {
        const result = await getRedirectResult(auth);
        if (!result || !result.user) return;
        const user = result.user;
        const email = user.email;
        try {
          const col = collection(db, 'farmers');
          const q = query(col, where('email', '==', email));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const data = snap.docs[0].data();
            localStorage.setItem('ammachi_profile', JSON.stringify(data));
            localStorage.setItem('ammachi_session', JSON.stringify({ id: data.farmerId, name: data.name }));
            console.log('Redirect matched Firestore user', data.farmerId);
            try { window.location.hash = '#/dashboard'; window.dispatchEvent(new HashChangeEvent('hashchange')); } catch(e) {}
            return;
          }
        } catch (e) {
          console.warn('Firestore query failed on redirect result, falling back to local storage', e);
        }
        const local = findLocalProfile(email);
        if (local) {
          localStorage.setItem('ammachi_profile', JSON.stringify(local));
          localStorage.setItem('ammachi_session', JSON.stringify({ id: local.farmerId, name: local.name }));
          console.log('Redirect matched local user', local.farmerId);
          try { window.location.hash = '#/dashboard'; window.dispatchEvent(new HashChangeEvent('hashchange')); } catch(e) {}
          return;
        }
        localStorage.setItem('ammachi_oauth_prefill', JSON.stringify({ name: user.displayName || '', email: user.email || '' }));
        window.location.hash = '#/signup';
      } catch (err) {
        console.error('Redirect result error', err);
        if (mounted) setError('Could not complete Google sign-in after redirect.');
      }
    }
    handleRedirect();
    return () => { mounted = false; };
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    if (isProcessing) return;
    setError('');
    if (!form.identifier || !form.password) { setError('Please enter your email or phone and password.'); return; }
    setIsProcessing(true);

    try {
      // Call backend login
      const res = await fetch('/api/farmers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: form.identifier, password: form.password })
      });
      if (res.ok) {
        const data = await res.json();
        const profile = data.profile;
        localStorage.setItem('ammachi_profile', JSON.stringify(profile));
        localStorage.setItem('ammachi_session', JSON.stringify({ id: profile.farmerId || profile._id, name: profile.name }));
        try { window.location.hash = '#/dashboard'; window.dispatchEvent(new HashChangeEvent('hashchange')); } catch(e) {}
        return;
      }
      // fallback to local
      const local = findLocalProfile(form.identifier);
      if (local) {
        if (local.password && form.password !== local.password) { setError('Incorrect password.'); return; }
        localStorage.setItem('ammachi_profile', JSON.stringify(local));
        localStorage.setItem('ammachi_session', JSON.stringify({ id: local.farmerId, name: local.name }));
        try { window.location.hash = '#/dashboard'; window.dispatchEvent(new HashChangeEvent('hashchange')); } catch(e) {}
        return;
      }

      // Read response body once for debugging
      const text = await res.text();
      console.warn('Backend login failed', res.status, text);
      setError('No account found. Please sign up first.');
    } catch (err) {
      console.error(err);
      setError('Failed to sign in. Please try again later.');
    } finally {
      setIsProcessing(false);
    }
  }

  async function onGoogle(e) {
    e.preventDefault();
    if (isProcessing) return;
    setError('');
    setIsProcessing(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result && result.user) {
        const user = result.user;
        const email = user.email;
        try {
          const col = collection(db, 'farmers');
          const q = query(col, where('email', '==', email));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const data = snap.docs[0].data();
            localStorage.setItem('ammachi_profile', JSON.stringify(data));
            localStorage.setItem('ammachi_session', JSON.stringify({ id: data.farmerId, name: data.name }));
            console.log('Google sign-in matched Firestore user', data.farmerId);
            try { window.location.hash = '#/dashboard'; window.dispatchEvent(new HashChangeEvent('hashchange')); } catch(e) {}
            return;
          }
        } catch (e) {
          console.warn('Firestore query failed after Google popup, falling back to local storage', e);
        }
        const local = findLocalProfile(email);
        if (local) {
          localStorage.setItem('ammachi_profile', JSON.stringify(local));
          localStorage.setItem('ammachi_session', JSON.stringify({ id: local.farmerId, name: local.name }));
          console.log('Google sign-in matched local user', local.farmerId);
          try { window.location.hash = '#/dashboard'; window.dispatchEvent(new HashChangeEvent('hashchange')); } catch(e) {}
          return;
        }
        localStorage.setItem('ammachi_oauth_prefill', JSON.stringify({ name: user.displayName || '', email: user.email || '' }));
        window.location.hash = '#/signup';
      }
    } catch (err) {
      console.error('Google sign-in error', err);
      if (err && err.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirErr) {
          console.error('Redirect fallback failed', redirErr);
          setError('Popup blocked. Please allow popups or try again.');
        }
      } else if (err && err.code === 'auth/cancelled-popup-request') {
        setError('Popup request cancelled. Please try again and do not click multiple times.');
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <h2 className="auth-title">Sign In</h2>
        <p className="auth-note">Use your registered email or phone to continue.</p>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <label className="auth-label">
            <span className="label-text">Email or Phone</span>
            <input className="auth-input" type="text" name="identifier" value={form.identifier} onChange={onChange} autoComplete="username" />
          </label>
          <label className="auth-label">
            <span className="label-text">Password</span>
            <input className="auth-input" type="password" name="password" value={form.password} onChange={onChange} autoComplete="current-password" />
          </label>
          <button className="btn-submit" type="submit" disabled={isProcessing}>{isProcessing ? 'Signing in...' : 'Login'}</button>
        </form>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12 }}>
          <button className="btn-google" onClick={onGoogle} aria-label="Sign in with Google" disabled={isProcessing}>
            {isProcessing ? 'Please wait...' : 'Continue with Google'}
          </button>
        </div>

        <p className="auth-switch">New here? <a href="#/signup">Create an account</a></p>
      </div>
    </section>
  );
}
