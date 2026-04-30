import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Profile.css';

const PRESET_SPORTS = ['Football', 'Basketball', 'Tennis', 'Running', 'Boxing', 'Swimming', 'Cycling', 'Yoga'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Pro'];
const PRESET_CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Salé', 'Meknès'];

export default function Profile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [status,  setStatus]  = useState(null); // { type: 'success'|'error', msg }

  // Form fields
  const [nom,          setNom]          = useState('');
  const [sportPrefere, setSportPrefere] = useState('');
  const [customSport,  setCustomSport]  = useState('');
  const [niveau,       setNiveau]       = useState('Beginner');
  const [localisation, setLocalisation] = useState('');
  const [customCity,   setCustomCity]   = useState('');
  const [bio,          setBio]          = useState('');
  const [age,          setAge]          = useState('');

  const cityIsPreset = (city) => PRESET_CITIES.includes(city);
  const sportIsPreset = (sport) => PRESET_SPORTS.includes(sport);

  // Load profile from backend
  useEffect(() => {
    api.get('/users/me')
      .then(res => {
        const d = res.data;
        setProfile(d);
        setNom(d.nom || d.displayName || '');
        
        const sport = d.sportPrefere || d.sport || '';
        if (sportIsPreset(sport) || sport === '') {
          setSportPrefere(sport);
          setCustomSport('');
        } else {
          setSportPrefere('Other');
          setCustomSport(sport);
        }

        setNiveau(d.niveau || d.level || 'Beginner');

        const city = d.localisation || d.city || '';
        if (cityIsPreset(city) || city === '') {
          setLocalisation(city);
          setCustomCity('');
        } else {
          setLocalisation('Other');
          setCustomCity(city);
        }

        setBio(d.bio || '');
        setAge(d.age || '');
      })
      .catch(() => {
        setNom(localStorage.getItem('sc_displayName') || '');
      })
      .finally(() => setLoading(false));
  }, []);

  const resolvedCity = () => (localisation === 'Other' ? customCity.trim() : localisation);
  const resolvedSport = () => (sportPrefere === 'Other' ? customSport.trim() : sportPrefere);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!nom.trim()) { setStatus({ type: 'error', msg: 'Name is required.' }); return; }
    if (localisation === 'Other' && !customCity.trim()) { setStatus({ type: 'error', msg: 'Please type your city name.' }); return; }
    if (sportPrefere === 'Other' && !customSport.trim()) { setStatus({ type: 'error', msg: 'Please type your sport.' }); return; }

    setSaving(true);
    setStatus(null);
    try {
      await api.patch('/users/me', {
        nom:          nom.trim(),
        sportPrefere: resolvedSport() || 'Football',
        niveau:       niveau || 'Beginner',
        localisation: resolvedCity() || 'Casablanca',
        bio:          bio || '',
        age:          age ? Number(age) : null,
      });

      localStorage.setItem('sc_displayName', nom.trim());
      setStatus({ type: 'success', msg: 'Profile updated successfully!' });
      
      // Refresh internal profile state so Reset works with new values
      setProfile(prev => ({
        ...prev,
        nom: nom.trim(),
        sportPrefere: resolvedSport(),
        niveau: niveau,
        localisation: resolvedCity(),
        bio,
        age: Number(age)
      }));

    } catch (err) {
      setStatus({ type: 'error', msg: err?.response?.data?.error || 'Update failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!profile) return;
    setNom(profile.nom || '');
    const s = profile.sportPrefere || '';
    if (sportIsPreset(s) || s === '') { setSportPrefere(s); setCustomSport(''); }
    else { setSportPrefere('Other'); setCustomSport(s); }
    setNiveau(profile.niveau || 'Beginner');
    const c = profile.localisation || '';
    if (cityIsPreset(c) || c === '') { setLocalisation(c); setCustomCity(''); }
    else { setLocalisation('Other'); setCustomCity(c); }
    setBio(profile.bio || '');
    setAge(profile.age || '');
    setStatus(null);
  };

  const avatarLetter = (nom || localStorage.getItem('sc_displayName') || user?.displayName || 'U')[0].toUpperCase();
  const displayCity  = localisation === 'Other' ? (customCity || '—') : localisation;
  const displaySport = sportPrefere === 'Other' ? (customSport || '—') : sportPrefere;

  return (
    <div className="profile-page">
      <div className="profile__banner fade-up-1">
        <div className="profile__avatar-row">
          <div className="profile__avatar">{avatarLetter}</div>
          <div className="profile__name-block">
            <h1>{nom || 'Your Profile'} {age && <span className="profile__age-header">· {age}</span>}</h1>
            <div className="profile__email">{user?.email || profile?.email || ''}</div>
            {bio && <p className="profile__bio-header">{bio}</p>}
          </div>
        </div>
        {!loading && profile && (
          <div className="profile__meta-pills">
            {displaySport && <span className="profile__pill accent">{displaySport}</span>}
            {niveau && <span className="profile__pill">{niveau}</span>}
            {displayCity && <span className="profile__pill">📍 {displayCity}</span>}
          </div>
        )}
      </div>

      {loading ? (
        <div className="profile__card"><div className="profile__skeleton"><div className="skeleton-block" style={{height:150}}/></div></div>
      ) : (
        <div className="profile__card fade-up-2">
          <p className="profile__card-title">Edit Profile</p>
          <form className="profile__form" onSubmit={handleSave}>
            <div className="profile__row">
              <div className="profile__field">
                <label>Full Name</label>
                <input type="text" value={nom} onChange={e => setNom(e.target.value)} />
              </div>
              <div className="profile__field">
                <label>Age</label>
                <input type="number" value={age} onChange={e => setAge(e.target.value)} />
              </div>
            </div>

            <div className="profile__row">
              <div className="profile__field">
                <label>Favourite Sport</label>
                <select value={sportPrefere} onChange={e => { setSportPrefere(e.target.value); if(e.target.value !== 'Other') setCustomSport(''); }}>
                  <option value="">Select sport</option>
                  {PRESET_SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                  <option value="Other">Other...</option>
                </select>
                {sportPrefere === 'Other' && (
                  <input type="text" placeholder="Type your sport" value={customSport} onChange={e => setCustomSport(e.target.value)} style={{marginTop:'0.5rem'}} autoFocus />
                )}
              </div>
              <div className="profile__field">
                <label>Level</label>
                <select value={niveau} onChange={e => setNiveau(e.target.value)}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="profile__row">
              <div className="profile__field">
                <label>City</label>
                <select value={localisation} onChange={e => { setLocalisation(e.target.value); if(e.target.value !== 'Other') setCustomCity(''); }}>
                  <option value="">Select city</option>
                  {PRESET_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="Other">Other...</option>
                </select>
                {localisation === 'Other' && (
                  <input type="text" placeholder="Type your city" value={customCity} onChange={e => setCustomCity(e.target.value)} style={{marginTop:'0.5rem'}} autoFocus />
                )}
              </div>
              <div className="profile__field">
                <label>Bio</label>
                <input type="text" value={bio} onChange={e => setBio(e.target.value)} placeholder="Short bio..." />
              </div>
            </div>

            <div className="profile__actions">
              <button type="submit" className="btn-profile-save" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              <button type="button" className="btn-profile-cancel" onClick={handleReset}>Reset</button>
            </div>
            {status && <div className={`profile__status ${status.type}`}>{status.type === 'success' ? '✓' : '✕'} {status.msg}</div>}
          </form>
        </div>
      )}
    </div>
  );
}
