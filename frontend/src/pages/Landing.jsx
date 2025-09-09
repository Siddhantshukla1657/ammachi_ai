import React from 'react';
import './landing.css';

const bgUrl =
  'https://cdn.builder.io/api/v1/image/assets%2Fc21b63e7074b4525a6e3164505c4a230%2Ffcc6827670244419818678eb20abc5a5?format=webp&width=1600';
const logoUrl =
  'https://cdn.builder.io/api/v1/image/assets%2Fc21b63e7074b4525a6e3164505c4a230%2Fac56160c2de4493283652bdd34caa4b0?format=webp&width=300';

export default function Landing() {
  return (
    <main className="hero-section" aria-label="Ammachi AI landing">
      <div className="hero-background" aria-hidden="true" />
      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-content">
        <img src={logoUrl} alt="Ammachi logo" className="brand-emblem" />
        <h1 className="hero-title">
          Welcome to <span className="accent">Ammachi AI</span>
        </h1>
        <p className="hero-subtitle">Your Farming Assistant</p>
        <p className="hero-description">
          Smart, simple, and supportive tools for every farmer.
        </p>

        <div className="cta-row">
          <a className="btn btn-primary" href="#/login" aria-label="Login">
            <span className="btn-icon" aria-hidden>
              ↪
            </span>
            <span>Login</span>
          </a>
          <a className="btn btn-outline" href="#/signup" aria-label="Sign Up">
            <span className="btn-icon" aria-hidden>
              ✚
            </span>
            <span>Sign Up</span>
          </a>
        </div>

        {/* ✅ New feature strip goes here */}
        <div className="features-strip">
          <div className="feature">
            🌱 <div><strong>Disease Detection</strong><br/>Instant crop diagnosis</div>
          </div>
          <div className="feature">
            ☀️ <div><strong>Weather Alerts</strong><br/>7-day forecasts</div>
          </div>
          <div className="feature">
            💰 <div><strong>Market Prices</strong><br/>Live crop rates</div>
          </div>
          <div className="feature">
            🤖 <div><strong>AI Assistant</strong><br/>24/7 farming help</div>
          </div>
        </div>
        {/* ✅ End of feature strip */}

        <footer className="hero-footer">
          © 2025 Ammachi AI. Built for the heart of farming.
        </footer>
      </div>
      <img
        className="hero-image"
        src={bgUrl}
        alt="Green crops in a field"
      />
    </main>
  );
}
