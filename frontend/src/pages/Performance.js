import React, { useState, useEffect } from 'react';
import { performanceService } from '../services/api';
import './Performance.css';

export default function Performance() {
  const SPORT_ICONS = {
    Football: '⚽', Basketball: '🏀', Tennis: '🎾', Running: '🏃',
    Boxing: '🥊', Swimming: '🏊', Cycling: '🚴', Weightlifting: '🏋️'
  };

  const [activities, setActivities] = useState([]);
  const [showLog, setShowLog] = useState(false);
  const [form, setForm] = useState({ sport: '', name: '', date: '', duration: '', calories: '', intensity: '' });

  useEffect(() => {
    performanceService.getActivities().then(res => {
      if (Array.isArray(res?.data)) {
        // Map backend names back to emojis
        const mapped = res.data.map(a => ({
          ...a,
          sport: SPORT_ICONS[a.sport] || '◈',
          name: a.name || a.sport // Backend might not have 'name' field
        }));
        setActivities(mapped);
      } else {
        setActivities([]);
      }
    }).catch(() => {
      setActivities([]);
    });
  }, []);

  const totalHours = Math.round(activities.reduce((sum, act) => {
    const d = parseFloat(act.duration) || 0;
    return sum + d;
  }, 0) / 60 * 10) / 10;

  const totalCals = activities.reduce((sum, act) => {
    const c = parseFloat(act.calories) || 0;
    return sum + c;
  }, 0);

  const handleLog = async (e) => {
    e.preventDefault();
    const newActivity = {
      ...form,
      id: Date.now(),
      duration: parseInt(form.duration, 10) || 0,
      calories: parseFloat(form.calories) || 0,
      // We send the RAW NAME to backend, but keep the emoji in state for UI
      sport: form.sport 
    };

    try {
      await performanceService.logActivity(newActivity);
      // Update UI state with emoji version
      setActivities([{ ...newActivity, sport: SPORT_ICONS[form.sport] || '◈' }, ...activities]);
      setShowLog(false);
      setForm({ sport: '', name: '', date: '', duration: '', calories: '', intensity: '' });
    } catch (err) {
      console.error("Failed to save activity", err);
      alert("Failed to save activity. Please try again.");
    }
  };

  // Calculate dynamic weekly data
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyData = DAYS.map(day => {
    const dayActivities = activities.filter(a => {
      const d = new Date(a.date).getDay();
      const dayIdx = d === 0 ? 6 : d - 1; 
      return DAYS[dayIdx] === day;
    });
    const minutes = dayActivities.reduce((s, a) => s + (parseFloat(a.duration) || 0), 0);
    return { day, minutes };
  });

  const maxMinutes = Math.max(...weeklyData.map(d => d.minutes), 60);

  return (
    <div className="perf-page">
      <div className="perf__header fade-up-1">
        <div>
          <h1 className="perf__title">PERFORMANCE</h1>
          <p className="perf__sub">Track your training history and progress</p>
        </div>
        <button className="btn-primary-sm" onClick={() => setShowLog(true)}>+ Log Activity</button>
      </div>

      {/* Summary cards */}
      <div className="perf__summary fade-up-2">
        <div className="perf__sum-card">
          <div className="perf__sum-icon">◈</div>
          <div className="perf__sum-val">{activities.length}</div>
          <div className="perf__sum-label">Activities</div>
        </div>
        <div className="perf__sum-card">
          <div className="perf__sum-icon">⏱</div>
          <div className="perf__sum-val">{totalHours}h</div>
          <div className="perf__sum-label">Training Time</div>
        </div>
        <div className="perf__sum-card">
          <div className="perf__sum-icon">🔥</div>
          <div className="perf__sum-val">{totalCals.toLocaleString()}</div>
          <div className="perf__sum-label">Calories Burned</div>
        </div>
        <div className="perf__sum-card">
          <div className="perf__sum-icon">📈</div>
          <div className="perf__sum-val">+12%</div>
          <div className="perf__sum-label">vs Last Month</div>
        </div>
      </div>

      {/* Weekly chart */}
      <div className="perf__chart-section fade-up-3">
        <h2 className="perf__section-title">THIS WEEK</h2>
        <div className="weekly-chart">
          {weeklyData.map((d, i) => (
            <div key={i} className="wc__col">
              <div className="wc__bar-wrap">
                <div className="wc__bar"
                  style={{ height: `${(d.minutes / maxMinutes) * 100}%` }}>
                  {d.minutes > 0 && <span className="wc__bar-val">{d.minutes}m</span>}
                </div>
              </div>
              <div className="wc__day">{d.day}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity log */}
      <div className="perf__log fade-up-4">
        <h2 className="perf__section-title">ACTIVITY LOG</h2>
        <div className="act-list">
          {activities.length === 0 && <p style={{color: '#888', textAlign:'center', padding:'2rem'}}>No activities logged yet. Get started today!</p>}
          {activities.map(a => (
            <div key={a.id} className="act-item">
              <div className="act-sport">{a.sport}</div>
              <div className="act-info">
                <div className="act-name">{a.name}</div>
                <div className="act-date">{a.date}</div>
              </div>
              <div className="act-stats">
                <span className="act-stat">{a.duration} min</span>
                <span className="act-stat">{a.calories} kcal</span>
                {a.intensity && (
                  <span className={`act-intensity ${a.intensity.toLowerCase()}`}>{a.intensity}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showLog && (
        <div className="modal-overlay" onClick={() => setShowLog(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__head">
              <h2>LOG ACTIVITY</h2>
              <button className="modal__close" onClick={() => setShowLog(false)}>✕</button>
            </div>
            <form onSubmit={handleLog} className="modal-form">
              <div className="field-row">
                <div className="field"><label>Activity Name</label>
                  <input required placeholder="Morning Run" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="field"><label>Sport</label>
                  <select required value={form.sport} onChange={e => setForm({...form, sport: e.target.value})}>
                    <option value="">Select</option>
                    {Object.keys(SPORT_ICONS).map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="field-row">
                <div className="field"><label>Date</label><input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
                <div className="field"><label>Duration (min)</label><input type="number" required min="1" placeholder="60" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>Calories</label><input type="number" step="1" required min="0" placeholder="400" value={form.calories} onChange={e => setForm({...form, calories: e.target.value})} /></div>
                <div className="field"><label>Intensity</label>
                  <select value={form.intensity} onChange={e => setForm({...form, intensity: e.target.value})}>
                    <option value="">Select</option>
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="auth-btn">Log Activity</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
