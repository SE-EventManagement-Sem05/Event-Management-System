import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import EventForm from '../components/EventForm.jsx';
import { SessionExpiredError, fetchHostEvent, updateHostEvent } from '../utils/events.js';
import { toFormValues } from '../utils/eventForm.js';
import '../styles/events.css';
import '../styles/eventform.css';

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setEvent(null);
    setLoadError('');

    fetchHostEvent(id)
      .then((data) => {
        if (!cancelled) setEvent(data);
      })
      .catch((error) => {
        if (cancelled) return;

        if (error instanceof SessionExpiredError) {
          navigate('/login', { replace: true });
          return;
        }

        setLoadError(error.message || 'Unable to load the event. Please try again.');
      });

    return () => {
      cancelled = true;
    };
    // navigate is intentionally not a dependency: it must not trigger a reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSubmit(payload) {
    await updateHostEvent(id, payload);

    navigate(`/host/events/${id}`, {
      replace: true,
      state: { notice: 'Event updated successfully.' },
    });
  }

  let content;

  if (loadError) {
    content = (
      <div className="event-error" role="alert">
        <p>{loadError}</p>
        <Link to="/host/dashboard" className="event-button">
          Back to dashboard
        </Link>
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
      <EventForm
        key={event.id}
        initialValues={toFormValues(event)}
        originalEvent={event}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
        onSessionExpired={() => navigate('/login', { replace: true })}
      />
    );
  }

  return (
    <section className="dash-page">
      <div className="event-form-card">
        <header className="event-form-header">
          <p className="eyebrow">Eventide · Host</p>
          <h1>Edit event</h1>
        </header>

        {content}
      </div>
    </section>
  );
}