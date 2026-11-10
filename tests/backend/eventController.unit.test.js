jest.mock('mongoose', () => ({
  connection: { readyState: 1 },
}));

jest.mock('../../../backend/models/Event', () => ({
  countDocuments: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
}));

jest.mock('../../../backend/models/Registration', () => ({
  countDocuments: jest.fn(),
}));

jest.mock('../../../backend/controllers/reviewController', () => ({
  getReviewSummary: jest.fn(),
}));

const mongoose = require('mongoose');
const Event = require('../../../backend/models/Event');
const Registration = require('../../../backend/models/Registration');
const { getReviewSummary } = require('../../../backend/controllers/reviewController');
const {
  listHostEvents,
  getHostEvent,
  createEvent,
  updateEvent,
} = require('../../../backend/controllers/eventController');

const EVENT_ID = '507f1f77bcf86cd799439011';
const HOST_ID = 7;

function futureDate() {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
}

function makeEvent(overrides = {}) {
  const event = {
    _id: EVENT_ID,
    hostId: HOST_ID,
    title: 'Test event',
    description: 'Test description',
    date: futureDate(),
    venue: 'Main Hall',
    price: 25,
    capacity: 20,
    set: jest.fn(function set(value) {
      Object.assign(this, value);
    }),
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  return event;
}

function makeQuery(value) {
  return {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(value),
  };
}

function makeResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function makeRequest({
  id = EVENT_ID,
  userId = HOST_ID,
  query = {},
  body = validBody(),
} = {}) {
  return {
    params: { id },
    user: { id: userId, role: 'host' },
    query,
    body,
  };
}

function validBody(overrides = {}) {
  return {
    title: 'Updated event',
    description: 'Updated description',
    date: futureDate().toISOString(),
    venue: 'Updated Hall',
    price: 35,
    capacity: 20,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mongoose.connection.readyState = 1;
  Event.countDocuments.mockResolvedValue(0);
  Event.find.mockReturnValue(makeQuery([]));
  Event.findById.mockResolvedValue(makeEvent());
  Event.create.mockImplementation(async (value) => makeEvent(value));
  Registration.countDocuments.mockResolvedValue(2);
  getReviewSummary.mockResolvedValue({
    averageRating: 4,
    reviewCount: 1,
    reviews: [],
  });
});

describe('eventController.listHostEvents', () => {
  test('rejects a missing or unsupported status', async () => {
    const res = makeResponse();

    await listHostEvents(makeRequest({ query: {} }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].message).toMatch(/status/i);
    expect(Event.find).not.toHaveBeenCalled();
  });

  test.each([
    [{ status: 'upcoming', page: '0' }],
    [{ status: 'upcoming', page: '1.5' }],
    [{ status: 'upcoming', page: ['1'] }],
    [{ status: 'upcoming', page: '100001' }],
    [{ status: 'upcoming', limit: '0' }],
    [{ status: 'upcoming', limit: '51' }],
    [{ status: 'upcoming', limit: 'abc' }],
  ])('rejects invalid pagination query %j', async (query) => {
    const res = makeResponse();

    await listHostEvents(makeRequest({ query }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(Event.find).not.toHaveBeenCalled();
  });

  test('returns 503 when MongoDB is unavailable', async () => {
    mongoose.connection.readyState = 0;
    const res = makeResponse();

    await listHostEvents(makeRequest({ query: { status: 'upcoming' } }), res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(Event.find).not.toHaveBeenCalled();
  });

  test('lists upcoming events with default pagination and a restricted projection', async () => {
    const event = {
      _id: EVENT_ID,
      title: 'Upcoming event',
      date: futureDate(),
      venue: 'Main Hall',
      description: 'not returned',
    };
    Event.countDocuments.mockResolvedValue(13);
    Event.find.mockReturnValue(makeQuery([event]));
    const res = makeResponse();

    await listHostEvents(
      makeRequest({ query: { status: 'upcoming' } }),
      res
    );

    expect(Event.countDocuments).toHaveBeenCalledWith(
      expect.objectContaining({
        hostId: HOST_ID,
        date: { $gte: expect.any(Date) },
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0]).toMatchObject({
      status: 'upcoming',
      page: 1,
      limit: 6,
      total: 13,
      totalPages: 3,
      events: [{
        id: EVENT_ID,
        title: 'Upcoming event',
        venue: 'Main Hall',
      }],
    });
  });

  test('lists past events using requested pagination and descending sort', async () => {
    const query = makeQuery([]);
    Event.find.mockReturnValue(query);
    const res = makeResponse();

    await listHostEvents(
      makeRequest({ query: { status: 'past', page: '2', limit: '5' } }),
      res
    );

    expect(query.sort).toHaveBeenCalledWith({ date: -1, _id: -1 });
    expect(query.skip).toHaveBeenCalledWith(5);
    expect(query.limit).toHaveBeenCalledWith(5);
    expect(res.json.mock.calls[0][0]).toMatchObject({
      status: 'past',
      page: 2,
      limit: 5,
      totalPages: 0,
    });
  });

  test('returns a safe error when listing fails', async () => {
    Event.countDocuments.mockRejectedValue(new Error('database detail'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = makeResponse();

    try {
      await listHostEvents(makeRequest({ query: { status: 'upcoming' } }), res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json.mock.calls[0][0].message).toMatch(/unable to load events/i);
    } finally {
      errorSpy.mockRestore();
    }
  });
});

describe('eventController.getHostEvent', () => {
  test('rejects an invalid event id', async () => {
    const res = makeResponse();

    await getHostEvent(makeRequest({ id: 'bad-id' }), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(Registration.countDocuments).not.toHaveBeenCalled();
  });

  test('returns 503 when MongoDB is unavailable', async () => {
    mongoose.connection.readyState = 0;
    const res = makeResponse();

    await getHostEvent(makeRequest(), res);

    expect(res.status).toHaveBeenCalledWith(503);
  });

  test('returns 404 when the event does not exist', async () => {
    Event.findById.mockResolvedValue(null);
    const res = makeResponse();

    await getHostEvent(makeRequest(), res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('prevents a host from reading another host event', async () => {
    Event.findById.mockResolvedValue(makeEvent({ hostId: 99 }));
    const res = makeResponse();

    await getHostEvent(makeRequest(), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(Registration.countDocuments).not.toHaveBeenCalled();
  });

  test('returns event details, registration count, and review summary', async () => {
    const res = makeResponse();

    await getHostEvent(makeRequest(), res);

    expect(Registration.countDocuments).toHaveBeenCalledWith({ eventId: EVENT_ID });
    expect(getReviewSummary).toHaveBeenCalledWith(EVENT_ID);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].event).toMatchObject({
      id: EVENT_ID,
      title: 'Test event',
      registeredCount: 2,
      averageRating: 4,
      reviewCount: 1,
    });
  });

  test('returns a safe error when event detail loading fails', async () => {
    Event.findById.mockRejectedValue(new Error('database detail'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = makeResponse();

    try {
      await getHostEvent(makeRequest(), res);
      expect(res.status).toHaveBeenCalledWith(500);
    } finally {
      errorSpy.mockRestore();
    }
  });
});

describe('eventController.createEvent', () => {
  test('rejects invalid event data and returns field errors', async () => {
    const res = makeResponse();

    await createEvent(makeRequest({ body: { title: '' } }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].errors).toHaveProperty('title');
    expect(Event.create).not.toHaveBeenCalled();
  });

  test('returns 503 when MongoDB is unavailable', async () => {
    mongoose.connection.readyState = 0;
    const res = makeResponse();

    await createEvent(makeRequest(), res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(Event.create).not.toHaveBeenCalled();
  });

  test('creates an event using the authenticated host id, not the request body', async () => {
    const res = makeResponse();
    const body = validBody({ hostId: 999, _id: 'attacker-controlled-id' });

    await createEvent(makeRequest({ body }), res);

    expect(Event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Updated event',
        hostId: HOST_ID,
      })
    );
    expect(Event.create.mock.calls[0][0]).not.toHaveProperty('_id');
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('returns a safe error when event creation fails', async () => {
    Event.create.mockRejectedValue(new Error('database detail'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = makeResponse();

    try {
      await createEvent(makeRequest(), res);
      expect(res.status).toHaveBeenCalledWith(500);
    } finally {
      errorSpy.mockRestore();
    }
  });
});

describe('eventController.updateEvent', () => {
  test('rejects an invalid event id', async () => {
    const res = makeResponse();

    await updateEvent(makeRequest({ id: 'bad-id' }), res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('returns 503 when MongoDB is unavailable', async () => {
    mongoose.connection.readyState = 0;
    const res = makeResponse();

    await updateEvent(makeRequest(), res);

    expect(res.status).toHaveBeenCalledWith(503);
  });

  test('returns 404 when the event does not exist', async () => {
    Event.findById.mockResolvedValue(null);
    const res = makeResponse();

    await updateEvent(makeRequest(), res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('prevents a host from updating another host event', async () => {
    Event.findById.mockResolvedValue(makeEvent({ hostId: 99 }));
    const res = makeResponse();

    await updateEvent(makeRequest(), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(Registration.countDocuments).not.toHaveBeenCalled();
  });

  test('rejects invalid update fields', async () => {
    const res = makeResponse();

    await updateEvent(makeRequest({ body: { title: '' } }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].errors).toHaveProperty('title');
  });

  test('does not reduce capacity below the existing registration count', async () => {
    Registration.countDocuments.mockResolvedValue(5);
    const res = makeResponse();

    await updateEvent(
      makeRequest({ body: validBody({ capacity: 4 }) }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].errors.capacity).toMatch(/5 attendee/i);
  });

  test('updates an owned event and returns its current registration count', async () => {
    const event = makeEvent();
    Event.findById.mockResolvedValue(event);
    Registration.countDocuments.mockResolvedValue(3);
    const res = makeResponse();
    const body = validBody({ capacity: 10 });

    await updateEvent(makeRequest({ body }), res);

    expect(event.set).toHaveBeenCalledWith(expect.objectContaining({
      title: body.title,
      capacity: 10,
    }));
    expect(event.save).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].event.registeredCount).toBe(3);
  });

  test('returns a safe error when saving the update fails', async () => {
    const event = makeEvent({ save: jest.fn().mockRejectedValue(new Error('database detail')) });
    Event.findById.mockResolvedValue(event);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = makeResponse();

    try {
      await updateEvent(makeRequest(), res);
      expect(res.status).toHaveBeenCalledWith(500);
    } finally {
      errorSpy.mockRestore();
    }
  });
});
