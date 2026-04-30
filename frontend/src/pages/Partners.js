import React, { useState, useEffect } from 'react';
import { matchService } from '../services/api';
import api from '../services/api';
import './Partners.css';

const MOCK_PARTNERS = [
  { id: 1, name: 'Youssef Alami', sport: 'Football', level: 'Intermediate', city: 'Casablanca', age: 24, score: 96, avatar: 'Y', color: '#3C9EFF', sessions: 48, bio: 'Passionate midfielder looking for weekly matches.' },
  { id: 2, name: 'Sara Mansouri', sport: 'Tennis', level: 'Advanced', city: 'Casablanca', age: 27, score: 89, avatar: 'S', color: '#E8FF3C', sessions: 72, bio: 'Ex-regional champion, now coaching + playing competitively.' },
  { id: 3, name: 'Omar Khalil', sport: 'Basketball', level: 'Intermediate', city: 'Sale', age: 21, score: 82, avatar: 'O', color: '#FF3C3C', sessions: 31, bio: 'Point guard seeking 3v3 and 5v5 pickup games.' },
  { id: 4, name: 'Leila Amrani', sport: 'Running', level: 'Advanced', city: 'Casablanca', age: 29, score: 91, avatar: 'L', color: '#3CCC6B', sessions: 120, bio: 'Half-marathon runner, training for full marathon in October.' },
  { id: 5, name: 'Hassan Moussaoui', sport: 'Boxing', level: 'Beginner', city: 'Casablanca', age: 23, score: 77, avatar: 'H', color: '#FF8C3C', sessions: 15, bio: 'New to boxing, training 3x/week at the gym, looking for sparring partner.' },
  { id: 6, name: 'Nadia Benali', sport: 'Swimming', level: 'Advanced', city: 'Casablanca', age: 26, score: 88, avatar: 'N', color: '#9B3CFF', sessions: 95, bio: 'Competitive swimmer. 100m freestyle specialist.' },
];

const SPORTS_F = ['All','Football','Basketball','Tennis','Running','Boxing','Swimming'];
const LEVELS_F = ['All','Beginner','Intermediate','Advanced','Pro'];
const COLORS = ['#3C9EFF','#E8FF3C','#FF3C3C','#3CCC6B','#FF8C3C','#9B3CFF','#FF3CA0','#3CFFE8'];

