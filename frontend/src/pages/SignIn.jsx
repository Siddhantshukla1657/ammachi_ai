import React, { useState, useEffect } from 'react';
import './auth.css';
import { auth, googleProvider, db } from '../auth.js';
import { signInWithPopup, signInWithRedirect, getRedirectResult, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import VideoBackground from '../components/VideoBackground.jsx';

function findLocalProfile(identifier) {
  try {
    const list = JSON.parse(localStorage.getItem('local_farmers') || '[]');
    return (
      list.find(
        (p) =>
          p.email === identifier ||
          p.phone === identifier ||
          p.farmerId === identifier
      ) || null
    );
  } catch {
    return null;
  }
}

export default function SignIn() {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [idToken, setIdToken] = useState('');

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear messages when user types
    setError('');
    setInfo('');
  }

  // Function removed as part of forgot password removal

  useEffect(() => {
    let mounted = true;

    async function handleRedirect() {
      try {
        const result = await getRedirectResult(auth);
        if (!result || !result.user) return;

        const user = result.user;
        const email = user.email;

        // 1) Try Firestore
        try {
          const col = collection(db, 'farmers');
          const q = query(col, where('email', '==', email));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const data = snap.docs[0].data();
            localStorage.setItem('ammachi_profile', JSON.stringify(data));
            localStorage.setItem(
              'ammachi_session',
              JSON.stringify({ id: data.farmerId, name: data.name })
            );
            try {
              window.location.hash = '#/dashboard';
              window.dispatchEvent(new HashChangeEvent('hashchange'));
            } catch {}
            return;
          }
        } catch (e) {
          console.warn(
            'Firestore query failed on redirect result, falling back to local storage',
            e
          );
        }

        // 2) Try local profile
        const local = findLocalProfile(email);
        if (local) {
          localStorage.setItem('ammachi_profile', JSON.stringify(local));
          localStorage.setItem(
            'ammachi_session',
            JSON.stringify({ id: local.farmerId, name: local.name })
          );
          try {
            window.location.hash = '#/dashboard';
            window.dispatchEvent(new HashChangeEvent('hashchange'));
          } catch {}
          return;
        }

        // 3) Prefill and go to signup
        localStorage.setItem(
          'ammachi_oauth_prefill',
          JSON.stringify({ name: user.displayName || '', email: user.email || '' })
        );
        window.location.hash = '#/signup';
      } catch (err) {
        console.error('Redirect result error', err);
        if (mounted) setError('Could not complete Google sign-in after redirect.');
      }
    }

    handleRedirect();
    return () => {
      mounted = false;
    };
  }, []);

  function onSubmit(e) {
    e.preventDefault();
    if (isProcessing) return;
    setError('');
    setInfo('');

    if (!form.identifier || !form.password) {
      setError('Please enter your email or phone and password.');
      return;
    }

    setIsProcessing(true);
    // Ensure the identifier is properly formatted as an email
    let identifier = form.identifier.trim();
    
    // Simple email validation
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    
    if (!isEmail) {
      setError('Please enter a valid email address.');
      setIsProcessing(false);
      return;
    }
    
    // Use Firebase authentication directly
    signInWithEmailAndPassword(auth, identifier, form.password)
      .then(userCredential => {
        // Get the ID token
        return userCredential.user.getIdToken(true);
      })
      .then(idToken => {
        // Store the token for later use
        setIdToken(idToken);
        
        // Send the ID token to the backend for verification
        return fetch('/api/auth/verify-token', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          }
        });
      })
      .then(res => {
        if (res.ok) {
          return res.json().then(data => {
            // Store user data
            localStorage.setItem('authToken', idToken);
            localStorage.setItem('ammachi_profile', JSON.stringify({
              email: data.user.email,
              displayName: data.user.displayName,
              id: data.user.id,
              firebaseUid: data.user.firebaseUid
            }));
            localStorage.setItem('ammachi_session', JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              name: data.user.displayName
            }));
            
            try {
              window.location.hash = '#/dashboard';
              window.dispatchEvent(new HashChangeEvent('hashchange'));
            } catch {}
          });
        } else {
          return res.json().then(errorData => {
            console.warn('Auth verification failed', res.status, errorData);
            setError(errorData.error || 'Failed to verify your credentials.');
          });
        }
      })
      .catch(err => {
        console.error('Login failed', err);
        if (err.code === 'auth/user-not-found') {
          setError('No account found with this email address.');
          setInfo('Would you like to sign up?');
        } else if (err.code === 'auth/wrong-password') {
          setError('Incorrect password. Please try again.');
        } else if (err.code === 'auth/too-many-requests') {
          setError('Too many failed login attempts. Please try again later.');
        } else {
          setError('Failed to sign in. Please check your credentials and try again.');
        }
      })
      .finally(() => {
        setIsProcessing(false);
      });
  }

  function onGoogle(e) {
    e.preventDefault();
    if (isProcessing) return;

    setError('');
    setInfo('');
    setIsProcessing(true);

    signInWithPopup(auth, googleProvider)
      .then(result => {
        if (result && result.user) {
          // Get the ID token from the user
          return result.user.getIdToken(true).then(idToken => {
            // Store the token for later use
            setIdToken(idToken);
            
            // Send the ID token to the backend for verification
            return fetch('/api/auth/verify-token', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
              }
            }).then(res => {
              if (res.ok) {
                return res.json().then(data => {
                  // Store user data
                  localStorage.setItem('authToken', idToken);
                  localStorage.setItem('ammachi_profile', JSON.stringify({
                    email: data.user.email,
                    displayName: data.user.displayName,
                    id: data.user.id,
                    firebaseUid: data.user.firebaseUid
                  }));
                  localStorage.setItem('ammachi_session', JSON.stringify({
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.displayName
                  }));
                  
                  try {
                    window.location.hash = '#/dashboard';
                    window.dispatchEvent(new HashChangeEvent('hashchange'));
                  } catch {}
                  
                  return { user: result.user, data: data.user };
                });
              } else {
                return res.json().then(errorData => {
                  console.warn('Auth verification failed', res.status, errorData);
                  throw new Error(errorData.error || 'Failed to verify your credentials.');
                });
              }
            });
          });
        }
        throw new Error('No user found in Google sign-in result');
      })
      .then(result => {
        if (result && result.user && !result.data) {
          // Prefill → signup if no profile found
          localStorage.setItem(
            'ammachi_oauth_prefill',
            JSON.stringify({ name: result.user.displayName || '', email: result.user.email || '' })
          );
          window.location.hash = '#/signup';
        }
      })
      .catch(err => {
        console.error('Google sign-in error', err);
        if (err && err.code === 'auth/popup-blocked') {
          // Try redirect method instead
          signInWithRedirect(auth, googleProvider)
            .catch(redirErr => {
              console.error('Redirect fallback failed', redirErr);
              setError('Popup blocked. Please allow popups or try again.');
              setIsProcessing(false);
            });
          return; // Don't reset processing state yet as redirect is in progress
        } else if (err && err.code === 'auth/cancelled-popup-request') {
          setError('Popup request cancelled. Please try again and do not click multiple times.');
        } else {
          setError(err.message || 'Google sign-in failed. Please try again.');
        }
        setIsProcessing(false);
      })
  }

  return (
    <section className="auth-shell">
      <VideoBackground />
      <div className="auth-container">
        <a href="#/" className="back-home" aria-label="Back to home">
          ← Back to Home
        </a>

        <div className="auth-card">
        <div className="auth-card-inner">

          <h2 className="auth-title">Sign In</h2>
          <p className="auth-note">Use your registered email or phone to continue.</p>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}
          
          {info && (
            <div style={{ 
              background: 'rgba(45, 90, 71, 0.06)', 
              padding: 10, 
              borderRadius: 8, 
              color: '#2d5a47', 
              marginBottom: 12,
              border: '2px solid rgba(45, 90, 71, 0.2)'
            }} role="alert">
              {info}
            </div>
          )}

          <form className="auth-form" onSubmit={onSubmit} noValidate>
            <label className="auth-label">
              <span className="label-text">Email or Phone</span>
              <input
                className="auth-input"
                type="text"
                name="identifier"
                value={form.identifier}
                onChange={onChange}
                autoComplete="username"
                placeholder="xyz@gmai.com"
              />
            </label>

            <label className="auth-label">
              <span className="label-text">Password</span>
              <input
                className="auth-input"
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                autoComplete="current-password"
                placeholder="Minimum 8 characters"
              />
            </label>
            
            {/* Forgot password functionality removed */}
          <div className="auth-actions"> 
            <button className="btn-submit" type="submit" disabled={isProcessing}>
              {isProcessing ? 'Signing in...' : 'Login'}
            </button>
            <button
              className="btn-outline"
              onClick={onGoogle}
              aria-label="Sign in with Google"
              disabled={isProcessing}
            >
              {isProcessing ? 'Please wait...' : 'Continue with Google'}
            </button>
          </div>
          </form>

          <p className="auth-switch">
            New here? <a href="#/signup">Create an account</a>
          </p>
        </div>
      </div>
      </div>
    </section>
  );
}
