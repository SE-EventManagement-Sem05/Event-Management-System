export default function ReviewSection({
  averageRating,
  reviewCount = 0,
  reviews = [],
}) {
  return (
    <section className="review-section" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading">Ratings and reviews</h2>

      <p className="review-summary" aria-live="polite">
        {averageRating === null || averageRating === undefined
          ? 'No ratings yet'
          : `${averageRating.toFixed(2)} out of 5`}
        {' · '}
        {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
      </p>

      {reviews.length === 0 ? (
        <p>No reviews have been submitted for this event yet.</p>
      ) : (
        <ul className="review-list">
          {reviews.map((review) => (
            <li
              className="review-item"
              key={`${review.createdAt}-${review.attendeeName}-${review.rating}`}
            >
              <p className="review-rating">
                Rating: {review.rating}/5
              </p>

              <p className="review-author">
                {review.attendeeName || 'Attendee'}
              </p>

              {review.comment && (
                <p className="review-comment">{review.comment}</p>
              )}

              <time dateTime={review.createdAt}>
                {new Date(review.createdAt).toLocaleDateString()}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}