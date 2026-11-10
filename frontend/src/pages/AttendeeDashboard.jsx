
import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EventSection from '../components/EventSection.jsx';
import { fetchAttendeeEvents } from '../utils/events.js';
import '../styles/events.css';

export default function AttendeeDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  const [location, setLocation] = useState('');
  const [interest, setInterest] = useState('');
  const [category, setCategory] = useState('');

  const [filters, setFilters] = useState({
    location: '',
    interest: '',
    category: '',
  });

  const [activeTab, setActiveTab] = useState('upcoming');

  const fetchPage = useCallback(
    ({ status, page, limit }) =>
      fetchAttendeeEvents({
        status,
        page,
        limit,
        ...filters,
      }),
    [filters]
  );

  function handleSearch(event) {
    event.preventDefault();

    setFilters({
      location: location.trim(),
      interest: interest.trim(),
      category: category.trim(),
    });
  }

  function handleClear() {
    setLocation('');
    setInterest('');
    setCategory('');
    setFilters({
      location: '',
      interest: '',
      category: '',
    });
  }

  function handleLogout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login', { replace: true });
  }

  function handleSessionExpired() {
    navigate('/login', { replace: true });
  }

  return (
    <section className="dash-page">
      <div className="dash-inner">
        <header className="dash-header">
          <div>
            <p className="eyebrow">Eventide · Attendee</p>
            <h1>Find Events</h1>
            <p className="muted">
              Welcome, {user.name || 'Attendee'}! Discover events that
              interest you.
            </p>
          </div>

          <button
            type="button"
            className="dash-logout"
            onClick={handleLogout}
          >
            Log out
          </button>
        </header>

        <section className="event-search-panel" aria-label="Search events">
          <h2>Discover your next experience</h2>

          <form onSubmit={handleSearch}>
            <div className="event-search-grid">
              <div className="event-search-field">
                <label htmlFor="search-location">Location</label>
                <input
                  id="search-location"
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="e.g. Bengaluru"
                  maxLength={200}
                />
              </div>

              <div className="event-search-field">
                <label htmlFor="search-interest">Interests / Keywords</label>
                <input
                  id="search-interest"
                  type="text"
                  value={interest}
                  onChange={(event) => setInterest(event.target.value)}
                  placeholder="e.g. AI, music, workshops"
                  maxLength={120}
                />
              </div>

              <div className="event-search-field">
                <label htmlFor="search-category">Category</label>
                <input
                  id="search-category"
                  type="text"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  placeholder="e.g. Technology"
                  maxLength={50}
                />
              </div>
            </div>

            <div className="event-search-actions">
              <button type="submit" className="btn btn-gold">
                Search events
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={handleClear}
              >
                Clear filters
              </button>
            </div>
          </form>
        </section>

        <div className="dash-tabs" role="tablist" aria-label="Event status">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'upcoming'}
            className={`dash-tab${activeTab === 'upcoming' ? ' is-active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'past'}
            className={`dash-tab${activeTab === 'past' ? ' is-active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past
          </button>
        </div>

        <div role="tabpanel">
          <EventSection
            key={`${activeTab}-${filters.location}-${filters.interest}-${filters.category}`}
            title={activeTab === 'upcoming' ? 'Upcoming events' : 'Past events'}
            status={activeTab}
            emptyMessage="No events match your search. Try changing your filters."
            fetchPage={fetchPage}
            onSessionExpired={handleSessionExpired}
            getDetailsPath={(event) => `/attendee/events/${event.id}`}
          />
        </div>
      </div>
    </section>
  );
}
