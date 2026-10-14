const mongoose = require('mongoose');

// One document per attendee registered for an event. EMS-FR-06 only counts
// these; EMS-FR-10 (event registration) will create them.
const registrationSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    attendeeId: { type: Number, required: true },
  },
  { timestamps: true }
);

// An attendee can register for an event only once. The index also serves
// "how many attendees are registered for this event".
registrationSchema.index({ eventId: 1, attendeeId: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);