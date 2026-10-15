import { useNavigate } from 'react-router-dom';
import EventForm from '../components/EventForm.jsx';
import { createHostEvent } from '../utils/events.js';
import { EMPTY_FORM } from '../utils/eventForm.js';
import '../styles/events.css';
import '../styles/eventform.css';

export default function CreateEvent() {
  const navigate = useNavigate();

  async function handleSubmit(payload) {
    await createHostEvent(payload);

    navigate('/host/dashboard', {
      replace: true,
      state: { notice: 'Event created successfully.' },
    });
  }

  return (
    <section className="dash-page">
      <div className="event-form-card">
        <header className="event-form-header">
          <p className="eyebrow">Eventide · Host</p>
          <h1>Create event</h1>
          <p className="muted">Fill in the details below. All fields are required.</p>
        </header>

        <EventForm
          initialValues={EMPTY_FORM}
          submitLabel="Create event"
          onSubmit={handleSubmit}
          onSessionExpired={() => navigate('/login', { replace: true })}
        />
      </div>
    </section>
  );
}