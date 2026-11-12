
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Payment = require('../models/Payment');

const ID_PATTERN = /^[a-f\d]{24}$/i;

async function processPayment(req, res) {
  const { id } = req.params;
  const { outcome } = req.body || {};

  if (!ID_PATTERN.test(id)) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  if (!['success', 'failed'].includes(outcome)) {
    return res.status(400).json({
      message: 'A valid simulated payment outcome is required.',
    });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Payment service is temporarily unavailable.',
    });
  }

  try {
    const event = await Event.findById(id).lean();

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const registration = await Registration.findOne({
      eventId: event._id,
      attendeeId: req.user.id,
    });

    if (!registration) {
      return res.status(403).json({
        message: 'You must register for this event before making a payment.',
      });
    }

    // Free events do not require payment.
    if (!event.price || event.price <= 0) {
      return res.status(400).json({
        message: 'This is a free event. No payment is required.',
      });
    }

    const existingPayment = await Payment.findOne({
      registrationId: registration._id,
      attendeeId: req.user.id,
      status: 'success',
    }).lean();

    if (existingPayment) {
      return res.status(409).json({
        message: 'Payment has already been completed for this event.',
        payment: existingPayment,
      });
    }

    const payment = await Payment.create({
      eventId: event._id,
      registrationId: registration._id,
      attendeeId: req.user.id,
      amount: event.price,
      status: outcome,
      transactionId: `SIM-${new mongoose.Types.ObjectId()}`,
    });

    return res.status(outcome === 'success' ? 201 : 402).json({
      message:
        outcome === 'success'
          ? 'Simulated payment completed successfully.'
          : 'Simulated payment failed. Please try again.',
      payment: {
        transactionId: payment.transactionId,
        amount: payment.amount,
        status: payment.status,
        eventId: payment.eventId,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Payment has already been completed for this event.',
      });
    }

    console.error('Process payment error:', error.message);

    return res.status(500).json({
      message: 'Unable to process payment. Please try again.',
    });
  }
}

module.exports = { processPayment };
