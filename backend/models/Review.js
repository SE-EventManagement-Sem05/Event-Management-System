const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    attendeeId: {
      type: Number,
      required: true,
    },
    attendeeName: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: Number.isInteger,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
  },
  { timestamps: true }
);

// A given attendee can review an event only once.
reviewSchema.index(
  { eventId: 1, attendeeId: 1 },
  { unique: true }
);

module.exports = mongoose.model('Review', reviewSchema);
