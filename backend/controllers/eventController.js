const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { validateEventInput } = require('../validators/eventValidator');
const { getReviewSummary } = require('./reviewController');

const STATUSES = ['upcoming', 'past'];
const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 50;
const MAX_PAGE = 100000;
const ID_PATTERN = /^[a-f\d]{24}$/i;

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

function toEventDetails(event, registeredCount) {
  return {
    id: event._id,
    title: event.title,
    description: event.description,
    date: event.date,
    venue: event.venue,
    price: event.price,
    capacity: event.capacity,
    registeredCount,
  };
}

function databaseIsUp() {
  return mongoose.connection.readyState === 1;
}

function sendUnavailable(res) {
  return res.status(503).json({
    message: 'Events are temporarily unavailable. Please try again shortly.',
  });
}

// Loads an event and checks that the logged-in host owns it. Sends the error
// response itself and returns null when the event cannot be used.
async function loadOwnedEvent(req, res) {
  const { id } = req.params;

  if (!ID_PATTERN.test(id)) {
    res.status(404).json({ message: 'Event not found.' });
    return null;
  }

  if (!databaseIsUp()) {
    sendUnavailable(res);
    return null;
  }

  const event = await Event.findById(id);

  if (!event) {
    res.status(404).json({ message: 'Event not found.' });
    return null;
  }

  if (event.hostId !== req.user.id) {
    res.status(403).json({ message: 'You can only access your own events.' });
    return null;
  }

  return event;
}

async function getHostEvent(req, res) {
  try {
    const event = await loadOwnedEvent(req, res);

    if (!event) return undefined;

    const [registeredCount, reviewSummary] = await Promise.all([
      Registration.countDocuments({ eventId: event._id }),
      getReviewSummary(event._id),
    ]);

    return res.status(200).json({
      event: {
        ...toEventDetails(event, registeredCount),
        ...reviewSummary,
      },
    });
  } catch (error) {
    console.error('Get event error:', error.message);

    return res.status(500).json({
      message: 'Unable to load the event. Please try again.',
    });
  }
}


function sendValidationErrors(res, errors) {
  return res.status(400).json({
    message: 'Please correct the highlighted fields.',
    errors,
  });
}

async function createEvent(req, res) {
  const { errors, value } = validateEventInput(req.body);

  if (Object.keys(errors).length > 0) {
    return sendValidationErrors(res, errors);
  }

  if (!databaseIsUp()) {
    return sendUnavailable(res);
  }

  try {
    // hostId comes from the verified JWT, never from the request body.
    const event = await Event.create({ ...value, hostId: req.user.id });

    return res.status(201).json({
      message: 'Event created successfully.',
      event: toEventDetails(event, 0),
    });
  } catch (error) {
    console.error('Create event error:', error.message);

    return res.status(500).json({
      message: 'Unable to create the event. Please try again.',
    });
  }
}

async function updateEvent(req, res) {
  try {
    // Ownership is checked before the body is validated.
    const event = await loadOwnedEvent(req, res);

    if (!event) return undefined;

    const { errors, value } = validateEventInput(req.body, {
      existingDate: event.date,
    });

    const registeredCount = await Registration.countDocuments({ eventId: event._id });

    // Extra rule: capacity may not drop below the attendees already registered.
    if (!errors.capacity && value.capacity < registeredCount) {
      errors.capacity = `Capacity cannot be lower than the ${registeredCount} attendee(s) already registered.`;
    }

    if (Object.keys(errors).length > 0) {
      return sendValidationErrors(res, errors);
    }

    event.set(value);
    await event.save();

    return res.status(200).json({
      message: 'Event updated successfully.',
      event: toEventDetails(event, registeredCount),
    });
  } catch (error) {
    console.error('Update event error:', error.message);

    return res.status(500).json({
      message: 'Unable to update the event. Please try again.',
    });
  }
}

module.exports = { listHostEvents, getHostEvent, createEvent, updateEvent };