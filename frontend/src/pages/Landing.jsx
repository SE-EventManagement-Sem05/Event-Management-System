import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Reveal from '../components/Reveal.jsx';

const PHRASES = ['Conferences', 'Concerts', 'Workshops', 'Weddings', 'Corporate Galas', 'Sports', 'Exhibitions', 'Social Meetups'];

const FEATURES = [
  { icon: '▦', title: 'Host Dashboard', text: 'See past and upcoming events with attendance, revenue and ratings in one calm view.' },
  { icon: '⌕', title: 'Smart Discovery', text: 'Attendees search and filter events by location, interest and category.' },
  { icon: '◈', title: 'Simulated Checkout', text: 'Try the full registration flow with a mock payment. No real money ever moves.' },
  { icon: '★', title: 'Ratings & Reviews', text: 'Verified attendees rate what they attended, so hosts get honest feedback.' },
];

const CATEGORIES = [
  { name: 'Conferences', span: 'tall' },
  { name: 'Concerts', span: '' },
  { name: 'Workshops', span: '' },
  { name: 'Weddings & Galas', span: 'wide' },
  { name: 'Sports', span: '' },
];

const STATS = [
  { n: '2', l: 'Roles: Host & Attendee' },
  { n: '60', l: 'Minute secure sessions' },
  { n: '0', l: 'Real payments processed' },
];

export default function Landing() {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo(0, 0);
  }, [hash]);

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <span className="badge hero-a1">✦ Event management, reimagined</span>
          <h1 className="hero-a2">
            Where great events find their <em>people</em>
          </h1>
          <p className="lead hero-a3">
            Hosts create and track events. Attendees discover, register and review them. One platform, two roles, zero clutter.
          </p>
          <div className="cta-row hero-a4">
            <Link to="/signup" className="btn btn-gold">Get started</Link>
            <Link to="/login" className="btn btn-outline">Log in</Link>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...PHRASES, ...PHRASES].map((p, i) => (
            <span key={i}>{p}<i className="dot" /></span>
          ))}
        </div>
      </div>

      <section id="features" className="section">
        <Reveal>
          <p className="eyebrow">What you get</p>
          <h2 className="section-title">Everything an event needs, <em>nothing</em> it doesn't</h2>
        </Reveal>
        <div className="grid-cards">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 100} className="card">
              <div className="icon-circle" aria-hidden="true">{f.icon}</div>
              <h3>{f.title}</h3>
              <p className="muted">{f.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="about" className="section alt">
        <div className="split">
          <Reveal className="visual-block"><div className="pulse" /></Reveal>
          <Reveal delay={150}>
            <p className="eyebrow">Built for both sides</p>
            <h2 className="section-title">Two roles, one <em>seamless</em> flow</h2>
            <p className="muted">
              Hosts publish events and watch the numbers. Attendees find what suits them, register in a few steps and leave feedback afterwards.
              Role-based access keeps each side's data where it belongs.
            </p>
            <div className="stats">
              {STATS.map((s) => (
                <div key={s.l}><strong>{s.n}</strong><span>{s.l}</span></div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="categories" className="section">
        <Reveal>
          <p className="eyebrow">Explore</p>
          <h2 className="section-title">Events for every <em>occasion</em></h2>
        </Reveal>
        <div className="masonry">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.name} delay={i * 100} className={`tile ${c.span} tile-${i}`}>
              <div className="tile-overlay"><span className="eyebrow">Category</span><h3>{c.name}</h3></div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section cta-band">
        <Reveal>
          <p className="eyebrow">Ready when you are</p>
          <h2 className="section-title">Start hosting or <em>discovering</em> today</h2>
          <div className="cta-row center">
            <Link to="/signup" className="btn btn-gold">Create an account</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
