import React, { useState } from 'react';
import './detect.css';
import Sidebar from '../components/Sidebar.jsx';

export default function Detect(){
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  function onChoose(e){
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  }

  function onDrop(e){
    e.preventDefault();
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  }

  function onDragOver(e){ e.preventDefault(); }

  async function analyze(){
    if (!file) return;
    setIsProcessing(true);
    setResult(null);
    // mock detection - in real app you'd upload to backend/ML model
    await new Promise(r=>setTimeout(r, 900));
    setResult({ diagnosis: 'Leaf blast (suspected)', confidence: '86%' });
    setIsProcessing(false);
  }

  return (
    <div className="detect-layout">
      <Sidebar />
      <main className="detect-main page-scroll">
        <div className="detect-container">
          <header className="detect-header">
            <h1 className="detect-title">Disease Detection</h1>
            <p className="detect-sub">Upload a photo of your crop to detect diseases</p>
          </header>

          <div className="upload-card card" onDrop={onDrop} onDragOver={onDragOver}>
            <div className="upload-inner">
              <div className="upload-icon">📷</div>
              <h3>Upload Crop Photo</h3>
              <p className="upload-note">Drag and drop your image here, or click to browse</p>

              <div className="upload-actions">
                <label className="choose-btn">
                  Choose File
                  <input type="file" accept="image/*" onChange={onChoose} />
                </label>
                <button className="camera-btn" onClick={() => alert('Camera capture not available in this demo')}>Camera</button>
              </div>

              <div className="formats">Supported formats: JPG, PNG, PDF</div>
            </div>
          </div>

          {preview && (
            <div className="preview-section card">
              <img src={preview} alt="preview" className="preview-img" />
              <div className="preview-actions">
                <button className="btn-outline" onClick={() => { setPreview(null); setFile(null); setResult(null); }}>Remove</button>
                <button className="btn-submit" onClick={analyze} disabled={isProcessing || !file}>{isProcessing ? 'Analyzing...' : 'Analyze Photo'}</button>
              </div>
            </div>
          )}

          {result && (
            <div className="result-card card">
              <h3>Detection Result</h3>
              <div className="result-item"><strong>Diagnosis:</strong> {result.diagnosis}</div>
              <div className="result-item"><strong>Confidence:</strong> {result.confidence}</div>
              <div className="result-note">This is a demo result. For accurate diagnosis, consult an expert and upload clear photos of affected leaves.</div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
