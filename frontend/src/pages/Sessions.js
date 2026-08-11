import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sessionService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Sessions.css';

const SPORTS_FILTER = ['All', 'Football', 'Basketball', 'Tennis', 'Running', 'Boxing', 'Swimming'];
const LEVEL_FILTER = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Pro', 'All levels'];

const SPORT_EMOJI = { Football: '⚽', Basketball: '🏀', Tennis: '🎾', Running: '🏃', Boxing: '🥊', Swimming: '🏊' };

const MOCK_SESSIONS = [
  {
    _id: 'seed_1',
    title: 'Sunday Morning Football 5v5',
    sport_name: 'Football',
    location: 'Casablanca',
    date: '2026-08-15',
    time: '09:00',
    level: 'Intermediate',
    maxParticipants: 10,
    participants: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'],
    createdBy: 'seed_host_1',
    creatorName: 'Youssef Alami',
    desc: 'Friendly 5v5 match at City Foot. Bring turf shoes!'
  },
  {
    _id: 'seed_2',
    title: 'Sunrise Beach Run & Cardio',
    sport_name: 'Running',
    location: 'Rabat',
    date: '2026-08-16',
    time: '07:30',
    level: 'All levels',
    maxParticipants: 15,
    participants: ['u1', 'u2', 'u3', 'u4'],
    createdBy: 'seed_host_2',
    creatorName: 'Leila Amrani',
    desc: '10km coastal jog followed by core stretch.'
  },
  {
    _id: 'seed_3',
    title: 'Outdoor Tennis Singles / Doubles',
    sport_name: 'Tennis',
    location: 'Casablanca',
    date: '2026-08-17',
    time: '18:00',
    level: 'Advanced',
    maxParticipants: 4,
    participants: ['u1', 'u2'],
    createdBy: 'seed_host_3',
    creatorName: 'Sara Mansouri',
    desc: 'Looking for solid rally partners and competitive sets.'
  },
  {
    _id: 'seed_4',
    title: '3v3 Street Basketball Shootout',
    sport_name: 'Basketball',
    location: 'Marrakech',
    date: '2026-08-18',
    time: '19:00',
    level: 'Intermediate',
    maxParticipants: 6,
    participants: ['u1', 'u2', 'u3'],
    createdBy: 'seed_host_4',
    creatorName: 'Omar Khalil',
    desc: 'Fast-paced half-court basketball under the lights.'
  },
  {
    _id: 'seed_5',
    title: 'Beginners Sparring & Mitt Work',
    sport_name: 'Boxing',
    location: 'Tanger',
    date: '2026-08-19',
    time: '17:00',
    level: 'Beginner',
    maxParticipants: 8,
    participants: ['u1', 'u2', 'u3', 'u4', 'u5'],
    createdBy: 'seed_host_5',
    creatorName: 'Hassan Moussaoui',
    desc: 'Technical boxing workout, pad drills, and safe light sparring.'
  }
];

export default function Sessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState('All');
  const [level, setLevel] = useState('All');
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    sessionService.getSessions().then(res => {
      if (res?.data?.length) setSessions([...res.data, ...MOCK_SESSIONS]);
    }).catch(() => {});
  }, []);

  const filtered = sessions.filter(s => {
    const matchSearch = (s.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.location || '').toLowerCase().includes(search.toLowerCase());
    const matchSport = sport === 'All' || s.sport_name === sport;
    const matchLevel = level === 'All' || s.level === level;
    return matchSearch && matchSport && matchLevel;
  });

  return (
    <div className="sessions-page">
      <div className="sessions__header fade-up-1">
        <div>
          <h1 className="sessions__title">SESSIONS</h1>
          <p className="sessions__sub">Find and join training sessions near you</p>
        </div>
        {user && <button className="btn-primary-sm" onClick={() => setShowNew(true)}>+ Create Session</button>}
      </div>

      <div className="sessions__filters fade-up-2">
        <input className="search-input" placeholder="Search sessions or cities..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <div className="filter-pills">
          {SPORTS_FILTER.map(s => (
            <button key={s} onClick={() => setSport(s)}
              className={"filter-pill " + (sport === s ? "active" : "")}>{s}</button>
          ))}
        </div>
        <div className="filter-pills">
          {LEVEL_FILTER.map(l => (
            <button key={l} onClick={() => setLevel(l)}
              className={"filter-pill " + (level === l ? "active" : "")}>{l}</button>
          ))}
        </div>
      </div>

      <div className="sessions__count fade-up-2">
        <span className="accent">{filtered.length}</span> sessions found
      </div>

      <div className="sessions__grid fade-up-3">
        {filtered.map(s => <SessionDetailCard key={s._id} session={s} />)}
        {filtered.length === 0 && (
          <div className="sessions__empty">
            <div>No sessions match your filters.</div>
            <button className="btn-outline-sm" style={{marginTop:"1rem"}}
              onClick={() => { setSearch(''); setSport('All'); setLevel('All'); }}>
              Clear filters
            </button>
          </div>
        )}
      </div>

      {showNew && <NewSessionModal onClose={() => setShowNew(false)} onCreated={(s) => setSessions(prev => [s, ...prev])} />}
    </div>
  );
}

