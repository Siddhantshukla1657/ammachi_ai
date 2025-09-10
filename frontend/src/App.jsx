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
import MobileNav from './components/MobileNav.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';

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
    default:
      page = <Landing />; break;
  }

  return (
    <LanguageProvider>
      {page}
      {route !== '/' && <MobileNav />}
    </LanguageProvider>
  );
}
