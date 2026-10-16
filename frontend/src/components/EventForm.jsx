import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiValidationError, SessionExpiredError } from '../utils/events.js';
import { toPayload, validateEventForm } from '../utils/eventForm.js';
import '../styles/signup.css';
import '../styles/eventform.css';

function FieldError({ id, message }) {
  if (!message) return null;

  return (
    <p id={`${id}-error`} className="form-error" role="alert">
      {message}
    </p>
  );
}

export default function EventForm({
  initialValues,
  originalEvent = null,
  submitLabel,
  savingLabel = 'Saving…',
  onSubmit,
  onSessionExpired,
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);

  function handleChange(event) {
    const { id, value } = event.target;

    setValues((previous) => ({ ...previous, [id]: value }));
    setErrors((previous) => ({ ...previous, [id]: '' }));
    setSubmitError('');
  }

  function inputProps(id) {
    return {
      id,
      value: values[id],
      onChange: handleChange,
      'aria-invalid': Boolean(errors[id]),
      'aria-describedby': errors[id] ? `${id}-error` : undefined,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting.current) return;

    const validationErrors = validateEventForm(values, { originalEvent });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    submitting.current = true;
    setErrors({});
    setSubmitError('');
    setSaving(true);

    try {
      await onSubmit(toPayload(values, originalEvent));
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        if (onSessionExpired) onSessionExpired();
        return;
      }

      if (error instanceof ApiValidationError) {
        setErrors(error.fieldErrors);
      }

      setSubmitError(error.message || 'Unable to save the event. Please try again.');
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  return (
    <form className="event-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label className="form-label" htmlFor="title">Title</label>
        <input type="text" className="form-input" placeholder="Event title" {...inputProps('title')} />
        <FieldError id="title" message={errors.title} />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="description">Description</label>
        <textarea
          className="form-input form-textarea"
          rows={5}
          placeholder="What is this event about?"
          {...inputProps('description')}
        />
        <FieldError id="description" message={errors.description} />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="date">Date and time</label>
        <input type="datetime-local" className="form-input" {...inputProps('date')} />
        <FieldError id="date" message={errors.date} />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="venue">Venue</label>
        <input type="text" className="form-input" placeholder="Where will it take place?" {...inputProps('venue')} />
        <FieldError id="venue" message={errors.venue} />
      </div>

      <div className="event-form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="price">Price</label>
          <input
            type="number"
            className="form-input"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
            {...inputProps('price')}
          />
          <p className="field-hint">Enter 0 for a free event.</p>
          <FieldError id="price" message={errors.price} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="capacity">Capacity</label>
          <input
            type="number"
            className="form-input"
            min="1"
            step="1"
            inputMode="numeric"
            placeholder="Maximum attendees"
            {...inputProps('capacity')}
          />
          <FieldError id="capacity" message={errors.capacity} />
        </div>
      </div>

      {submitError && (
        <p className="form-error" role="alert">
          {submitError}
        </p>
      )}

      <div className="event-form-actions">
        <button type="submit" className="btn btn-primary auth-submit" disabled={saving}>
          {saving ? savingLabel : submitLabel}
        </button>

        <Link to="/host/dashboard" className="event-form-cancel">
          Cancel
        </Link>
      </div>
    </form>
  );
}