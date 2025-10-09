import React, { useEffect, useMemo, useState } from 'react';
import Landing from './pages/Landing.jsx';
import SignIn from './pages/SignIn.jsx';
import SignUp from './pages/SignUp.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import Market from './pages/Market.jsx';
import Weather from './pages/Weather.jsx';
import Detect from './pages/Detect.jsx';
import Chat from './pages/Chat.jsx';
import ApiTest from './pages/ApiTest.jsx';
import ApiTestPage from './pages/ApiTestPage.jsx'; // Import the new API test page
import FirebaseTest from './pages/FirebaseTest.jsx'; // Import the Firebase test component
import MobileNav from './components/MobileNav.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

function getRoute() {
  const h = window.location.hash.replace('#', '');
  if (h.startsWith('/login')) return '/login';
  if (h.startsWith('/signup')) return '/signup';
  if (h.startsWith('/dashboard')) return '/dashboard';
  if (h.startsWith('/chat')) return '/chat';
  if (h.startsWith('/market')) return '/market';
  if (h.startsWith('/weather')) return '/weather';
  if (h.startsWith('/detect')) return '/detect';
  if (h.startsWith('/profile')) return '/profile';
  if (h.startsWith('/api-test')) return '/api-test'; // Add API test route
  if (h.startsWith('/firebase-test')) return '/firebase-test'; // Add Firebase test route
  return '/';
}

export default function App() {
  const [route, setRoute] = useState(getRoute());

  useEffect(() => {
    const onChange = () => setRoute(getRoute());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const isAuthed = useMemo(() => {
    try { return Boolean(JSON.parse(localStorage.getItem('ammachi_session') || 'null')); } catch { return false; }
  }, [route]);

  if ((route === '/dashboard' || route === '/profile') && !isAuthed) {
    window.location.hash = '#/login';
    return null;
  }

  let page = null;
  switch (route) {
    case '/login':
      page = <SignIn />; break;
    case '/signup':
      page = <SignUp />; break;
    case '/dashboard':
      page = <Dashboard />; break;
    case '/market':
      page = <Market />; break;
    case '/weather':
      page = <Weather />; break;
    case '/detect':
      page = <Detect />; break;
    case '/chat':
      page = <Chat />; break;
    case '/profile':
      page = <Profile />; break;
    case '/api-test': // Add the API test route
      page = <ApiTestPage />; break;
    case '/firebase-test': // Add the Firebase test route
      page = <FirebaseTest />; break;

    default:
      page = <Landing />; break;
  }

  return (
    <LanguageProvider>
      <ErrorBoundary>
        {page}
        {route !== '/' && <MobileNav />}
      </ErrorBoundary>
    </LanguageProvider>
  );
}