export default function Partners() {
  const [partners, setPartners] = useState([]);
  const [sport, setSport] = useState('All');
  const [level, setLevel] = useState('All');
  const [selected, setSelected] = useState(null);
  const [sentRequests, setSentRequests] = useState(() => {
    try {
      const uid = localStorage.getItem('sc_uid') || '';
      const saved = localStorage.getItem('sc_sent_requests_' + uid);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  useEffect(() => {
    api.get('/users').then(res => {
      const users = res && res.data && res.data.users;
      const currentUid = localStorage.getItem('sc_uid');
      if (users && users.length) {
        const realUsers = users
          .filter(u => u.uid !== currentUid)
          .map((u, i) => ({
            id: 'real_' + (u.uid || i),
            name: u.nom || 'Unknown Athlete',
            sport: u.sportPrefere || 'Football',
            level: u.niveau || 'Beginner',
            city: u.localisation || 'Casablanca',
            age: u.age || 22,
            score: Math.floor(70 + Math.random() * 25),
            avatar: (u.nom || 'U')[0].toUpperCase(),
            color: COLORS[i % COLORS.length],
            sessions: u.sessions || 0,
            bio: u.bio || 'SportConnect member.',
          }));
        setPartners(realUsers);
      } else {
        setPartners([]);
      }
    }).catch(() => {
      setPartners([]);
    });
  }, []);

  const filtered = partners.filter(p => {
    const ms = sport === 'All' || p.sport.includes(sport);
    const ml = level === 'All' || p.level === level;
    return ms && ml;
  });

  const handleSend = (partnerId, partnerName) => {
    const uid = localStorage.getItem("sc_uid") || "";
    const name = localStorage.getItem("sc_displayName") || "";
    api.post("/connections/send", { senderId: uid, senderName: name, receiverId: String(partnerId).replace('real_',''), receiverName: partnerName }).catch(() => {});
    setSentRequests(prev => {
      const updated = new Set([...prev, partnerId]);
      localStorage.setItem('sc_sent_requests_' + uid, JSON.stringify([...updated]));
      return updated;
    });
  };

  return (
    <div className="partners-page">
      <div className="partners__header fade-up-1">
        <div>
          <h1 className="partners__title">FIND YOUR<br /><span className="accent">PARTNER</span></h1>
          <p className="partners__sub">AI-matched athletes compatible with your sport, level, and location</p>
        </div>
      </div>
      <div className="partners__filters fade-up-2">
        <div className="filter-pills">
          {SPORTS_F.map(s => (
            <button key={s} onClick={() => setSport(s)}
              className={"filter-pill" + (sport === s ? " active" : "")}>{s}</button>
          ))}
        </div>
        <div className="filter-pills">
          {LEVELS_F.map(l => (
            <button key={l} onClick={() => setLevel(l)}
              className={"filter-pill" + (level === l ? " active" : "")}>{l}</button>
          ))}
        </div>
      </div>
      <div className="partners__grid fade-up-3">
        {filtered.map(p => (
          <PartnerCard key={p.id} partner={p} onClick={() => setSelected(p)} />
        ))}
      </div>
      {selected && (
        <PartnerModal
          partner={selected}
          onClose={() => setSelected(null)}
          sent={sentRequests.has(selected.id)}
          onSend={() => handleSend(selected.id, selected.name)}
        />
      )}
    </div>
  );
}

function PartnerCard({ partner: p, onClick }) {
  return (
    <div className="partner-card" onClick={onClick}>
      <div className="partner-card__score-ring">
        <svg viewBox="0 0 60 60" className="score-svg">
          <circle cx="30" cy="30" r="25" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
          <circle cx="30" cy="30" r="25" fill="none" stroke="#E8FF3C" strokeWidth="4"
            strokeDasharray={(p.score / 100) * 157 + " 157"}
            strokeLinecap="round"
            transform="rotate(-90 30 30)" />
        </svg>
        <div className="score-center">{p.score}</div>
      </div>
      <div className="partner-card__avatar" style={{ background: p.color }}>{p.avatar}</div>
      <h3 className="partner-card__name">{p.name}</h3>
      <div className="partner-card__sport">{p.sport}</div>
      <div className="partner-card__meta">
        <span>{p.level}</span>
        <span> - </span>
        <span>{p.city}</span>
      </div>
      <div className="partner-card__sessions">{p.sessions} sessions logged</div>
      <button className="btn-connect-card">Connect</button>
    </div>
  );
}

function PartnerModal({ partner: p, onClose, sent, onSend }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal partner-modal" onClick={e => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} style={{marginLeft:"auto",display:"block",marginBottom:"1rem"}}>X</button>
        <div className="pm__head">
          <div className="pm__avatar" style={{ background: p.color }}>{p.avatar}</div>
          <div>
            <h2 className="pm__name">{p.name}</h2>
            <div className="pm__sport">{p.sport}</div>
          </div>
          <div className="pm__score-badge">{p.score}% match</div>
        </div>
        <p className="pm__bio">{p.bio}</p>
        <div className="pm__stats">
          <div className="pm__stat"><span>{p.level}</span><label>Level</label></div>
          <div className="pm__stat"><span>{p.city}</span><label>City</label></div>
          <div className="pm__stat"><span>{p.sessions}</span><label>Sessions</label></div>
          <div className="pm__stat"><span>{p.age}</span><label>Age</label></div>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", alignItems: "stretch" }}>
          <button style={{ flex: 1, height: "52px", backgroundColor: sent ? "#a0b800" : "#E8FF3C", color: "#000", border: "none", fontWeight: "700", fontSize: "0.75rem", letterSpacing: "0.1em", cursor: sent ? "default" : "pointer", borderRadius: "8px" }} onClick={onSend} disabled={sent}>
            {sent ? "Request Sent" : "Send Request"}
          </button>
          <button style={{ flex: 1, height: "52px", backgroundColor: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontWeight: "700", fontSize: "0.75rem", letterSpacing: "0.1em", cursor: "pointer", borderRadius: "8px" }} onClick={onClose}>Maybe Later</button>
        </div>
      </div>
    </div>
  );
}