function SessionDetailCard({ session }) {
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const total = session.maxParticipants || 10;
  const spots = total - (session.participants?.length || 0);
  const pct = Math.round(((total - spots) / total) * 100);
  const myUid = localStorage.getItem('sc_uid');
  const isOwner = session.createdBy === myUid;
  const alreadyIn = session.participants?.includes(myUid);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this session?')) return;
    setCancelling(true);
    try {
      await sessionService.cancelSession(session._id, myUid);
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel');
    } finally { setCancelling(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this session permanently?')) return;
    setDeleting(true);
    try {
      await sessionService.deleteSession(session._id, myUid);
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    } finally { setDeleting(false); }
  };

  const handleJoin = async () => {
    setJoining(true);
    setError('');
    try {
      await sessionService.joinSession(session._id);
      setJoined(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join session');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="sdc">
      <div className="sdc__top">
        <span className="sdc__sport">{SPORT_EMOJI[session.sport_name] || '🏅'}</span>
        <span className={"sdc__spots-badge " + (spots <= 2 ? "urgent" : "")}>{spots} spots left</span>
      </div>
      <h3 className="sdc__title">{session.title}</h3>
      <div className="sdc__meta">
        <span>📌 {session.location}</span>
        <span>📅 {session.date}</span>
        <span>🕐 {session.time}</span>
        {session.level && <span>🎯 {session.level}</span>}
      </div>
      <div className="sdc__footer">
        <span className="sdc__creator">
          by {session.creatorName || (isOwner ? 'You' : session.createdBy?.slice(0, 8) + '...')}
        </span>
        <div className="sdc__progress">
          <div className="sdc__progress-bar" style={{ width: pct + "%" }} />
        </div>
        {error && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{error}</p>}
        <button className="btn-outline-sm" onClick={handleJoin}
          disabled={joining || joined || alreadyIn || spots === 0 || isOwner}>
          {isOwner ? 'Your Session' : alreadyIn ? 'Already Joined' : joined ? 'Joined ✔' : joining ? 'Joining...' : 'Join Session'}
        </button>
        {isOwner && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button className="btn-outline-sm" style={{ color: 'red', borderColor: 'red' }}
              onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete Session'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NewSessionModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '', sport_name: 'Football', date: '', time: '',
    location: '', level: 'Beginner', maxParticipants: 10, desc: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const createdBy = localStorage.getItem('sc_uid');
      const creatorName = localStorage.getItem('sc_displayName') || 'Unknown';
      const finalLocation = form.location === 'Other' ? form.customLocation : form.location;
      const finalSport = form.sport_name === 'Other' ? form.customSport : form.sport_name;
      const res = await sessionService.createSession({ ...form, location: finalLocation, sport_name: finalSport, createdBy, creatorName });
      onCreated(res.data.session || res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__head">
          <h2>Create New Session</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-form">
          <div className="field-row">
            <div className="field">
              <label>Title</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Sunday Football" />
            </div>
            <div className="field">
              <label>Sport</label>
              <select name="sport_name" value={form.sport_name === 'Other' ? 'Other' : (['Football', 'Basketball', 'Tennis', 'Running', 'Boxing', 'Swimming'].includes(form.sport_name) ? form.sport_name : (form.sport_name ? 'Other' : ''))} 
                onChange={e => {
                  const val = e.target.value;
                  setForm(f => ({ ...f, sport_name: val }));
                }}>
                <option value="">Select sport</option>
                {["Football","Basketball","Tennis","Running","Boxing","Swimming"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
                <option value="Other">Other...</option>
              </select>
              {form.sport_name === 'Other' && (
                <input name="customSport" value={form.customSport || ''} 
                  onChange={handleChange} placeholder="Type your sport" 
                  style={{marginTop: '0.5rem'}} autoFocus />
              )}
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Date</label>
              <input name="date" type="date" value={form.date} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Time</label>
              <input name="time" type="time" value={form.time} onChange={handleChange} />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Location</label>
              <select name="location" value={form.location === 'Other' ? 'Other' : (['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Salé', 'Meknès'].includes(form.location) ? form.location : (form.location ? 'Other' : ''))} 
                onChange={e => {
                  const val = e.target.value;
                  setForm(f => ({ ...f, location: val }));
                }}>
                <option value="">Select city</option>
                {['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Salé', 'Meknès'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="Other">Other...</option>
              </select>
              {form.location === 'Other' && (
                <input name="customLocation" value={form.customLocation || ''} 
                  onChange={handleChange} placeholder="Type your city" 
                  style={{marginTop: '0.5rem'}} autoFocus />
              )}
            </div>
            <div className="field">
              <label>Level</label>
              <select name="level" value={form.level} onChange={handleChange}>
                {["Beginner","Intermediate","Advanced","Pro","All levels"].map(l => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Max Participants</label>
            <input name="maxParticipants" type="number" min="2" max="50"
              value={form.maxParticipants} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea name="desc" value={form.desc} onChange={handleChange}
              placeholder="Describe your session..." />
          </div>
          {error && <p style={{ color: "var(--red)", fontSize: "0.85rem" }}>{error}</p>}
          <div className="modal-actions">
            <button className="btn-cancel" onClick={onClose}>Cancel</button>
            <button className="btn-create" onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating..." : "Create Session"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
