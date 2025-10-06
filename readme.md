<h1 align="center">Ammachi AI - Smart Farming Assistant</h1>
<p align="center"><em>Empowering farmers with AI-driven agricultural solutions for a sustainable future</em></p>

<p align="center">
  <a href="https://github.com/Siddhantshukla1657/ammachi_ai">
    <img src="https://img.shields.io/badge/Smart-Irrigation-green?style=for-the-badge" alt="Smart Irrigation" />
  </a>
  <a href="https://github.com/Siddhantshukla1657/ammachi_ai">
    <img src="https://img.shields.io/badge/Disease-Detection-orange?style=for-the-badge" alt="Disease Detection" />
  </a>
  <a href="https://github.com/Siddhantshukla1657/ammachi_ai">
    <img src="https://img.shields.io/badge/Weather-Analytics-blue?style=for-the-badge" alt="Weather Analytics" />
  </a>
  <a href="https://github.com/Siddhantshukla1657/ammachi_ai">
    <img src="https://img.shields.io/badge/SIH-2025-red?style=for-the-badge" alt="SIH 2025" />
  </a>
</p>

  <img align="center" alt="Ammachi AI Screenshot" src="https://github.com/user-attachments/assets/85033329-6ff0-40f2-85ee-361aa0cb7058" />

---

## Overview
**Ammachi AI** is an innovative agricultural technology platform developed for **Smart India Hackathon (SIH) 2025**. Our solution combines **artificial intelligence, APIs, and data analytics** to revolutionize farming practices, helping farmers make informed decisions for better crop yields and sustainable agriculture.  

---

## Problem Statement
Traditional farming in Kerala often lacks precision and real-time insights. Farmers struggle with:
- Inefficient water usage and irrigation scheduling
- Late detection of crop diseases in coconut, pepper, and cardamom
- Poor weather-related decision making
- Reduced agricultural productivity
- Barriers due to English-only digital tools

---

## Our Solution
Ammachi AI provides:  
- **💬Bilingual Chatbot** – Farmers interact in **Malayalam + English**.
- **🌿AI-Powered Disease Detection** – Instant analysis of crop images with farmer-friendly remedies.
- **☀️Weather Intelligence** – Hyperlocal forecasts with actionable advice.
- **📈Market Trends** – Clear price insights from **AGMARKNET**.
- **📋Farmer Dashboard** – Stores disease history, weather updates, and mandi trends in **MongoDB Atlas**.
- **🌴Localized Optimization** – Currently focused on **Kerala crops (coconut, pepper, cardamom)** for maximum accuracy.

---

## Key Features

### 🌱 Smart Agriculture Tools
- Real-time crop monitoring and health assessment  
- Automated irrigation recommendations based on environment  
- **Plant.id Disease Detection API** for accurate crop health analysis  
- **Dialogflow AI Chatbot** for bilingual farmer interaction  
- **Weather API Forecasts** for hyperlocal planning  
- **AGMARKNET Market Prices** for smart selling  

### 📊 Analytics Dashboard
- Historical tracking of crop diseases and treatments  
- Weather and market insights at a glance  
- Personalized farmer profiles  
- Clear visualizations instead of raw numbers  

### ✨ User-Friendly Interface
- Mobile-first **React PWA**  
- **Multi-language support** (Malayalam + English, scalable to other Indian languages)  
- **Offline readiness** for rural areas with poor connectivity  

---

## 🌐 API & External Integrations

- **Dialogflow API** – Natural language chatbot for bilingual conversations. Farmers can ask questions in Malayalam/English and get AI-powered replies.  
- **Plant.id API** – Identifies plant species and detects diseases (~94% accuracy) from leaf images. Returns treatment suggestions in simple language.  
- **OpenWeatherMap API** – Provides 7-day hyperlocal forecasts (rain, humidity, temperature) to plan irrigation, spraying, and harvesting.  
- **AGMARKNET API** – Fetches mandi market data from 3,500+ markets, simplified into farmer-friendly trend insights.  
- **Firebase Authentication** – Manages secure user login and access to personalized dashboards.  

---

## 🛠️ Technology Stack

### Frontend
- **React 19.1.1** – Modern UI framework  
- **Vite 7.1.0** – Fast build tool  
- **i18next** – Multi-language support  
- **CSS3 / JavaScript ES6+** – Styling + logic  

### Backend
- **Node.js + Express.js** – Core backend server  
- **REST APIs** – Connecting frontend with services  
- **dotenv** – Secure `.env` API key management  

### Database
- **MongoDB Atlas** – Secure cloud database  
- **Mongoose** – Schema-based modeling  

---

## Project Structure

```
AMMACHI_AI/
│── backend/               # Node.js + Express API
│   ├── config/            # DB & server config
│   ├── controllers/       # Route controllers (auth, disease, weather, market)
│   ├── models/            # Mongoose schemas (Farmer, CropDiary, MarketPrice)
│   ├── routes/            # Express routes
│   ├── services/          # External API integrations
│   └── index.js           # Backend entry point

│── frontend/              # React PWA (JSX only)
│   ├── public/images/     # Static assets (logo, backgrounds)
│   ├── src/components/    # Reusable UI (Navbar, Sidebar, ChatBox, etc.)
│   ├── src/pages/         # Screens (Home, Dashboard, Chat, Detect, Weather, Market, Community, Profile)
│   ├── src/context/       # Auth & global state
│   ├── src/utils/         # API helper functions
│   ├── App.jsx            # Main React app
│   └── main.jsx           # Entry point

│── docs/                  # Setup & API references
│── readme.md
│── package.json
│── .gitignore             
```

---

## Use Cases

### Small-Scale Farmers
- Diagnose crop diseases instantly  
- Get local weather alerts in Malayalam  
- Check mandi price trends before selling  

### Agricultural Enterprises
- Manage multiple farmer dashboards  
- Track disease outbreaks across farms  

### Researchers & NGOs
- Collect real-time farming data  
- Analyze language adoption in tech  

---

## Roadmap

- Phase 1: Dialogflow chatbot + Plant.id + Weather + Market APIs  
- Phase 2: Add IoT sensors, community features, mobile app  
- Phase 3: National scale with Hindi, Marathi, Tamil, Kannada versions  

---

## 🏆 Achievements
- Selected for **Smart India Hackathon 2025** internal Hackathon(Team Catalyst)  
- Built a working **bilingual farming AI assistant**  
- Integrated **four key APIs** (Dialogflow, Plant.id, OpenWeatherMap, AGMARKNET)  
- Secured backend with **Firebase Auth + .env**  

---

<div align="center">
 
**"🌾Empowering agriculture through technology, one farm at a time🌾"**  

</div>
