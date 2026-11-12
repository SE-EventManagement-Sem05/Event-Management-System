
jest.mock('mongoose', () => ({
  connection: {
    readyState: 1,
  },
  Types: {
    ObjectId: jest.fn(() => 'mock-object-id'),
  },
}));

jest.mock('../../backend/models/Event', () => ({
  findById: jest.fn(),
}));

jest.mock('../../backend/models/Registration', () => ({
  findOne: jest.fn(),
}));

jest.mock('../../backend/models/Payment', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

const mongoose = require('mongoose');
const Event = require('../../backend/models/Event');
const Registration = require('../../backend/models/Registration');
const Payment = require('../../backend/models/Payment');
const {
  processPayment,
} = require('../../backend/controllers/paymentController');

const EVENT_ID = '507f1f77bcf86cd799439011';

const EVENT = {
  _id: EVENT_ID,
  price: 500,
};

const REGISTRATION = {
  _id: '507f1f77bcf86cd799439012',
};

let req;
let res;

function mockResponse() {
  const response = {};
  response.status = jest.fn().mockReturnValue(response);
  response.json = jest.fn().mockReturnValue(response);
  return response;
}

function mockEvent(event = EVENT) {
  Event.findById.mockReturnValue({
    lean: jest.fn().mockResolvedValue(event),
  });
}

function mockExistingPayment(payment = null) {
  Payment.findOne.mockReturnValue({
    lean: jest.fn().mockResolvedValue(payment),
  });
}

beforeEach(() => {
  jest.clearAllMocks();

  mongoose.connection.readyState = 1;

  req = {
    params: { id: EVENT_ID },
    body: { outcome: 'success' },
    user: { id: 42 },
  };

  res = mockResponse();

  mockEvent();
  Registration.findOne.mockResolvedValue(REGISTRATION);
  mockExistingPayment(null);

  Payment.create.mockImplementation(async (data) => ({
    ...data,
  }));
});

describe('paymentController.processPayment', () => {
  test('rejects an invalid event ID', async () => {
    req.params.id = 'invalid-id';

    await processPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(Event.findById).not.toHaveBeenCalled();
  });

  test.each([undefined, null, '', 'pending', 'SUCCESS', 123])(
    'rejects invalid payment outcome: %j',
    async (outcome) => {
      req.body = { outcome };

      await processPayment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(Event.findById).not.toHaveBeenCalled();
    }
  );

  test('returns 503 when database is unavailable', async () => {
    mongoose.connection.readyState = 0;

    await processPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(Event.findById).not.toHaveBeenCalled();
  });

  test('returns 404 when event does not exist', async () => {
    mockEvent(null);

    await processPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('returns 403 when attendee is not registered', async () => {
    Registration.findOne.mockResolvedValue(null);

    await processPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(Payment.create).not.toHaveBeenCalled();
  });

  test.each([0, undefined, null, -10])(
    'rejects free event with price %j',
    async (price) => {
      mockEvent({ ...EVENT, price });

      await processPayment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(Payment.create).not.toHaveBeenCalled();
    }
  );

  test('returns 409 if payment was already successful', async () => {
    mockExistingPayment({
      status: 'success',
      transactionId: 'SIM-EXISTING',
    });

    await processPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(Payment.create).not.toHaveBeenCalled();
  });

  test('creates a successful payment', async () => {
    await processPayment(req, res);

    expect(Payment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: EVENT._id,
        registrationId: REGISTRATION._id,
        attendeeId: 42,
        amount: 500,
        status: 'success',
        transactionId: expect.stringMatching(/^SIM-/),
      })
    );

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('records a failed payment and returns 402', async () => {
    req.body.outcome = 'failed';

    await processPayment(req, res);

    expect(Payment.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'failed' })
    );

    expect(res.status).toHaveBeenCalledWith(402);
  });

  test('returns 409 for a duplicate-key database error', async () => {
    Payment.create.mockRejectedValue({ code: 11000 });

    await processPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  test('returns 500 for an unexpected database error', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    Payment.create.mockRejectedValue(new Error('Database failure'));

    await processPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    consoleSpy.mockRestore();
  });
});
