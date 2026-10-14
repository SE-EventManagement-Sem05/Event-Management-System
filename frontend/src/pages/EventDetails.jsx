import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SessionExpiredError, fetchHostEvent } from '../utils/events.js';
import { formatCapacity, formatEventDate, formatPrice } from '../utils/eventFormat.js';
import '../styles/events.css';
import '../styles/eventdetails.css';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setEvent(null);
    setError(null);

    fetchHostEvent(id)
      .then((data) => {
        if (!cancelled) setEvent(data);
      })
      .catch((err) => {
        if (cancelled) return;

        if (err instanceof SessionExpiredError) {
          navigate('/login', { replace: true });
          return;
        }

        setError(err);
      });

    return () => {
      cancelled = true;
    };
    // navigate is intentionally not a dependency: it must not trigger a reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, reloadKey]);

  // Offer a retry only for connection and server problems, not for 403 or 404.
  const canRetry = error && (!error.status || error.status >= 500);

  let content;

  if (error) {
    content = (
      <div className="event-error" role="alert">
        <p>{error.message || 'Unable to load the event. Please try again.'}</p>
        {canRetry && (
          <button
            type="button"
            className="event-button"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Try again
          </button>
        )}
      </div>
    );
  } else if (!event) {
    content = (
      <p className="event-status" role="status">
        Loading event…
      </p>
    );
  } else {
    content = (
      <>
        <header className="event-details-header">
          <p className="eyebrow">Eventide · Host</p>
          <h1>{event.title}</h1>
        </header>

        <dl className="event-facts">
          <div className="event-fact">
            <dt>Date and time</dt>
            <dd>
              <time dateTime={event.date}>{formatEventDate(event.date)}</time>
            </dd>
          </div>

          <div className="event-fact">
            <dt>Venue</dt>
            <dd>{event.venue}</dd>
          </div>

          <div className="event-fact">
            <dt>Price</dt>
            <dd>{formatPrice(event.price)}</dd>
          </div>

          <div className="event-fact">
            <dt>Capacity</dt>
            <dd>{formatCapacity(event.capacity)}</dd>
          </div>

          <div className="event-fact">
            <dt>Registered attendees</dt>
            <dd>{event.registeredCount ?? 0}</dd>
          </div>
        </dl>

        <h2 className="event-description-title">Description</h2>
        <p className="event-description">{event.description}</p>
      </>
    );
  }

  return (
    <section className="dash-page">
      <div className="event-details-card">
        <Link to="/host/dashboard" className="event-back-link">
          ← Back to dashboard
        </Link>

        {content}
      </div>
    </section>
  );
}