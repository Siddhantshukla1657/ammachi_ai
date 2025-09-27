import React from 'react';
import './video-background.css';

const videoUrl = '/videos/Homepage_bg.mp4';

export default function VideoBackground() {
  return (
    <>
      <div className="hero-background" aria-hidden="true" />
      <div className="hero-overlay" aria-hidden="true" />
      <video 
        className="hero-video" 
        autoPlay 
        muted 
        loop 
        playsInline
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </>
  );
}