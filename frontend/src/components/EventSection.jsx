import { useEffect, useState } from 'react';
import { SessionExpiredError } from '../utils/events.js';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 6;

function formatEventDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Date to be announced';

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function EventSection({
  title,
  status,
  emptyMessage,
  fetchPage,
  onSessionExpired,
  getDetailsPath,
  pageSize = PAGE_SIZE,
}) {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ events: [], total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');

    fetchPage({ status, page, limit: pageSize })
      .then((data) => {
        if (cancelled) return;

        // Events were removed while browsing: step back to the last valid page.
        if (data.totalPages > 0 && page > data.totalPages) {
          setPage(data.totalPages);
          return;
        }

        setResult(data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;

        if (err instanceof SessionExpiredError) {
          if (onSessionExpired) onSessionExpired();
          return;
        }

        setError(err.message || 'Unable to load events. Please try again.');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // onSessionExpired is intentionally not a dependency: it must not trigger a reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPage, status, page, pageSize, reloadKey]);

  const showCards = !loading && !error && result.events.length > 0;
  const showEmpty = !loading && !error && result.events.length === 0;

  return (
    <div className="event-section">
      <h2 className="event-section-title">
        {title}
        {!loading && !error && <span className="event-count">{result.total}</span>}
      </h2>

      {loading && (
        <p className="event-status" role="status">
          Loading events…
        </p>
      )}

      {error && (
        <div className="event-error" role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="event-button"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Try again
          </button>
        </div>
      )}

      {showEmpty && <p className="event-empty">{emptyMessage}</p>}

      {showCards && (
        <ul className="event-grid">
          {result.events.map((event) => (
            <li key={event.id} className="event-card">
                <h3 className="event-card-title">
                {getDetailsPath ? (
                  <Link className="event-card-link" to={getDetailsPath(event)}>
                    {event.title}
                  </Link>
                ) : (
                  event.title
                )}
              </h3>

              <p className="event-meta">
                <span className="event-meta-label">Date</span>
                <time dateTime={event.date}>{formatEventDate(event.date)}</time>
              </p>

              <p className="event-meta">
                <span className="event-meta-label">Venue</span>
                <span>{event.venue}</span>
              </p>
            </li>
          ))}
        </ul>
      )}

      {!error && result.totalPages > 1 && (
        <nav className="pagination" aria-label={`${title} pagination`}>
          <button
            type="button"
            className="event-button"
            onClick={() => setPage((current) => current - 1)}
            disabled={loading || page <= 1}
          >
            Previous
          </button>

          <span aria-live="polite">
            Page {page} of {result.totalPages}
          </span>

          <button
            type="button"
            className="event-button"
            onClick={() => setPage((current) => current + 1)}
            disabled={loading || page >= result.totalPages}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}