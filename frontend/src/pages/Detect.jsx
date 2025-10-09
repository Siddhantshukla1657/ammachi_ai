import React, { useState } from 'react';
import './detect.css';
import Sidebar from '../components/Sidebar.jsx';
import TranslatedText from '../components/TranslatedText';
import { useLanguage } from '../context/LanguageContext';
import { translate } from '../utils/translate';
import { getBackendUrl } from '../auth'; // Import the backend URL function

export default function Detect(){
  // Get current language from context
  const { language } = useLanguage();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [remedies, setRemedies] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGettingRemedies, setIsGettingRemedies] = useState(false);
  const [error, setError] = useState(null);

  function onChoose(e){
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(f.type)) {
      setError(<TranslatedText text="Please upload a valid image file (JPG, PNG)" />);
      return;
    }
    
    // Validate file size (max 5MB)
    if (f.size > 5 * 1024 * 1024) {
      setError(<TranslatedText text="File size must be less than 5MB" />);
      return;
    }
    
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setRemedies(null);
    setError(null);
  }

  function onDrop(e){
    e.preventDefault();
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!f) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(f.type)) {
      setError('Please upload a valid image file (JPG, PNG)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (f.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setRemedies(null);
    setError(null);
  }

  function onDragOver(e){ e.preventDefault(); }
  
  function onDragEnter(e){ e.preventDefault(); }
  function onDragLeave(e){ e.preventDefault(); }

  async function analyzeDisease(){
    if (!file) return;
    
    setIsProcessing(true);
    setResult(null);
    setRemedies(null);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // Use proper backend URL for API calls
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/disease/detect`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`${translate('Detection failed')}: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process Plant.id response with enhanced information
      if (data.result) {
        const plantInfo = data.result.plant_identification;
        
        if (!data.result.is_healthy && data.result.disease && data.result.disease.suggestions && data.result.disease.suggestions.length > 0) {
          // Disease detected
          const topDisease = data.result.disease.suggestions[0];
          const resultData = {
            diseaseName: topDisease.name,
            probability: Math.round(topDisease.probability * 100),
            description: topDisease.description || translate('No description available'),
            treatment: topDisease.treatment || {},
            isHealthy: false,
            healthStatus: data.result.health_status,
            plantInfo: plantInfo ? {
              scientificName: plantInfo.scientific_name,
              commonNames: plantInfo.common_names,
              primaryCommonName: plantInfo.common_names && plantInfo.common_names.length > 0 ? plantInfo.common_names[0] : plantInfo.scientific_name,
              identificationProbability: Math.round(plantInfo.probability * 100)
            } : null
          };
          
          setResult(resultData);
          
          // Save crop health data to backend
          await saveCropHealthData(resultData);
          
          // Get remedies from Dialogflow
          await getRemedies(topDisease.name);
        } else {
          // Plant is healthy
          const resultData = {
            isHealthy: true,
            healthStatus: data.result.health_status,
            message: translate('Your crop appears to be healthy! No diseases detected.'),
            plantInfo: plantInfo ? {
              scientificName: plantInfo.scientific_name,
              commonNames: plantInfo.common_names,
              primaryCommonName: plantInfo.common_names && plantInfo.common_names.length > 0 ? plantInfo.common_names[0] : plantInfo.scientific_name,
              identificationProbability: Math.round(plantInfo.probability * 100)
            } : null
          };
          
          setResult(resultData);
          
          // Save crop health data to backend
          await saveCropHealthData(resultData);
        }
      } else {
        const resultData = {
          isHealthy: true,
          message: translate('No diseases detected. Your crop appears to be healthy!'),
          probability: 0
        };
        
        setResult(resultData);
        
        // Save crop health data to backend
        await saveCropHealthData(resultData);
      }
    } catch (error) {
      console.error('Disease detection error:', error);
      setError(<TranslatedText text="Failed to analyze the image. Please try again with a clearer photo." />);
    } finally {
      setIsProcessing(false);
    }
  }
  
  // Function to save crop health data to backend
  async function saveCropHealthData(resultData) {
    try {
      // Get user profile from localStorage
      const profile = (() => {
        try { return JSON.parse(localStorage.getItem('ammachi_profile') || '{}'); } catch { return {}; }
      })();
      
      const session = (() => {
        try { return JSON.parse(localStorage.getItem('ammachi_session') || '{}'); } catch { return {}; }
      })();
      
      // Get user ID and farm info
      const userId = session.userId || profile._id || profile.id;
      const farmName = profile.farmName || profile.farms?.[0]?.name || 'Default Farm';
      const crop = resultData.plantInfo?.primaryCommonName || resultData.plantInfo?.scientificName || 'Unknown Crop';
      
      if (!userId) {
        console.warn('No user ID found, cannot save crop health data');
        return;
      }
      
      // Prepare data for saving with more detailed plant information
      const cropHealthData = {
        farmerId: userId,
        farmName: farmName,
        crop: crop,
        diseaseDetected: resultData.isHealthy ? 'Healthy' : resultData.diseaseName,
        severity: resultData.isHealthy ? 'none' : (resultData.probability > 80 ? 'severe' : resultData.probability > 60 ? 'moderate' : 'mild'),
        treatmentSuggested: resultData.treatment?.suggested || resultData.treatment || 'No specific treatment suggested',
        // Include plant identification details
        plantScientificName: resultData.plantInfo?.scientificName || '',
        plantCommonNames: resultData.plantInfo?.commonNames || [],
        plantIdentificationProbability: resultData.plantInfo?.identificationProbability || 0,
        // Include health assessment details
        healthAssessment: resultData.healthStatus || 'Not assessed',
        detectionConfidence: resultData.probability || resultData.plantInfo?.identificationProbability || 0
      };
      
      console.log('Saving detailed crop health data:', cropHealthData);
      
      // Use proper backend URL for API calls
      const backendUrl = getBackendUrl();
      
      // Save to backend
      const saveResponse = await fetch(`${backendUrl}/api/farmers/crop-health`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cropHealthData)
      });
      
      if (saveResponse.ok) {
        console.log('Crop health data saved successfully');
      } else {
        console.error('Failed to save crop health data:', saveResponse.status);
      }
    } catch (error) {
      console.error('Error saving crop health data:', error);
    }
  }
  
  async function getRemedies(diseaseName) {
    setIsGettingRemedies(true);
    try {
      // Use proper backend URL for API calls
      const backendUrl = getBackendUrl();
      
      const response = await fetch(`${backendUrl}/api/chatbot/remedies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          disease: diseaseName,
          query: `What are the treatment and prevention methods for ${diseaseName}?`
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setRemedies(data.response || translate('No specific remedies found. Please consult with an agricultural expert.'));
      }
    } catch (error) {
      console.error('Remedies fetch error:', error);
      setRemedies(translate('Unable to fetch remedies at the moment. Please consult with an agricultural expert.'));
    } finally {
      setIsGettingRemedies(false);
    }
  }

  function resetDetection() {
    setPreview(null);
    setFile(null);
    setResult(null);
    setRemedies(null);
    setError(null);
  }

  return (
    <div className="detect-layout">
      <Sidebar />
      <main className="detect-main page-scroll">
        <div className="detect-container" style={{ marginLeft: '20px', marginRight: '20px' }}>
          <header className="detect-header">
            <h1 className="detect-title"><TranslatedText text="Disease Detection" /></h1>
            <p className="detect-sub"><TranslatedText text="Upload a photo of your crop to detect diseases" /> 🔬</p>
          </header>

          {error && (
            <div className="error-card card">
              <div className="error-icon">⚠️</div>
              <div className="error-message">{error}</div>
              <button className="error-close" onClick={() => setError(null)}>×</button>
            </div>
          )}

          <div className="upload-card card" 
               onDrop={onDrop} 
               onDragOver={onDragOver}
               onDragEnter={onDragEnter}
               onDragLeave={onDragLeave}>
            <div className="upload-inner">
              <div className="upload-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19Z" stroke="#2fb46a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8.5 14L11 16.5L16.5 9.5" stroke="#2fb46a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3><TranslatedText text="Upload Crop Photo" /></h3>
              <p className="upload-note"><TranslatedText text="Drag and drop your image here, or click to browse" /></p>

              <div className="upload-actions">
                <label className="choose-btn">
                  📁 Choose File
                  <input type="file" accept="image/*" onChange={onChoose} />
                </label>
                <button className="camera-btn" onClick={() => alert('Camera capture will be available in the mobile app')}>
                  📷 Camera
                </button>
              </div>

              <div className="formats">Supported formats: JPG, PNG • Max size: 5MB</div>
            </div>
          </div>

          {preview && (
            <div className="preview-section card">
              <div className="preview-image-container">
                <img src={preview} alt="Crop preview" className="preview-img" />
                <div className="preview-overlay">
                  <button className="preview-remove" onClick={resetDetection} title="Remove image">×</button>
                </div>
              </div>
              <div className="preview-info">
                <h4>Ready for Analysis</h4>
                <p>Click "Analyze Photo" to detect diseases in your crop image</p>
                <div className="preview-actions">
                  <button className="btn-outline" onClick={resetDetection}>Remove</button>
                  <button 
                    className="btn-submit" 
                    onClick={analyzeDisease} 
                    disabled={isProcessing || !file}
                  >
                    {isProcessing ? (
                      <>
                        <span className="spinner"></span>
                        Analyzing...
                      </>
                    ) : (
                      <>🔍 Analyze Photo</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="result-card card">
              <div className="result-header">
                <h3>
                  {result.isHealthy ? (
                    <>✅ Healthy Plant</>    
                  ) : (
                    <>🦠 Disease Detected</>
                  )}
                </h3>
                {(result.probability || result.plantInfo?.identificationProbability) && (
                  <div className="confidence-badge">
                    {result.probability || result.plantInfo?.identificationProbability}% confidence
                  </div>
                )}
              </div>
              
              {/* Plant Identification Section */}
              {result.plantInfo && (
                <div className="plant-identification">
                  <h4>🌱 Plant Identification</h4>
                  <div className="plant-details">
                    {result.plantInfo.primaryCommonName && (
                      <div className="result-item primary-name">
                        <strong>Common Name:</strong> <span className="primary-common-name">{result.plantInfo.primaryCommonName}</span>
                      </div>
                    )}
                    <div className="result-item">
                      <strong>Scientific Name:</strong> <em>{result.plantInfo.scientificName}</em>
                    </div>
                    {result.plantInfo.commonNames && result.plantInfo.commonNames.length > 1 && (
                      <div className="result-item">
                        <strong>Other Common Names:</strong> {result.plantInfo.commonNames.slice(1).join(', ')}
                      </div>
                    )}
                    <div className="result-item">
                      <strong>Identification Confidence:</strong> {result.plantInfo.identificationProbability}%
                    </div>
                  </div>
                </div>
              )}
              
              {/* Health Status Section */}
              <div className="health-status">
                <h4>🏥 Health Assessment</h4>
                <div className={`health-indicator ${result.isHealthy ? 'healthy' : 'diseased'}`}>
                  {result.healthStatus || (result.isHealthy ? 'Plant appears healthy' : 'Disease detected')}
                </div>
              </div>
              
              {result.isHealthy ? (
                <div className="healthy-result">
                  <div className="result-message success">
                    {result.message}
                  </div>
                  <div className="tips-section">
                    <h4>🌱 Tips to Keep Your Plant Healthy:</h4>
                    <ul>
                      <li>Regular monitoring for early signs of disease</li>
                      <li>Proper watering and drainage</li>
                      <li>Adequate spacing between plants</li>
                      <li>Use of organic fertilizers</li>
                      <li>Maintain proper air circulation</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="disease-result">
                  <div className="disease-details">
                    <h4>🦠 Disease Information</h4>
                    <div className="result-item">
                      <strong>Disease:</strong> {result.diseaseName}
                    </div>
                    <div className="result-item">
                      <strong>Detection Confidence:</strong> {result.probability}%
                    </div>
                    {result.description && (
                      <div className="result-item">
                        <strong>Description:</strong> {result.description}
                      </div>
                    )}
                  </div>
                  
                  {isGettingRemedies && (
                    <div className="remedies-loading">
                      <span className="spinner"></span>
                      Getting treatment recommendations...
                    </div>
                  )}
                  
                  {remedies && (
                    <div className="remedies-section">
                      <h4>💊 Recommended Treatment:</h4>
                      <div className="remedies-content">
                        {remedies}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="result-disclaimer">
                <strong>⚠️ Disclaimer:</strong> This is an AI-based detection system. For accurate diagnosis and treatment, please consult with a qualified agricultural expert or plant pathologist.
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
