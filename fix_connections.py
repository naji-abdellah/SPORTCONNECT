# fix_connections.py
base = r"C:\Users\DELL\CAREER\GLD\S4\APPLICATION NATIVE CLOUD\sportconnect-docker"

# ─── 1. Fix Partners.js — strip "real_" prefix from partnerId ──────────
partners_path = base + r"\frontend\src\pages\Partners.js"
with open(partners_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "api.post(\"/connections/send\", { senderId: uid, senderName: name, receiverId: partnerId, receiverName: partnerName })",
    "api.post(\"/connections/send\", { senderId: uid, senderName: name, receiverId: String(partnerId).replace('real_',''), receiverName: partnerName })"
)

with open(partners_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Partners.js fixed!")

# ─── 2. Rewrite Connections.js with proper design ──────────────────────
with open(base + r"\frontend\src\pages\Connections.js", "w", encoding="ascii") as f:
    f.write("""import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Partners.css';

export default function Connections() {
  const uid = localStorage.getItem('sc_uid') || '';
  const [incoming, setIncoming] = useState([]);
  const [friends, setFriends] = useState([]);
  const [tab, setTab] = useState('requests');

  const load = () => {
    api.get('/connections/incoming/' + uid).then(r => setIncoming(r.data)).catch(() => {});
    api.get('/connections/friends/' + uid).then(r => setFriends(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const accept = (id) => api.patch('/connections/' + id + '/accept').then(load).catch(() => {});
  const decline = (id) => api.patch('/connections/' + id + '/decline').then(load).catch(() => {});

  const COLORS = ['#3C9EFF','#E8FF3C','#FF3C3C','#3CCC6B','#FF8C3C','#9B3CFF'];

  return (
    <div className="partners-page">
      <div className="partners__header fade-up-1">
        <div>
          <h1 className="partners__title">MY<br /><span className="accent">CONNECTIONS</span></h1>
          <p className="partners__sub">Manage your connection requests and friends</p>
        </div>
      </div>

      <div className="partners__filters fade-up-2">
        <div className="filter-pills">
          <button onClick={() => setTab('requests')}
            className={"filter-pill" + (tab === 'requests' ? " active" : "")}>
            Requests {incoming.length > 0 ? "(" + incoming.length + ")" : ""}
          </button>
          <button onClick={() => setTab('friends')}
            className={"filter-pill" + (tab === 'friends' ? " active" : "")}>
            Friends {friends.length > 0 ? "(" + friends.length + ")" : ""}
          </button>
        </div>
      </div>

      <div className="fade-up-3" style={{ padding: '0 2rem' }}>

        {tab === 'requests' && (
          <div>
            {incoming.length === 0 && (
              <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '2rem' }}>No pending requests.</p>
            )}
            {incoming.map((r, i) => (
              <div key={r._id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.05)', borderRadius: '16px',
                padding: '1.25rem 1.5rem', marginBottom: '1rem',
                border: '1px solid rgba(255,255,255,0.07)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: COLORS[i % COLORS.length],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#000', fontWeight: '800', fontSize: '1.2rem'
                  }}>
                    {r.senderName[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '1rem', color: '#fff' }}>{r.senderName}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>wants to connect with you</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => accept(r._id)} style={{
                    padding: '0.5rem 1.4rem', borderRadius: '8px', border: 'none',
                    cursor: 'pointer', background: '#E8FF3C', color: '#000', fontWeight: '700'
                  }}>Accept</button>
                  <button onClick={() => decline(r._id)} style={{
                    padding: '0.5rem 1.4rem', borderRadius: '8px', cursor: 'pointer',
                    background: 'transparent', color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)', fontWeight: '700'
                  }}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'friends' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
            {friends.length === 0 && (
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>No connections yet.</p>
            )}
            {friends.map((f, i) => (
              <div key={i} className="partner-card">
                <div className="partner-card__avatar" style={{ background: COLORS[i % COLORS.length] }}>
                  {f.name[0].toUpperCase()}
                </div>
                <h3 className="partner-card__name">{f.name}</h3>
                <div className="partner-card__sport">Connected</div>
                <div className="partner-card__sessions" style={{ color: '#E8FF3C' }}>Friend</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
""")

print("Connections.js redesigned!")