import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const SPORTS = ['⚽ Football', '🏀 Basketball', '🎾 Tennis', '🏊 Swimming',
  '🚴 Cycling', '🥊 Boxing', '🏃 Running', '🏋️ Weightlifting',
  '🏐 Volleyball', '🏒 Hockey', '⚽ Football', '🏀 Basketball',
  '🎾 Tennis', '🏊 Swimming', '🚴 Cycling', '🥊 Boxing'];

const STATS = [
  { num: '12K+', label: 'Active Athletes' },
  { num: '340+', label: 'Cities' },
  { num: '98%', label: 'Match Rate' },
  { num: '50+', label: 'Sports' },
];

const FEATURES = [
  {
    icon: '◈',
    title: 'Smart Matchmaking',
    desc: 'Our AI-powered algorithm matches you with partners who share your sport, level, schedule, and location.',
    tag: 'Member 3',
  },
  {
    icon: '◉',
    title: 'Session Management',
    desc: 'Create, join, and manage training sessions. Organize your sporting life with precision.',
    tag: 'Member 2',
  },
  {
    icon: '◎',
    title: 'Performance Tracking',
    desc: 'Log activities, track your stats over time, and watch your progress curve rise.',
    tag: 'Member 3',
  },
  {
    icon: '◐',
    title: 'Secure Auth',
    desc: 'JWT-secured profiles with full control over your data, privacy, and identity.',
    tag: 'Member 1',
  },
];

export default function Landing() {
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing">

      {/* HERO */}
      <section className="hero">
        <div className="hero__noise" />
        <div className="hero__grid" />
        <div className="hero__content">
          <div className="hero__eyebrow fade-up-1">
            <span className="eyebrow-dot" />
            Cloud Native Sports Platform
          </div>
          <h1 className="hero__title fade-up-2">
            FIND YOUR<br />
            <span className="hero__title-outline">SPORTS</span><br />
            PARTNER
          </h1>
          <p className="hero__sub fade-up-3">
            Connect with athletes near you. Train together.<br />
            Track performance. Dominate your game.
          </p>
          <div className="hero__cta fade-up-4">
            <Link to="/register" className="btn-primary">Start For Free</Link>
            <Link to="/sessions" className="btn-ghost">Browse Sessions →</Link>
          </div>
        </div>
        <div className="hero__visual fade-up-3">
          <div className="hero__card">
            <div className="hcard__head">
              <span className="hcard__dot green" />
              <span className="hcard__dot yellow" />
              <span className="hcard__dot red" />
            </div>
            <div className="hcard__match">
              <div className="hcard__label">New Match Found</div>
              <div className="hcard__user">
                <div className="hcard__avatar" style={{ background: '#E8FF3C' }}>K</div>
                <div>
                  <div className="hcard__name">Karim B.</div>
                  <div className="hcard__sport">⚽ Football · Casablanca</div>
                </div>
                <div className="hcard__level">Level 7</div>
              </div>
              <div className="hcard__stats">
                <div className="hcard__stat"><span>Compatibility</span><strong>94%</strong></div>
                <div className="hcard__stat"><span>Distance</span><strong>2.3km</strong></div>
                <div className="hcard__stat"><span>Sessions</span><strong>48</strong></div>
              </div>
              <button className="hcard__btn">Connect Now</button>
            </div>
          </div>
          <div className="hero__card hero__card--sm">
            <div className="hcard__session-item">
              <span className="hcard__session-sport">🏀</span>
              <div>
                <div className="hcard__session-name">Sunday Pickup</div>
                <div className="hcard__session-info">Today · 3 spots left</div>
              </div>
              <span className="badge-accent">Join</span>
            </div>
            <div className="hcard__session-item">
              <span className="hcard__session-sport">🎾</span>
              <div>
                <div className="hcard__session-name">Tennis Drill</div>
                <div className="hcard__session-info">Tomorrow · 2 spots left</div>
              </div>
              <span className="badge-accent">Join</span>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker">
        <div className="ticker__track">
          {SPORTS.map((s, i) => (
            <span key={i} className="ticker__item">{s}</span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section className="stats" id="features">
        {STATS.map((s, i) => (
          <div key={i} className={`stat reveal delay-${i}`}>
            <div className="stat__num">{s.num}</div>
            <div className="stat__label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* FEATURES */}
      <section className="features">
        <div className="section__header reveal">
          <div className="section__eyebrow">What we offer</div>
          <h2 className="section__title">BUILT FOR<br /><span className="accent">ATHLETES</span></h2>
        </div>
        <div className="features__grid">
          {FEATURES.map((f, i) => (
            <div key={i} className={`feature-card reveal delay-${i % 3}`}>
              <div className="feature-card__icon">{f.icon}</div>
              <div className="feature-card__tag">{f.tag}</div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how" id="sports">
        <div className="section__header reveal">
          <div className="section__eyebrow">Get Started</div>
          <h2 className="section__title">THREE STEPS<br /><span className="accent">TO YOUR TEAM</span></h2>
        </div>
        <div className="how__steps">
          {[
            { n: '01', title: 'Create Your Profile', desc: 'Sign up, select your sports, set your level and availability.' },
            { n: '02', title: 'Find Matches', desc: 'Our algorithm surfaces compatible partners near you in seconds.' },
            { n: '03', title: 'Train Together', desc: 'Book sessions, meet up, log performance, and level up.' },
          ].map((step, i) => (
            <div key={i} className={`how__step reveal delay-${i}`}>
              <div className="how__step-num">{step.n}</div>
              <div className="how__step-line" />
              <h3 className="how__step-title">{step.title}</h3>
              <p className="how__step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner reveal">
        <div className="cta-banner__inner">
          <h2 className="cta-banner__title">READY TO FIND<br />YOUR <span className="accent">PARTNER</span>?</h2>
          <p className="cta-banner__sub">Join thousands of athletes already training smarter.</p>
          <Link to="/register" className="btn-primary">Create Free Account</Link>
        </div>
        <div className="cta-banner__deco">SPORT</div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer__logo">
          <span className="logo-sc-sm">SC</span>
          <span>SportConnect</span>
        </div>
        <p className="footer__copy">© 2026 SportConnect · Cloud Native Project · All rights reserved</p>
      </footer>
    </div>
  );
}
