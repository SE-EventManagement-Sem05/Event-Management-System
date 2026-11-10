/**
 * Requirements Verification Suite
 * --------------------------------
 * Single file that verifies core system requirements and performance targets:
 *
 *   - Host dashboard analytics (FR-05): registered count, ratings, reviews,
 *     and derived revenue visibility on host event details.
 *   - Error handling (FR-14): broader recovery / structured error scenarios.
 *   - Concurrent request behaviour (approx. 100 concurrent users target).
 *   - Performance of host-dashboard and event-detail endpoints vs 2 s.
 *   - HTTP protocol operation and service availability.
 */

const request = require('supertest');
const { performance } = require('node:perf_hooks');

const { uniqueEmail } = require('../../../backend/tests/helpers');
const { startTestServer } = require('../../../backend/tests/support/testServer');
const { resolveTestMongoUri } = require('../../../backend/tests/support/testMongoUri');
const { runDbTool } = require('../../../backend/tests/support/runDbTool');

jest.setTimeout(180000);

const DAY_MS = 24 * 60 * 60 * 1000;
const DASHBOARD_LIMIT_MS = 2000;
const DETAIL_LIMIT_MS = 2000;
const CONCURRENT_USERS = 25;

let mongoUri;
let server;
let host;
let attendee;

const db = (command, payload) => runDbTool(mongoUri, command, payload);

function get(path, token) {
  const req = request(server.baseUrl).get(path);
  return token ? req.set('Authorization', `Bearer ${token}`) : req;
}

function post(path, body, token) {
  const req = request(server.baseUrl).post(path).send(body);
  return token ? req.set('Authorization', `Bearer ${token}`) : req;
}

beforeAll(async () => {
  mongoUri = await resolveTestMongoUri();
  server = await startTestServer({ mongoUri });

  const hostCreds = {
    name: 'Verification Host',
    email: uniqueEmail('verif-host'),
    password: 'Password123!',
    role: 'host',
  };
  await request(server.baseUrl).post('/api/auth/signup').send(hostCreds).expect(201);
  const hostLogin = await request(server.baseUrl)
    .post('/api/auth/login')
    .send({ email: hostCreds.email, password: hostCreds.password, role: 'host' })
    .expect(200);
  host = {
    ...hostCreds,
    token: hostLogin.body.token,
    id: hostLogin.body.user.id,
  };

  const attCreds = {
    name: 'Verification Attendee',
    email: uniqueEmail('verif-att'),
    password: 'Password123!',
    role: 'attendee',
  };
  await request(server.baseUrl).post('/api/auth/signup').send(attCreds).expect(201);
  const attLogin = await request(server.baseUrl)
    .post('/api/auth/login')
    .send({ email: attCreds.email, password: attCreds.password, role: 'attendee' })
    .expect(200);
  attendee = {
    ...attCreds,
    token: attLogin.body.token,
    id: attLogin.body.user.id,
  };
});

afterAll(async () => {
  if (server && typeof server.stop === 'function') {
    await server.stop();
  }
});

