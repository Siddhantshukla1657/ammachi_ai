import React, { useEffect, useMemo, useState } from 'react';
import Landing from './pages/Landing.jsx';
import SignIn from './pages/SignIn.jsx';
import SignUp from './pages/SignUp.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';

function getRoute() {
  const h = window.location.hash.replace('#', '');
  if (h.startsWith('/login')) return '/login';
  if (h.startsWith('/signup')) return '/signup';
  if (h.startsWith('/dashboard')) return '/dashboard';
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

  switch (route) {
    case '/login':
      return <SignIn />;
    case '/signup':
      return <SignUp />;
    case '/dashboard':
      return <Dashboard />;
    case '/profile':
      return <Profile />;
    default:
      return <Landing />;
  }
}
