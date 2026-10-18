const request = require('supertest');

const { createUserAndLogin } = require('./helpers');
const { startTestServer } = require('./support/testServer');
const { resolveTestMongoUri } = require('./support/testMongoUri');
const { runDbTool } = require('./support/runDbTool');

jest.setTimeout(120000);

const DAY_MS = 24 * 60 * 60 * 1000;
const URL = '/api/events';

let mongoUri;
let server;
let host;
let attendeeA;
let attendeeB;
let unregisteredAttendee;
let ids;

const db = (command, payload) => runDbTool(mongoUri, command, payload);

function get(path, token) {
  const req = request(server.baseUrl).get(path);
  return token ? req.set('Authorization', `Bearer ${token}`) : req;
}

function post(path, token, body) {
  const req = request(server.baseUrl).post(path);
  if (token) req.set('Authorization', `Bearer ${token}`);
  return body === undefined ? req : req.send(body);
}

beforeAll(async () => {
  mongoUri = resolveTestMongoUri();
  server = await startTestServer({ mongoUri });

  host = await createUserAndLogin(server.baseUrl, { role: 'host' });
  attendeeA = await createUserAndLogin(server.baseUrl, {
    role: 'attendee',
  });
  attendeeB = await createUserAndLogin(server.baseUrl, {
    role: 'attendee',
  });
  unregisteredAttendee = await createUserAndLogin(server.baseUrl, {
    role: 'attendee',
  });
}, 300000);

beforeEach(async () => {
  await db('reset');

  const inserted = await db('insertEvents', [
    {
      hostId: host.id,
      title: 'Past Review Event',
      description: 'An event that has ended.',
      venue: 'Hall A',
      date: new Date(Date.now() - 3 * DAY_MS).toISOString(),
      price: 100,
      capacity: 100,
    },
    {
      hostId: host.id,
      title: 'Upcoming Review Event',
      description: 'An event that has not happened yet.',
      venue: 'Hall B',
      date: new Date(Date.now() + 3 * DAY_MS).toISOString(),
      price: 100,
      capacity: 100,
    },
  ]);

  ids = {
    past: inserted.ids[0],
    upcoming: inserted.ids[1],
  };

  await db('insertRegistrations', [
    {
      eventId: ids.past,
      count: 1,
      firstAttendeeId: attendeeA.id,
    },
    {
      eventId: ids.upcoming,
      count: 1,
      firstAttendeeId: attendeeA.id,
    },
    {
      eventId: ids.past,
      count: 1,
      firstAttendeeId: attendeeB.id,
    },
  ]);
});

afterAll(async () => {
  try {
    if (mongoUri) await db('reset');
  } finally {
    if (server) await server.stop();
  }
}, 120000);

describe('EMS-FR-12 review authorization', () => {
  test('review submission requires authentication', async () => {
    await post(`${URL}/${ids.past}/reviews`, undefined, {
      rating: 5,
      comment: 'Excellent event',
    }).expect(401);
  });

  test('a host cannot submit an attendee review', async () => {
    await post(`${URL}/${ids.past}/reviews`, host.token, {
      rating: 5,
    }).expect(403);
  });

  test('an attendee who did not register cannot review a past event', async () => {
    const response = await post(
      `${URL}/${ids.past}/reviews`,
      unregisteredAttendee.token,
      { rating: 5 }
    ).expect(403);

    expect(response.body.message).toMatch(/registered for/i);
  });

  test('a registered attendee cannot review an upcoming event', async () => {
    const response = await post(
      `${URL}/${ids.upcoming}/reviews`,
      attendeeA.token,
      { rating: 5 }
    ).expect(400);

    expect(response.body.message).toMatch(/after it has ended/i);
  });
});

describe('EMS-FR-12 input validation', () => {
  test.each([0, 6, 2.5, '5', null])(
    'rating %j is rejected',
    async (rating) => {
      const response = await post(
        `${URL}/${ids.past}/reviews`,
        attendeeA.token,
        { rating }
      ).expect(400);

      expect(response.body.message).toMatch(/integer from 1 to 5/i);
    }
  );

  test('a non-text comment is rejected', async () => {
    await post(
      `${URL}/${ids.past}/reviews`,
      attendeeA.token,
      { rating: 5, comment: { text: 'not a string' } }
    ).expect(400);
  });

  test('a comment longer than 1000 characters is rejected', async () => {
    await post(
      `${URL}/${ids.past}/reviews`,
      attendeeA.token,
      { rating: 5, comment: 'a'.repeat(1001) }
    ).expect(400);
  });
});

describe('EMS-FR-12 review creation and summaries', () => {
  test('a registered attendee can submit a rating with an optional comment', async () => {
    const response = await post(
      `${URL}/${ids.past}/reviews`,
      attendeeA.token,
      { rating: 5, comment: 'Very well organised.' }
    ).expect(201);

    expect(response.body.message).toBe('Review submitted successfully.');
    expect(response.body.review.rating).toBe(5);
    expect(response.body.review.comment).toBe('Very well organised.');
    expect(response.body.reviewSummary.averageRating).toBe(5);
    expect(response.body.reviewSummary.reviewCount).toBe(1);
  });

  test('a rating can be submitted without a comment', async () => {
    const response = await post(
      `${URL}/${ids.past}/reviews`,
      attendeeA.token,
      { rating: 4 }
    ).expect(201);

    expect(response.body.review.rating).toBe(4);
    expect(response.body.review.comment).toBe('');
  });

  test('the same attendee cannot review the same event twice', async () => {
    await post(`${URL}/${ids.past}/reviews`, attendeeA.token, {
      rating: 5,
    }).expect(201);

    const response = await post(
      `${URL}/${ids.past}/reviews`,
      attendeeA.token,
      { rating: 4 }
    ).expect(409);

    expect(response.body.message).toMatch(/already reviewed/i);
  });

  test('event details show the average rating and submitted reviews', async () => {
    await post(`${URL}/${ids.past}/reviews`, attendeeA.token, {
      rating: 5,
      comment: 'Excellent.',
    }).expect(201);

    await post(`${URL}/${ids.past}/reviews`, attendeeB.token, {
      rating: 3,
      comment: 'It was good.',
    }).expect(201);

    const response = await get(`${URL}/${ids.past}`, attendeeA.token)
      .expect(200);

    expect(response.body.event.averageRating).toBe(4);
    expect(response.body.event.reviewCount).toBe(2);
    expect(response.body.event.reviews).toHaveLength(2);
    expect(response.body.event.hasReviewed).toBe(true);
    expect(response.body.event.canReview).toBe(false);
  });

  test('a registered attendee is eligible before submitting a review', async () => {
    const response = await get(
      `${URL}/${ids.past}`,
      attendeeA.token
    ).expect(200);

    expect(response.body.event.canReview).toBe(true);
    expect(response.body.event.hasReviewed).toBe(false);
    expect(response.body.event.averageRating).toBeNull();
    expect(response.body.event.reviewCount).toBe(0);
  });
});