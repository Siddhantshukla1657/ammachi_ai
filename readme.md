# 🌾 Ammachi AI - Smart Farming Assistant

> *Empowering farmers with AI-driven agricultural solutions for a sustainable future*

[![Smart Irrigation](https://img.shields.io/badge/Smart-Irrigation-green?style=for-the-badge)](https://github.com/Siddhantshukla1657/ammachi_ai)  
[![Disease Detection](https://img.shields.io/badge/Disease-Detection-orange?style=for-the-badge)](https://github.com/Siddhantshukla1657/ammachi_ai)  
[![Weather Analytics](https://img.shields.io/badge/Weather-Analytics-blue?style=for-the-badge)](https://github.com/Siddhantshukla1657/ammachi_ai)  
[![SIH 2025](https://img.shields.io/badge/SIH-2025-red?style=for-the-badge)](https://github.com/Siddhantshukla1657/ammachi_ai)  

---

## 🚀 Overview
**Ammachi AI** is an innovative agricultural technology platform developed for **Smart India Hackathon (SIH) 2025**. Our solution combines **artificial intelligence, APIs, and data analytics** to revolutionize farming practices, helping farmers make informed decisions for better crop yields and sustainable agriculture.  

---

## 🎯 Problem Statement
Traditional farming methods often lack precision and real-time insights, leading to:  
- Inefficient water usage and irrigation scheduling  
- Late detection of crop diseases  
- Poor weather-related decision making  
- Reduced agricultural productivity  
- Barriers due to limited English-only digital tools  

---

## 💡 Our Solution
Ammachi AI provides:  
- **Bilingual Conversational Chatbot** – Farmers interact in **Malayalam + English** through **Dialogflow**.  
- **AI-Powered Disease Detection** – Upload a plant image, get instant analysis via **Plant.id API**, explained in farmer-friendly terms.  
- **Weather Intelligence** – Real-time weather monitoring and agricultural forecasts with **OpenWeatherMap API**.  
- **Market Price Trends** – Clear mandi trends from **AGMARKNET API** to guide selling decisions.  
- **Farmer Dashboard** – Securely stores disease history, weather updates, and price insights in **MongoDB Atlas**.  

---

## ✨ Key Features

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

### 🔧 User-Friendly Interface
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
- **Multer** – For image uploads  
- **dotenv** – Secure `.env` API key management  

### Database
- **MongoDB Atlas** – Secure cloud database  
- **Mongoose** – Schema-based modeling  

---

## 📁 Project Structure

```
ammachi_ai/
├── frontend/              # React PWA frontend
│   ├── src/components/    # UI Components
│   ├── src/pages/         # App pages
│   └── App.jsx            # Main frontend entry
├── backend/               # Node.js + Express backend
│   ├── controllers/       # Dialogflow, Plant.id, etc.
│   ├── routes/            # API route definitions
│   ├── config/            # Service account JSON + env
│   ├── models/            # Farmer profiles
│   ├── middleware/        # Middleware utilities
│   └── server.js          # Backend entry point
└── docs/                  # Documentation
```

---

## 📖 API Endpoints

### 🌿 Disease Detection (Plant.id)
- `POST /api/disease` – Upload a leaf image → returns disease analysis & remedies  

### 💬 Chatbot (Dialogflow)
- `POST /api/chat` – Send a message in Malayalam/English → AI reply  

### ☀️ Weather (OpenWeatherMap)
- `GET /api/weather?location=kochi` – Returns 7-day forecast  

### 📈 Market Prices (AGMARKNET)
- `GET /api/market?crop=rice` – Returns mandi price trends  

### 👩‍🌾 Farmer Profile
- `GET /api/farmers/profile` – Fetch profile  
- `PUT /api/farmers/profile` – Update details  

---

## 🌟 Use Cases

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

## 🔮 Roadmap

- ✅ Phase 1: Dialogflow chatbot + Plant.id + Weather + Market APIs  
- 🔄 Phase 2: Add IoT sensors, community features, mobile app  
- 🔮 Phase 3: National scale with Hindi, Marathi, Tamil, Kannada versions  

---

## 🏆 Achievements
- Selected for **Smart India Hackathon 2025** (Team Catalyst)  
- Built a working **bilingual farming AI assistant**  
- Integrated **four key APIs** (Dialogflow, Plant.id, OpenWeatherMap, AGMARKNET)  
- Secured backend with **Firebase Auth + .env**  

---

<div align="center">

**🌾 Built with ❤️ for farmers everywhere 🌾**  
*"Empowering agriculture through technology, one farm at a time"*  

</div>