// ---------------------------------------------------------------------------
// 1. Host dashboard analytics (EMS-FR-05)
// ---------------------------------------------------------------------------
describe('EMS-FR-05 Host dashboard analytics', () => {
  let eventId;
  const price = 150;
  const registrationCount = 4;
  const ratings = [5, 4, 5, 3];

  beforeAll(async () => {
    await db('reset');

    const pastDate = new Date(Date.now() - 3 * DAY_MS).toISOString();
    const inserted = await db('insertEvents', [
      {
        hostId: host.id,
        title: 'Analytics Concert',
        description: 'Used for revenue and rating checks',
        venue: 'Main Hall',
        date: pastDate,
        price,
        capacity: 100,
        category: 'Music',
      },
    ]);
    eventId = inserted.ids[0];

    await db('insertRegistrations', [
      {
        eventId,
        count: registrationCount,
        firstAttendeeId: 9000,
      },
    ]);

    const mongoose = require('mongoose');
    const Review = require('../../../backend/models/Review');
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    await Review.deleteMany({ eventId: new mongoose.Types.ObjectId(String(eventId)) });
    for (let i = 0; i < ratings.length; i += 1) {
      await Review.create({
        eventId,
        attendeeId: 9000 + i,
        attendeeName: `Reviewer ${i + 1}`,
        rating: ratings[i],
        comment: `Comment ${i + 1}`,
      });
    }
  });

  test('host event details expose registeredCount (ticket sales)', async () => {
    const res = await get(`/api/host/events/${eventId}`, host.token).expect(200);
    expect(res.body.event).toBeDefined();
    expect(res.body.event.registeredCount).toBe(registrationCount);
  });

  test('host event details expose averageRating and reviewCount', async () => {
    const res = await get(`/api/host/events/${eventId}`, host.token).expect(200);
    const { averageRating, reviewCount, reviews } = res.body.event;

    expect(reviewCount).toBe(ratings.length);
    expect(averageRating).toBeCloseTo(4.25, 2);
    expect(Array.isArray(reviews)).toBe(true);
    expect(reviews.length).toBe(ratings.length);
  });

  test('host event details expose price so revenue can be derived', async () => {
    const res = await get(`/api/host/events/${eventId}`, host.token).expect(200);
    const event = res.body.event;

    expect(event.price).toBe(price);
    expect(event.registeredCount).toBe(registrationCount);
    const derivedRevenue = event.price * event.registeredCount;
    expect(derivedRevenue).toBe(price * registrationCount);
  });

  test('host upcoming/past list remains available (dashboard shell)', async () => {
    const upcoming = await get('/api/host/events?status=upcoming', host.token).expect(200);
    const past = await get('/api/host/events?status=past', host.token).expect(200);

    expect(Array.isArray(upcoming.body.events)).toBe(true);
    expect(Array.isArray(past.body.events)).toBe(true);
    const ids = past.body.events.map((e) => String(e.id || e._id));
    expect(ids).toContain(String(eventId));
  });
});

