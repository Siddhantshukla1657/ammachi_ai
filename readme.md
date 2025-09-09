# 🌾 Ammachi AI - Smart Farming Assistant

> *Empowering farmers with AI-driven agricultural solutions for a sustainable future*

[![Smart Irrigation](https://img.shields.io/badge/Smart-Irrigation-green?style=for-the-badge)](https://github.com/Siddhantshukla1657/ammachi_ai)
[![Disease Detection](https://img.shields.io/badge/Disease-Detection-orange?style=for-the-badge)](https://github.com/Siddhantshukla1657/ammachi_ai)
[![Weather Analytics](https://img.shields.io/badge/Weather-Analytics-blue?style=for-the-badge)](https://github.com/Siddhantshukla1657/ammachi_ai)
[![SIH 2025](https://img.shields.io/badge/SIH-2025-red?style=for-the-badge)](https://github.com/Siddhantshukla1657/ammachi_ai)

## 🚀 Overview

**Ammachi AI** is an innovative agricultural technology platform developed for Smart India Hackathon (SIH) 2025. Our solution combines artificial intelligence, IoT sensors, and data analytics to revolutionize farming practices, helping farmers make informed decisions for better crop yields and sustainable agriculture.

### 🎯 Problem Statement
Traditional farming methods often lack precision and real-time insights, leading to:
- Inefficient water usage and irrigation scheduling
- Late detection of crop diseases
- Poor weather-related decision making
- Reduced agricultural productivity

### 💡 Our Solution
Ammachi AI provides:
- **Smart Irrigation Management** - Automated water scheduling based on soil moisture and weather data
- **AI-Powered Disease Detection** - Early identification of plant diseases using computer vision
- **Weather Intelligence** - Real-time weather monitoring and agricultural forecasts
- **Farmer Dashboard** - Intuitive interface for monitoring farm conditions

## ✨ Key Features

### 🌱 **Smart Agriculture Tools**
- Real-time crop monitoring and health assessment
- Automated irrigation scheduling based on environmental data
- Disease detection using advanced image recognition
- Weather-based farming recommendations

### 📊 **Analytics Dashboard**
- Comprehensive farm analytics and insights
- Historical data tracking and trend analysis
- Crop yield predictions and optimization suggestions
- Resource usage monitoring and efficiency metrics

### 🔧 **User-Friendly Interface**
- Intuitive web-based dashboard
- Mobile-responsive design for field access
- Multi-language support for diverse farming communities
- Offline capability for remote areas

### 🌐 **Integration Capabilities**
- IoT sensor integration for real-time data collection
- Weather API integration for accurate forecasts
- Plant disease identification using Plant.id API
- Scalable architecture for multiple farm management

## 🛠️ Technology Stack

### Frontend
- **React 19.1.1** - Modern UI framework for responsive interfaces
- **Vite 7.1.0** - Fast build tool and development server
- **CSS3** - Custom styling for beautiful user experience
- **JavaScript ES6+** - Modern JavaScript features

### Backend
- **Node.js** - Server-side JavaScript runtime
- **Express.js 5.1.0** - Web framework for API development
- **RESTful APIs** - Standard API architecture
- **Middleware Architecture** - Modular and scalable backend

### Database & Storage
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - Object modeling for MongoDB
- **Cloud Storage** - Image and data storage solutions

### External Integrations
- **Plant.id API** - Plant disease identification service
- **Weather APIs** - Real-time weather data
- **Firebase** - Authentication and real-time features
- **IoT Sensors** - Hardware integration for data collection

### Development Tools
- **ESLint** - Code quality and consistency
- **CORS** - Cross-origin resource sharing
- **Multer** - File upload handling
- **Environment Variables** - Secure configuration management

## 📁 Project Structure

```
ammachi_ai/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── App.jsx         # Main application component
│   │   └── main.jsx        # Application entry point
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
├── backend/                 # Node.js backend server
│   ├── controllers/        # Business logic controllers
│   ├── routes/             # API route definitions
│   ├── config/            # Configuration files
│   ├── models/            # Database models
│   ├── middleware/        # Custom middleware
│   ├── index.js           # Server entry point
│   └── package.json       # Backend dependencies
├── docs/                   # Project documentation
└── README.md              # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- MongoDB (local or cloud instance)
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Siddhantshukla1657/ammachi_ai.git
   cd ammachi_ai
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   Create `.env` files in both frontend and backend directories:
   
   **Backend `.env`:**
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   PLANT_ID_KEY=your_plant_id_api_key
   WEATHER_API_KEY=your_weather_api_key
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   ```

5. **Start the development servers**
   
   **Backend server:**
   ```bash
   cd backend
   npm start
   ```
   
   **Frontend development server:**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`
   - Health Check: `http://localhost:5000/api/health`

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Disease Detection
- `POST /api/disease/detect` - Upload plant image for disease detection
- `GET /api/disease/history` - Get detection history

### Farmer Management
- `GET /api/farmers/profile` - Get farmer profile
- `PUT /api/farmers/profile` - Update farmer information
- `GET /api/farmers/farms` - Get farm listings

## 🌟 Features in Detail

### Smart Irrigation System
- **Soil Moisture Monitoring**: Real-time soil condition tracking
- **Weather Integration**: Automatic irrigation scheduling based on weather forecasts
- **Water Usage Optimization**: Minimize water waste while maximizing crop health
- **Remote Control**: Mobile and web-based irrigation control

### Disease Detection Engine
- **Image Recognition**: Advanced AI for plant disease identification
- **Early Warning System**: Detect diseases before they spread
- **Treatment Recommendations**: Suggested treatments and preventive measures
- **Historical Tracking**: Monitor disease patterns over time

### Weather Intelligence
- **Hyper-local Forecasts**: Precise weather data for specific farm locations
- **Agricultural Alerts**: Weather-based farming recommendations
- **Seasonal Planning**: Long-term weather trend analysis
- **Risk Assessment**: Weather-related crop risk evaluation

## 🎯 Use Cases

### For Small-Scale Farmers
- Monitor individual field conditions
- Get personalized farming recommendations
- Access disease detection tools
- Optimize resource usage

### For Agricultural Enterprises
- Manage multiple farm locations
- Analyze productivity across different sites
- Implement data-driven farming strategies
- Scale operations efficiently

### For Agricultural Researchers
- Collect and analyze farming data
- Study crop patterns and disease trends
- Develop improved farming techniques
- Monitor environmental impact

## 🔮 Future Roadmap

### Phase 1 (Current)
- ✅ Basic disease detection
- ✅ Weather integration
- ✅ User authentication
- ✅ Farm management dashboard

### Phase 2 (Upcoming)
- 🔄 Advanced AI models for crop prediction
- 🔄 IoT sensor integration
- 🔄 Mobile application development
- 🔄 Multi-language support

### Phase 3 (Future)
- 📋 Marketplace integration for farming supplies
- 📋 Community features for farmer networking
- 📋 Advanced analytics and reporting
- 📋 AI-powered farming assistant chatbot

## 🤝 Contributing

We welcome contributions from the developer community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style and conventions
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Test Coverage
- Unit tests for core functionality
- Integration tests for API endpoints
- End-to-end tests for user workflows
- Performance tests for scalability

## 📱 Deployment

### Production Build
```bash
# Build frontend for production
cd frontend
npm run build

# Start production server
cd backend
npm run start:prod
```

### Environment Requirements
- Node.js production environment
- MongoDB database
- SSL certificate for HTTPS
- CDN for static assets (recommended)

## 🏆 Achievements

- **SIH 2025 Participant** - Selected for Smart India Hackathon 2025
- **Innovation in Agriculture** - AI-powered farming solutions
- **Sustainable Technology** - Environmental impact reduction
- **User-Centric Design** - Farmer-friendly interface

## 👥 Team

This project is developed by Team Catalyst for Smart India Hackathon 2025.

## 📞 Support

For support and questions:
- GitHub Issues: [Create an issue](https://github.com/Siddhantshukla1657/ammachi_ai/issues)
- Email: [Contact maintainers](mailto:support@ammachi-ai.com)
- Documentation: [Project Wiki](https://github.com/Siddhantshukla1657/ammachi_ai/wiki)

## 🙏 Acknowledgments

- **Smart India Hackathon 2025** for providing the platform
- **Plant.id** for disease detection API services
- **Weather API providers** for meteorological data
- **Open source community** for amazing tools and libraries
- **Agricultural experts** for domain knowledge and guidance

---

<div align="center">

**🌾 Built with ❤️ for farmers everywhere 🌾**

*"Empowering agriculture through technology, one farm at a time"*

</div>