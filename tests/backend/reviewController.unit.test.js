jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    connection: { readyState: 1 },
    Types: actual.Types,
  };
});

jest.mock('../../../backend/models/Event', () => ({
  findById: jest.fn(),
}));

jest.mock('../../../backend/models/Registration', () => ({
  findOne: jest.fn(),
}));

jest.mock('../../../backend/models/Review', () => ({
  aggregate: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock('../../../backend/db', () => ({
  prepare: jest.fn(),
}));

const mongoose = require('mongoose');
const Event = require('../../../backend/models/Event');
const Registration = require('../../../backend/models/Registration');
const Review = require('../../../backend/models/Review');
const db = require('../../../backend/db');
const {
  getEventForReview,
  createReview,
  getReviewSummary,
} = require('../../../backend/controllers/reviewController');

const EVENT_ID = '507f1f77bcf86cd799439011';
const ATTENDEE_ID = 42;
const HOST_ID = 7;
const pastDate = () => new Date(Date.now() - 24 * 60 * 60 * 1000);
const futureDate = () => new Date(Date.now() + 24 * 60 * 60 * 1000);

function makeQuery(value) {
  return {
    sort: jest.fn().mockReturnThis(),
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

function makeRequest(options = {}) {
  const {
    id = EVENT_ID,
    role = 'attendee',
    userId = ATTENDEE_ID,
  } = options;
  const body = Object.prototype.hasOwnProperty.call(options, 'body')
    ? options.body
    : { rating: 5 };

  return {
    params: { id },
    user: { id: userId, role },
    body,
  };
}

function makeEvent(overrides = {}) {
  return {
    _id: new mongoose.Types.ObjectId(EVENT_ID),
    hostId: HOST_ID,
    title: 'Past event',
    description: 'Event description',
    date: pastDate(),
    venue: 'Main Hall',
    price: 10,
    capacity: 100,
    ...overrides,
  };
}

function expectResponse(res, status, body) {
  expect(res.status).toHaveBeenCalledWith(status);
  expect(res.json).toHaveBeenCalledWith(body);
}

beforeEach(() => {
  jest.clearAllMocks();
  mongoose.connection.readyState = 1;
  Event.findById.mockResolvedValue(makeEvent());
  Review.aggregate.mockResolvedValue([]);
  Review.find.mockReturnValue(makeQuery([]));
  Registration.findOne.mockReturnValue(makeQuery({ _id: 'registration-id' }));
  Review.findOne.mockReturnValue(makeQuery(null));
  Review.create.mockResolvedValue({
    rating: 5,
    comment: 'Good event',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  });
  db.prepare.mockReturnValue({
    get: jest.fn().mockReturnValue({ name: 'Test Attendee' }),
  });
});

describe('reviewController.getReviewSummary', () => {
  test('returns the rounded average, count, and latest visible reviews', async () => {
    const reviews = [{ rating: 5 }, { rating: 4 }];
    Review.aggregate.mockResolvedValue([
      { averageRating: 4.125, reviewCount: 8 },
    ]);
    Review.find.mockReturnValue(makeQuery(reviews));

    await expect(getReviewSummary(EVENT_ID)).resolves.toEqual({
      averageRating: 4.13,
      reviewCount: 8,
      reviews,
    });

    expect(Review.aggregate).toHaveBeenCalledTimes(1);
    expect(Review.find).toHaveBeenCalledWith({ eventId: EVENT_ID });
  });

  test('returns null average and zero count when there are no reviews', async () => {
    Review.aggregate.mockResolvedValue([]);
    Review.find.mockReturnValue(makeQuery([]));

    await expect(getReviewSummary(EVENT_ID)).resolves.toEqual({
      averageRating: null,
      reviewCount: 0,
      reviews: [],
    });
  });
});

describe('reviewController.getEventForReview', () => {
  test('returns 404 for an invalid event id without querying the database', async () => {
    const res = makeResponse();

    await getEventForReview(makeRequest({ id: 'not-an-object-id' }), res);

    expectResponse(res, 404, { message: 'Event not found.' });
    expect(Event.findById).not.toHaveBeenCalled();
  });

  test('returns 503 when MongoDB is unavailable', async () => {
    mongoose.connection.readyState = 0;
    const res = makeResponse();

    await getEventForReview(makeRequest(), res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(Event.findById).not.toHaveBeenCalled();
  });

  test('returns 404 when the event does not exist', async () => {
    Event.findById.mockResolvedValue(null);
    const res = makeResponse();

    await getEventForReview(makeRequest(), res);

    expectResponse(res, 404, { message: 'Event not found.' });
  });

  test('prevents a host from reading another host event', async () => {
    const res = makeResponse();

    await getEventForReview(makeRequest({ role: 'host', userId: 999 }), res);

    expectResponse(res, 403, {
      message: 'You can only access your own events.',
    });
    expect(Review.aggregate).not.toHaveBeenCalled();
  });

  test('returns the public event and review summary to its owning host', async () => {
    const event = makeEvent();
    Event.findById.mockResolvedValue(event);
    Review.aggregate.mockResolvedValue([
      { averageRating: 4.5, reviewCount: 2 },
    ]);
    Review.find.mockReturnValue(makeQuery([{ rating: 5 }, { rating: 4 }]));
    const res = makeResponse();

    await getEventForReview(
      makeRequest({ role: 'host', userId: HOST_ID }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0].event;
    expect(payload).toMatchObject({
      id: EVENT_ID,
      title: event.title,
      description: event.description,
      venue: event.venue,
      averageRating: 4.5,
      reviewCount: 2,
      canReview: false,
      hasReviewed: false,
    });
    expect(Registration.findOne).not.toHaveBeenCalled();
  });

  test('marks a registered attendee eligible when the event is past and not yet reviewed', async () => {
    const res = makeResponse();

    await getEventForReview(makeRequest(), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].event).toMatchObject({
      canReview: true,
      hasReviewed: false,
    });
    expect(Registration.findOne).toHaveBeenCalledWith({
      eventId: expect.any(mongoose.Types.ObjectId),
      attendeeId: ATTENDEE_ID,
    });
  });

  test('marks an attendee as already reviewed and not eligible', async () => {
    Review.findOne.mockReturnValue(makeQuery({ _id: 'existing-review' }));
    const res = makeResponse();

    await getEventForReview(makeRequest(), res);

    expect(res.json.mock.calls[0][0].event).toMatchObject({
      canReview: false,
      hasReviewed: true,
    });
  });

  test('does not mark an unregistered attendee eligible', async () => {
    Registration.findOne.mockReturnValue(makeQuery(null));
    const res = makeResponse();

    await getEventForReview(makeRequest(), res);

    expect(res.json.mock.calls[0][0].event).toMatchObject({
      canReview: false,
      hasReviewed: false,
    });
  });

  test('does not perform eligibility lookups for an upcoming event', async () => {
    Event.findById.mockResolvedValue(makeEvent({ date: futureDate() }));
    const res = makeResponse();

    await getEventForReview(makeRequest(), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(Registration.findOne).not.toHaveBeenCalled();
    expect(Review.findOne).not.toHaveBeenCalled();
  });

  test('returns a safe server error when event or review lookup throws', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    Event.findById.mockRejectedValue(new Error('database detail'));
    const res = makeResponse();

    try {
      await getEventForReview(makeRequest(), res);
      expectResponse(res, 500, {
        message: 'Unable to load event reviews. Please try again.',
      });
    } finally {
      errorSpy.mockRestore();
    }
  });
});

describe('reviewController.createReview', () => {
  test('returns 404 for an invalid event id', async () => {
    const res = makeResponse();

    await createReview(makeRequest({ id: 'bad-id' }), res);

    expectResponse(res, 404, { message: 'Event not found.' });
  });

  test.each([undefined, null, '5', true, 0, 6, 2.5])(
    'rejects invalid rating %j',
    async (rating) => {
      const res = makeResponse();

      await createReview(makeRequest({ body: { rating } }), res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json.mock.calls[0][0].message).toMatch(/integer from 1 to 5/);
      expect(Event.findById).not.toHaveBeenCalled();
    }
  );

  test('rejects a non-text comment', async () => {
    const res = makeResponse();

    await createReview(makeRequest({ body: { rating: 5, comment: { text: 'x' } } }), res);

    expectResponse(res, 400, { message: 'Comment must be text.' });
  });

  test('rejects a comment longer than 1000 characters', async () => {
    const res = makeResponse();

    await createReview(makeRequest({ body: { rating: 5, comment: 'x'.repeat(1001) } }), res);

    expectResponse(res, 400, {
      message: 'Comment cannot exceed 1000 characters.',
    });
  });

  test('accepts an omitted request body as a validation error', async () => {
    const res = makeResponse();

    await createReview(makeRequest({ body: undefined }), res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 503 when MongoDB is unavailable', async () => {
    mongoose.connection.readyState = 0;
    const res = makeResponse();

    await createReview(makeRequest(), res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(Event.findById).not.toHaveBeenCalled();
  });

  test('returns 404 when the event does not exist', async () => {
    Event.findById.mockResolvedValue(null);
    const res = makeResponse();

    await createReview(makeRequest(), res);

    expectResponse(res, 404, { message: 'Event not found.' });
  });

  test('rejects a review before the event has ended', async () => {
    Event.findById.mockResolvedValue(makeEvent({ date: futureDate() }));
    const res = makeResponse();

    await createReview(makeRequest(), res);

    expectResponse(res, 400, {
      message: 'You can review an event only after it has ended.',
    });
  });

  test('rejects an attendee who did not register for the event', async () => {
    Registration.findOne.mockReturnValue(makeQuery(null));
    const res = makeResponse();

    await createReview(makeRequest(), res);

    expectResponse(res, 403, {
      message: 'You can review only past events you registered for.',
    });
    expect(Review.findOne).not.toHaveBeenCalled();
  });

  test('rejects a second review by the same attendee', async () => {
    Review.findOne.mockReturnValue(makeQuery({ _id: 'existing-review' }));
    const res = makeResponse();

    await createReview(makeRequest(), res);

    expectResponse(res, 409, {
      message: 'You have already reviewed this event.',
    });
  });

  test('creates a review with a trimmed comment and the attendee name', async () => {
    Review.create.mockResolvedValue({
      rating: 4,
      comment: 'Good event',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    const res = makeResponse();

    await createReview(
      makeRequest({ body: { rating: 4, comment: '  Good event  ' } }),
      res
    );

    expect(Review.create).toHaveBeenCalledWith({
      eventId: expect.any(mongoose.Types.ObjectId),
      attendeeId: ATTENDEE_ID,
      attendeeName: 'Test Attendee',
      rating: 4,
      comment: 'Good event',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json.mock.calls[0][0]).toMatchObject({
      message: 'Review submitted successfully.',
      review: { rating: 4, comment: 'Good event' },
      reviewSummary: { averageRating: null, reviewCount: 0, reviews: [] },
    });
  });

  test('uses the fallback attendee name when the SQLite user record is absent', async () => {
    db.prepare.mockReturnValue({ get: jest.fn().mockReturnValue(undefined) });
    const res = makeResponse();

    await createReview(makeRequest({ body: { rating: 5, comment: null } }), res);

    expect(Review.create).toHaveBeenCalledWith(
      expect.objectContaining({ attendeeName: 'Attendee', comment: '' })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('returns 409 for a concurrent duplicate rejected by the unique index', async () => {
    Review.create.mockRejectedValue({ code: 11000, message: 'duplicate key' });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = makeResponse();

    try {
      await createReview(makeRequest(), res);
      expectResponse(res, 409, {
        message: 'You have already reviewed this event.',
      });
    } finally {
      errorSpy.mockRestore();
    }
  });

  test('returns a safe server error for unexpected database failures', async () => {
    Event.findById.mockRejectedValue(new Error('database detail'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = makeResponse();

    try {
      await createReview(makeRequest(), res);
      expectResponse(res, 500, {
        message: 'Unable to submit your review. Please try again.',
      });
    } finally {
      errorSpy.mockRestore();
    }
  });
});