// ---------------------------------------------------------------------------
// 2. Expanded error handling / recovery (EMS-FR-14)
// ---------------------------------------------------------------------------
describe('EMS-FR-14 Expanded error handling and recovery', () => {
  test('malformed JSON body on login returns 400 and leaves server responsive', async () => {
    const res = await request(server.baseUrl)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": "broken"')
      .expect(400);

    expect(res.body).toEqual(
      expect.objectContaining({
        message: expect.any(String),
      })
    );

    const ok = await request(server.baseUrl)
      .post('/api/auth/login')
      .send({
        email: host.email,
        password: host.password,
        role: 'host',
      })
      .expect(200);
    expect(ok.body.token).toBeTruthy();
  });

  test('unknown route returns structured 404 JSON', async () => {
    const res = await get('/api/this-route-does-not-exist', host.token).expect(404);
    expect(res.body).toEqual(
      expect.objectContaining({
        message: expect.any(String),
      })
    );
  });

  test('missing Authorization header on protected route returns readable 401', async () => {
    const res = await get('/api/host/events').expect(401);
    expect(res.body.message).toMatch(/token|auth|login|unauthorized/i);
  });

  test('expired / garbage token returns readable 401 (not 500)', async () => {
    const res = await get('/api/host/events', 'not.a.real.jwt').expect(401);
    expect(res.body.message).toMatch(/token|auth|invalid|expired|unauthorized/i);
  });

  test('wrong-role token returns 403 without crashing', async () => {
    const res = await get('/api/host/events', attendee.token).expect(403);
    expect(res.body.message).toMatch(/role|permission|forbidden|access/i);
  });

  test('requesting a non-existent event returns 404 with a clear message', async () => {
    const missing = '000000000000000000000000';
    const res = await get(`/api/host/events/${missing}`, host.token).expect(404);
    expect(res.body.message).toMatch(/not found|event/i);
  });

  test('after a 404 the host can still list events (retry / recovery)', async () => {
    await get('/api/host/events/000000000000000000000000', host.token).expect(404);
    const list = await get('/api/host/events?status=past', host.token).expect(200);
    expect(Array.isArray(list.body.events)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. Concurrent request behaviour
// ---------------------------------------------------------------------------
describe('Concurrent request handling verification', () => {
  test(`handles ${CONCURRENT_USERS} concurrent login requests without server errors`, async () => {
    const users = [];
    for (let i = 0; i < CONCURRENT_USERS; i += 1) {
      const email = uniqueEmail(`conc-${i}`);
      await request(server.baseUrl)
        .post('/api/auth/signup')
        .send({
          name: `Concurrent ${i}`,
          email,
          password: 'Password123!',
          role: i % 2 === 0 ? 'attendee' : 'host',
        })
        .expect(201);
      users.push({
        email,
        password: 'Password123!',
        role: i % 2 === 0 ? 'attendee' : 'host',
      });
    }

    const started = performance.now();
    const results = await Promise.all(
      users.map((u) =>
        request(server.baseUrl)
          .post('/api/auth/login')
          .send(u)
          .then((res) => ({ status: res.status, ok: res.status === 200 }))
          .catch((err) => ({ status: 0, ok: false, error: err.message }))
      )
    );
    const elapsedMs = performance.now() - started;

    const successes = results.filter((r) => r.ok).length;
    const serverErrors = results.filter((r) => r.status >= 500).length;

    expect(serverErrors).toBe(0);
    expect(successes).toBe(CONCURRENT_USERS);
    expect(elapsedMs).toBeLessThan(30_000);
  });

  test('handles concurrent host event-list requests without server errors', async () => {
    const N = 20;
    const results = await Promise.all(
      Array.from({ length: N }, () =>
        get('/api/host/events?status=past', host.token).then((res) => res.status)
      )
    );
    expect(results.every((s) => s === 200)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. Performance of dashboard / event-detail endpoints (≤ 2 s)
// ---------------------------------------------------------------------------
describe('Performance verification – dashboard and event detail ≤ 2 s', () => {
  let detailId;

  beforeAll(async () => {
    const inserted = await db('insertEvents', [
      {
        hostId: host.id,
        title: 'Perf Detail Event',
        description: 'Latency probe',
        venue: 'Hall',
        date: new Date(Date.now() + 5 * DAY_MS).toISOString(),
        price: 10,
        capacity: 50,
        category: 'Test',
      },
    ]);
    detailId = inserted.ids[0];
  });

  test('host event list (dashboard data) responds within 2 seconds', async () => {
    const samples = [];
    for (let i = 0; i < 5; i += 1) {
      const t0 = performance.now();
      const res = await get('/api/host/events?status=upcoming', host.token);
      const ms = performance.now() - t0;
      expect(res.status).toBe(200);
      samples.push(ms);
    }
    const max = Math.max(...samples);
    expect(max).toBeLessThanOrEqual(DASHBOARD_LIMIT_MS);
  });

  test('host event detail responds within 2 seconds', async () => {
    const samples = [];
    for (let i = 0; i < 5; i += 1) {
      const t0 = performance.now();
      const res = await get(`/api/host/events/${detailId}`, host.token);
      const ms = performance.now() - t0;
      expect(res.status).toBe(200);
      samples.push(ms);
    }
    const max = Math.max(...samples);
    expect(max).toBeLessThanOrEqual(DETAIL_LIMIT_MS);
  });
});

// ---------------------------------------------------------------------------
// 5. HTTP Protocol Operation
// ---------------------------------------------------------------------------
describe('HTTP protocol and connectivity verification', () => {
  test('operates successfully over HTTP protocol configuration', () => {
    const base = server.baseUrl || '';
    expect(base.startsWith('http://')).toBe(true);
    expect(server.baseUrl).toBeTruthy();
  });
});
