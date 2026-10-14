const mongoose = require('mongoose');
const Event = require('../models/Event');

const STATUSES = ['upcoming', 'past'];
const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 50;
const MAX_PAGE = 100000;

// Returns a positive integer, the fallback when the value is absent,
// or null when the value is present but invalid.
function parsePositiveInt(value, fallback, max) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^\d{1,9}$/.test(value)) return null;

  const number = Number(value);
  return number >= 1 && number <= max ? number : null;
}

async function listHostEvents(req, res) {
  const { status } = req.query;
  const page = parsePositiveInt(req.query.page, 1, MAX_PAGE);
  const limit = parsePositiveInt(req.query.limit, DEFAULT_LIMIT, MAX_LIMIT);

  if (!STATUSES.includes(status)) {
    return res.status(400).json({
      message: 'Query parameter "status" must be "upcoming" or "past".',
    });
  }

  if (page === null || limit === null) {
    return res.status(400).json({
      message: `"page" must be a positive integer and "limit" must be between 1 and ${MAX_LIMIT}.`,
    });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Events are temporarily unavailable. Please try again shortly.',
    });
  }

  try {
    const now = new Date();
    const isUpcoming = status === 'upcoming';

    // hostId comes from the verified JWT, never from the request.
    const filter = {
      hostId: req.user.id,
      date: isUpcoming ? { $gte: now } : { $lt: now },
    };
    const sort = isUpcoming ? { date: 1, _id: 1 } : { date: -1, _id: -1 };

    const [total, events] = await Promise.all([
      Event.countDocuments(filter),
      Event.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .select('title date venue')
        .lean(),
    ]);

    return res.status(200).json({
      status,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      events: events.map((event) => ({
        id: event._id,
        title: event.title,
        date: event.date,
        venue: event.venue,
      })),
    });
  } catch (error) {
    console.error('List host events error:', error.message);

    return res.status(500).json({
      message: 'Unable to load events. Please try again.',
    });
  }
}

module.exports = { listHostEvents };