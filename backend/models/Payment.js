const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      required: true,
    },
    attendeeId: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

// An attendee can have only one successful payment per registration.
paymentSchema.index(
  { registrationId: 1, attendeeId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'success' },
  }
);

module.exports = mongoose.model('Payment', paymentSchema);