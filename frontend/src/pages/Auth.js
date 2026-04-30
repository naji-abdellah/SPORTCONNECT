import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="WELCOME BACK" sub="Login to your SportConnect account">
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="auth-error">{error}</div>}
        <div className="field">
          <label>Email</label>
          <input type="email" placeholder="athlete@mail.com" required
            value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" placeholder="••••••••" required
            value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
        </div>
        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Login'}
        </button>
        <p className="auth-switch">
          No account? <Link to="/register">Create one free →</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

const SPORTS_LIST = ['Football', 'Basketball', 'Tennis', 'Swimming', 'Running', 'Cycling', 'Volleyball', 'Boxing', 'Weightlifting', 'Hockey', 'Other'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Pro'];

export function Register() {
  const [form, setForm] = useState({
    displayName: '', email: '', password: '', localisation: '', sportPrefere: '', niveau: '', age: '', bio: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const finalLocalisation = form.localisation === 'Other' ? form.customCity : form.localisation;
      const finalSport = form.sportPrefere === 'Other' ? form.customSport : form.sportPrefere;
      await register({ ...form, localisation: finalLocalisation, sportPrefere: finalSport });
      navigate('/login');  // ← register doesn't return a token, go to login
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const set = (k, v) => setForm({...form, [k]: v});

  return (
    <AuthLayout title="JOIN THE TEAM" sub="Create your free SportConnect account">
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="auth-error">{error}</div>}
        <div className="field-row">
          <div className="field">
            <label>Full Name</label>
            <input type="text" placeholder="Karim Benchekroun" required
              value={form.displayName} onChange={e => set('displayName', e.target.value)} />
          </div>
          <div className="field">
            <label>City</label>
            <select required value={form.localisation === 'Other' ? 'Other' : (['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Salé', 'Meknès'].includes(form.localisation) ? form.localisation : (form.localisation ? 'Other' : ''))} 
              onChange={e => {
                const val = e.target.value;
                if (val === 'Other') {
                  set('localisation', 'Other');
                } else {
                  set('localisation', val);
                }
              }}>
              <option value="">Select city</option>
              {['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Salé', 'Meknès'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="Other">Other...</option>
            </select>
            {form.localisation === 'Other' && (
              <input type="text" placeholder="Type your city" required
                value={form.customCity || ''} 
                onChange={e => set('customCity', e.target.value)}
                style={{marginTop: '0.5rem'}} autoFocus />
            )}
          </div>
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" placeholder="athlete@mail.com" required
            value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" placeholder="Min. 6 characters" required minLength={6}
            value={form.password} onChange={e => set('password', e.target.value)} />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Primary Sport</label>
            <select required value={form.sportPrefere === 'Other' ? 'Other' : (['Football', 'Basketball', 'Tennis', 'Swimming', 'Running', 'Cycling', 'Volleyball', 'Boxing', 'Weightlifting', 'Hockey'].includes(form.sportPrefere) ? form.sportPrefere : (form.sportPrefere ? 'Other' : ''))} 
              onChange={e => {
                const val = e.target.value;
                set('sportPrefere', val);
              }}>
              <option value="">Select sport</option>
              {['Football', 'Basketball', 'Tennis', 'Swimming', 'Running', 'Cycling', 'Volleyball', 'Boxing', 'Weightlifting', 'Hockey'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
              <option value="Other">Other...</option>
            </select>
            {form.sportPrefere === 'Other' && (
              <input type="text" placeholder="Type your sport" required
                value={form.customSport || ''} 
                onChange={e => set('customSport', e.target.value)}
                style={{marginTop: '0.5rem'}} autoFocus />
            )}
          </div>
          <div className="field">
            <label>Level</label>
            <select required value={form.niveau} onChange={e => set('niveau', e.target.value)}>
              <option value="">Select level</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Age</label>
            <input type="number" placeholder="e.g. 21" 
              value={form.age || ''} onChange={e => set('age', e.target.value)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.75rem', color: '#fff' }} />
          </div>
          <div className="field" style={{ flex: 2 }}>
            <label>Bio</label>
            <input type="text" placeholder="Short bio..." 
              value={form.bio || ''} onChange={e => set('bio', e.target.value)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.75rem', color: '#fff' }} />
          </div>
        </div>
        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Create Account'}
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login →</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

function AuthLayout({ title, sub, children }) {
  return (
    <div className="auth-layout">
      <div className="auth-bg">
        <div className="auth-bg__grid" />
        <div className="auth-bg__text">SC</div>
      </div>
      <div className="auth-panel fade-up">
        <Link to="/" className="auth-logo">
          <span className="logo-sc-sm-auth">SC</span>
          SportConnect
        </Link>
        <h1 className="auth-title">{title}</h1>
        <p className="auth-sub">{sub}</p>
        {children}
      </div>
    </div>
  );
}
