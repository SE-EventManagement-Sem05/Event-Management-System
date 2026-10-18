import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ApiError,
  SessionExpiredError,
  fetchAttendeeEvent,
  submitEventReview,
} from '../utils/events.js';
import {
  formatCapacity,
  formatEventDate,
  formatPrice,
} from '../utils/eventFormat.js';
import ReviewSection from '../components/ReviewSection.jsx';
import '../styles/events.css';
import '../styles/eventdetails.css';

export default function AttendeeEventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [reviewError, setReviewError] = useState('');
  const [notice, setNotice] = useState('');
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setEvent(null);
    setError(null);

    fetchAttendeeEvent(id)
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
  }, [id, reloadKey, navigate]);

  async function handleReviewSubmit(submitEvent) {
    submitEvent.preventDefault();

    setSaving(true);
    setReviewError('');
    setNotice('');

    try {
      await submitEventReview(id, {
        rating: Number(rating),
        comment: comment.trim(),
      });

      setComment('');
      setNotice('Review submitted successfully.');
      setReloadKey((key) => key + 1);
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        navigate('/login', { replace: true });
        return;
      }

      setReviewError(
        err.message || 'Unable to submit your review. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  }

  const canRetry = error && (!error.status || error.status >= 500);

  if (error) {
    return (
      <section className="dash-page">
        <div className="event-details-card">
          <Link to="/attendee/dashboard" className="event-back-link">
            Back to dashboard
          </Link>

          <div className="event-error" role="alert">
            <p>{error.message || 'Unable to load the event.'}</p>

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
        </div>
      </section>
    );
  }

  if (!event) {
    return (
      <section className="dash-page">
        <div className="event-details-card">
          <p className="event-status" role="status">
            Loading event…
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="dash-page">
      <div className="event-details-card">
        <Link to="/attendee/dashboard" className="event-back-link">
          Back to dashboard
        </Link>

        <header className="event-details-header">
          <p className="eyebrow">Eventide · Attendee</p>
          <h1>{event.title}</h1>
        </header>

        <dl className="event-facts">
          <div className="event-fact">
            <dt>Date and time</dt>
            <dd>
              <time dateTime={event.date}>
                {formatEventDate(event.date)}
              </time>
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
        </dl>

        <h2 className="event-description-title">Description</h2>
        <p className="event-description">{event.description}</p>

        <ReviewSection
          averageRating={event.averageRating}
          reviewCount={event.reviewCount}
          reviews={event.reviews}
        />

        {notice && (
          <p className="dash-notice" role="status">
            {notice}
          </p>
        )}

        {event.canReview && (
          <section className="review-form-section">
            <h2>Write a review</h2>

            <form onSubmit={handleReviewSubmit}>
              <label htmlFor="review-rating">Rating</label>
              <select
                id="review-rating"
                name="rating"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                required
              >
                <option value="1">1 - Poor</option>
                <option value="2">2 - Fair</option>
                <option value="3">3 - Good</option>
                <option value="4">4 - Very good</option>
                <option value="5">5 - Excellent</option>
              </select>

              <label htmlFor="review-comment">
                Comment (optional)
              </label>
              <textarea
                id="review-comment"
                name="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="Share your experience"
              />

              {reviewError && (
                <p className="event-error" role="alert">
                  {reviewError}
                </p>
              )}

              <button
                type="submit"
                className="event-button event-button-primary"
                disabled={saving}
              >
                {saving ? 'Submitting…' : 'Submit review'}
              </button>
            </form>
          </section>
        )}

        {event.hasReviewed && (
          <p className="review-already-submitted" role="status">
            You have already reviewed this event.
          </p>
        )}

        {!event.canReview && !event.hasReviewed && (
          <p className="review-not-eligible">
            Reviews are available to registered attendees after the event.
          </p>
        )}
      </div>
    </section>
  );
}