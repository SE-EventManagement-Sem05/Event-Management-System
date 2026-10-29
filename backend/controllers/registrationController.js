
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

const ID_PATTERN = /^[a-f\d]{24}$/i;

async function registerForEvent(req, res) {
  const { id } = req.params;

  if (!ID_PATTERN.test(id)) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Registration is temporarily unavailable. Please try again shortly.',
    });
  }

  try {
    const event = await Event.findById(id).lean();

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (event.date < new Date()) {
      return res.status(400).json({
        message: 'You cannot register for a past event.',
      });
    }

    const existingRegistration = await Registration.findOne({
      eventId: event._id,
      attendeeId: req.user.id,
    }).lean();

    if (existingRegistration) {
      return res.status(409).json({
        message: 'You are already registered for this event.',
      });
    }

    if (Number.isInteger(event.capacity)) {
      const registeredCount = await Registration.countDocuments({
        eventId: event._id,
      });

      if (registeredCount >= event.capacity) {
        return res.status(409).json({
          message: 'This event has reached its registration capacity.',
        });
      }
    }

    // The attendee ID comes from the verified JWT, not the request body.
    await Registration.create({
      eventId: event._id,
      attendeeId: req.user.id,
    });

    return res.status(201).json({
      message: 'Registered for the event successfully.',
      registration: {
        eventId: event._id,
        attendeeId: req.user.id,
      },
    });
  } catch (error) {
    // The unique index also protects against simultaneous duplicate requests.
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'You are already registered for this event.',
      });
    }

    console.error('Register for event error:', error.message);

    return res.status(500).json({
      message: 'Unable to register for this event. Please try again.',
    });
  }
}

module.exports = { registerForEvent };
