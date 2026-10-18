const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Review = require('../models/Review');
const db = require('../db');

const ID_PATTERN = /^[a-f\d]{24}$/i;
const MAX_COMMENT_LENGTH = 1000;
const MAX_VISIBLE_REVIEWS = 50;

function databaseIsUp() {
  return mongoose.connection.readyState === 1;
}

function sendUnavailable(res) {
  return res.status(503).json({
    message: 'Events are temporarily unavailable. Please try again shortly.',
  });
}

async function getReviewSummary(eventId) {
  const [summary, reviews] = await Promise.all([
    Review.aggregate([
      { $match: { eventId: new mongoose.Types.ObjectId(String(eventId)) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]),
    Review.find({ eventId })
      .sort({ createdAt: -1, _id: -1 })
      .limit(MAX_VISIBLE_REVIEWS)
      .select('attendeeName rating comment createdAt')
      .lean(),
  ]);

  return {
    averageRating: summary.length
      ? Math.round(summary[0].averageRating * 100) / 100
      : null,
    reviewCount: summary.length ? summary[0].reviewCount : 0,
    reviews,
  };
}

function toPublicEvent(event) {
  return {
    id: String(event._id),
    title: event.title,
    description: event.description,
    date: event.date,
    venue: event.venue,
    price: event.price,
    capacity: event.capacity,
  };
}

async function getEventForReview(req, res) {
  const { id } = req.params;

  if (!ID_PATTERN.test(id)) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  if (!databaseIsUp()) {
    return sendUnavailable(res);
  }

  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (req.user.role === 'host' && event.hostId !== req.user.id) {
      return res.status(403).json({
        message: 'You can only access your own events.',
      });
    }

    const reviewSummary = await getReviewSummary(event._id);
    const isPastEvent = event.date < new Date();

    let canReview = false;
    let hasReviewed = false;

    if (req.user.role === 'attendee' && isPastEvent) {
      const [registration, existingReview] = await Promise.all([
        Registration.findOne({
          eventId: event._id,
          attendeeId: req.user.id,
        }).select('_id').lean(),
        Review.findOne({
          eventId: event._id,
          attendeeId: req.user.id,
        }).select('_id').lean(),
      ]);

      hasReviewed = Boolean(existingReview);
      canReview = Boolean(registration) && !hasReviewed;
    }

    return res.status(200).json({
      event: {
        ...toPublicEvent(event),
        ...reviewSummary,
        canReview,
        hasReviewed,
      },
    });
  } catch (error) {
    console.error('Get event reviews error:', error.message);

    return res.status(500).json({
      message: 'Unable to load event reviews. Please try again.',
    });
  }
}

async function createReview(req, res) {
  const { id } = req.params;
  const { rating, comment } = req.body || {};

  if (!ID_PATTERN.test(id)) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  if (
    typeof rating !== 'number' ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return res.status(400).json({
      message: 'Rating must be an integer from 1 to 5.',
    });
  }

  if (
    comment !== undefined &&
    comment !== null &&
    typeof comment !== 'string'
  ) {
    return res.status(400).json({
      message: 'Comment must be text.',
    });
  }

  const cleanComment = typeof comment === 'string' ? comment.trim() : '';

  if (cleanComment.length > MAX_COMMENT_LENGTH) {
    return res.status(400).json({
      message: `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters.`,
    });
  }

  if (!databaseIsUp()) {
    return sendUnavailable(res);
  }

  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (event.date >= new Date()) {
      return res.status(400).json({
        message: 'You can review an event only after it has ended.',
      });
    }

    const registration = await Registration.findOne({
      eventId: event._id,
      attendeeId: req.user.id,
    }).select('_id').lean();

    if (!registration) {
      return res.status(403).json({
        message: 'You can review only past events you registered for.',
      });
    }

    const existingReview = await Review.findOne({
      eventId: event._id,
      attendeeId: req.user.id,
    }).select('_id').lean();

    if (existingReview) {
      return res.status(409).json({
        message: 'You have already reviewed this event.',
      });
    }

    const user = db.prepare(
      'SELECT name FROM users WHERE id = ?'
    ).get(req.user.id);

    const review = await Review.create({
      eventId: event._id,
      attendeeId: req.user.id,
      attendeeName: user ? user.name : 'Attendee',
      rating,
      comment: cleanComment,
    });

    const reviewSummary = await getReviewSummary(event._id);

    return res.status(201).json({
      message: 'Review submitted successfully.',
      review: {
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      },
      reviewSummary,
    });
  } catch (error) {
    // Handles a concurrent request rejected by the unique MongoDB index.
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'You have already reviewed this event.',
      });
    }

    console.error('Create review error:', error.message);

    return res.status(500).json({
      message: 'Unable to submit your review. Please try again.',
    });
  }
}

module.exports = {
  getEventForReview,
  createReview,
  getReviewSummary,
};