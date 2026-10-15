import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import EventSection from '../components/EventSection.jsx';
import { fetchHostEvents } from '../utils/events.js';
import '../styles/events.css';

const TABS = [
  {
    id: 'upcoming',
    label: 'Upcoming',
    title: 'Upcoming events',
    empty: 'You have no upcoming events yet.',
  },
  {
    id: 'past',
    label: 'Past',
    title: 'Past events',
    empty: 'You have no past events yet.',
  },
];

export default function HostDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const location = useLocation();
  const [notice] = useState(location.state?.notice || '');

  useEffect(() => {
    // Clear the one-time notice from history so a refresh does not repeat it.
    if (location.state?.notice) {
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  function handleLogout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/login';
  }

  function handleSessionExpired() {
    navigate('/login', { replace: true });
  }

  function getDetailsPath(event) {
    return `/host/events/${event.id}`;
  }
  
  function getEditPath(event) {
    return `/host/events/${event.id}/edit`;
  }

  return (
    <section className="dash-page">
      <div className="dash-inner">
        <header className="dash-header">
          <div>
            <p className="eyebrow">Eventide · Host</p>
            <h1>Host Dashboard</h1>
            <p className="muted">Welcome, {user.name || 'Host'}!</p>
          </div>

            <div className="dash-actions">
            <Link to="/host/events/new" className="event-button event-button-primary">
              Create event
            </Link>

            <button type="button" className="dash-logout" onClick={handleLogout}>
              Log out
            </button>
          </div>

        </header>

        {notice && (
          <p className="dash-notice" role="status">
            {notice}
          </p>
        )}
        <div className="dash-tabs" role="tablist" aria-label="Event lists">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              className={`dash-tab${activeTab === tab.id ? ' is-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {TABS.map((tab) => (
          <div
            key={tab.id}
            id={`panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
            hidden={activeTab !== tab.id}
            className="dash-panel"
          >
            <EventSection
              title={tab.title}
              status={tab.id}
              emptyMessage={tab.empty}
              fetchPage={fetchHostEvents}
              onSessionExpired={handleSessionExpired}
              getDetailsPath={getDetailsPath}
              getEditPath={getEditPath}
            />
          </div>
        ))}
      </div>
    </section>
  );
}