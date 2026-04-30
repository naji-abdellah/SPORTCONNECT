import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sessionService, matchService, performanceService } from '../services/api';
import './Dashboard.css';

const MOCK_MATCHES = [
  { id: 1, name: 'Youssef A.', sport: 'Football', level: 'Intermediate', city: 'Casablanca', score: 96, avatar: 'Y', color: '#3C9EFF' },
  { id: 2, name: 'Sara M.', sport: 'Tennis', level: 'Advanced', city: 'Casablanca', score: 89, avatar: 'S', color: '#E8FF3C' },
  { id: 3, name: 'Omar K.', sport: 'Basketball', level: 'Intermediate', city: 'Sale', score: 82, avatar: 'O', color: '#FF3C3C' },
];

const SPORT_ICON = { Football: '⚽', Basketball: '🏀', Tennis: '🎾', Running: '🏃', Boxing: '🥊', Swimming: '🏊' };

export default function Dashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState([
    { label: 'Sessions Done', value: 0, icon: 'diamond', delta: 'New account' },
    { label: 'Training Hours', value: '0H', icon: 'circle', delta: 'New account' },
    { label: 'Partners Met', value: 0, icon: 'target', delta: 'New account' },
    { label: 'Match Score', value: '0%', icon: 'half', delta: 'New account' },
  ]);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    // 1. Fetch upcoming sessions
    sessionService.getSessions().catch(() => null).then(res => {
      if (res?.data?.length) setSessions(res.data.slice(0, 3));
    });

    // 2. Fetch partner suggestions
    matchService.getMatches().then(res => {
      if (res?.data?.matches) {
        setMatches(res.data.matches);
        // Calculate match score average if we have matches
        const avgScore = res.data.matches.length > 0 
          ? Math.round(res.data.matches.reduce((s, m) => s + (m.score || 0), 0) / res.data.matches.length)
          : 0;
        
        setStats(prev => prev.map(s => {
          if (s.label === 'Match Score') return { ...s, value: `${avgScore}%`, delta: avgScore > 80 ? 'Top 10%' : 'Keep going!' };
          if (s.label === 'Partners Met') return { ...s, value: res.data.matches.filter(m => m.status === 'accepted').length || 0, delta: 'Verified' };
          return s;
        }));
      }
    }).catch(() => setMatches([]));

    // 3. Fetch performance stats
    performanceService.getStats().then(res => {
      if (res?.data) {
        const { totalSessions, totalDuration } = res.data;
        const hours = Math.round((totalDuration || 0) / 60);
        setStats(prev => prev.map(s => {
          if (s.label === 'Sessions Done') return { ...s, value: totalSessions || 0, delta: totalSessions > 0 ? 'Active' : 'Start now' };
          if (s.label === 'Training Hours') return { ...s, value: `${hours}H`, delta: hours > 10 ? 'Pro' : 'Consistent' };
          return s;
        }));
      }
    }).catch(err => console.error("Failed to load stats", err));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dashboard">
      <div className="dash__header">
        <div className="fade-up-1">
          <p className="dash__greeting">{greeting()},</p>
          <h1 className="dash__name">{user?.displayName || user?.name || 'Athlete'} <span className="accent">↗</span></h1>
        </div>
        <div className="dash__actions fade-up-2">
          <Link to="/sessions" className="btn-primary-sm">+ New Session</Link>
          <Link to="/partners" className="btn-outline-sm">Find Partners</Link>
        </div>
      </div>

      <div className="dash__stats fade-up-2">
        {stats.map((s, i) => (
          <div key={i} className="dash__stat">
            <div className="dash__stat-icon">{s.icon}</div>
            <div className="dash__stat-value">{s.value}</div>
            <div className="dash__stat-label">{s.label}</div>
            <div className="dash__stat-delta">{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="dash__tabs fade-up-3">
        {['overview', 'sessions', 'matches'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={"dash__tab " + (tab === t ? "active" : "")}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {(tab === 'overview' || tab === 'sessions') && (
        <div className="dash__section fade-up-3">
          <div className="dash__section-head">
            <h2>Upcoming Sessions</h2>
            <Link to="/sessions" className="dash__see-all">See all →</Link>
          </div>
          <div className="dash__sessions">
            {sessions.length === 0 && <p style={{color:'#888'}}>No sessions yet. <Link to="/sessions">Browse sessions →</Link></p>}
            {sessions.map(s => <SessionCard key={s._id} session={s} />)}
          </div>
        </div>
      )}

      {(tab === 'overview' || tab === 'matches') && (
        <div className="dash__section fade-up-4">
          <div className="dash__section-head">
            <h2>Partner Suggestions</h2>
            <Link to="/partners" className="dash__see-all">See all →</Link>
          </div>
          <div className="dash__matches">
            {matches.length > 0 ? (
              matches.map(m => <MatchCard key={m.id} match={m} />)
            ) : (
              MOCK_MATCHES.map(m => <MatchCard key={m.id} match={m} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SessionCard({ session }) {
  const total = session.maxParticipants || 10;
  const spots = total - (session.participants?.length || 0);
  const emoji = SPORT_ICON[session.sport_name] || '🏅';
  return (
    <div className="session-card">
      <div className="session-card__sport">{emoji}</div>
      <div className="session-card__info">
        <h3 className="session-card__title">{session.title}</h3>
        <div className="session-card__meta">
          <span>📍 {session.location || session.city || ''}</span>
          <span>🕐 {session.date} {session.time}</span>
          <span className="badge-level">{session.level || session.sport_name}</span>
        </div>
      </div>
      <div className="session-card__right">
        <div className="session-card__spots">
          <span className="spots-num">{spots}</span>
          <span className="spots-label">spots</span>
        </div>
        <Link to="/sessions" className="btn-join" style={{textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center'}}>Join</Link>
      </div>
    </div>
  );
}

function MatchCard({ match }) {
  return (
    <div className="match-card">
      <div className="match-card__avatar" style={{ background: match.color }}>
        {match.avatar}
      </div>
      <div className="match-card__info">
        <h3 className="match-card__name">{match.name}</h3>
        <div className="match-card__meta">
          {match.sport} · {match.level} · {match.city}
        </div>
      </div>
      <div className="match-card__score-wrap">
        <div className="match-card__score">{match.score}%</div>
        <div className="match-card__score-label">Match</div>
      </div>
      <Link to="/partners" className="btn-connect" style={{textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center'}}>Connect</Link>
    </div>
  );
}
