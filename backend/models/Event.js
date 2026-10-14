const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    hostId: { type: Number, required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    venue: { type: String, required: true, trim: true, maxlength: 200 },
    date: { type: Date, required: true },
    category: { type: String, trim: true, maxlength: 50, default: '' },
  },
  { timestamps: true }
);

// Serves "this host's events, upcoming or past, ordered by date" (EMS-NFR-06).
eventSchema.index({ hostId: 1, date: 1 });

module.exports = mongoose.model('Event', eventSchema);