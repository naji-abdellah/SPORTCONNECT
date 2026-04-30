import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="navbar__logo">
        <span className="logo-sc">SC</span>
        <span className="logo-text">SPORT<span className="accent">CONNECT</span></span>
      </Link>

      {user ? (
        <div className={`navbar__links ${menuOpen ? 'open' : ''}`}>
          <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link>
          <Link to="/sessions" className={location.pathname.startsWith('/sessions') ? 'active' : ''}>Sessions</Link>
          <Link to="/partners" className={location.pathname === '/partners' ? 'active' : ''}>Partners</Link>
          <Link to="/connections" className={location.pathname === '/connections' ? 'active' : ''}>Connections</Link>
          <Link to="/performance" className={location.pathname === '/performance' ? 'active' : ''}>Performance</Link>
          <div className="navbar__user">
            <Link to="/profile" className="navbar__avatar" title="Edit Profile">
              {(user.displayName || user.name || user.email || 'U')[0].toUpperCase()}
            </Link>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      ) : (
        <div className={`navbar__links ${menuOpen ? 'open' : ''}`}>
          <Link to="/login" className="btn-nav-outline">Login</Link>
          <Link to="/register" className="btn-nav-accent">Get Started</Link>
        </div>
      )}

      <button className="navbar__burger" onClick={() => setMenuOpen(!menuOpen)}>
        <span></span><span></span><span></span>
      </button>
    </nav>
  );
}
