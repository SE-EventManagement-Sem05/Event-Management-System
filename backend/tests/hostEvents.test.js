const request = require('supertest');

const { createUserAndLogin } = require('./helpers');
const { startTestServer } = require('./support/testServer');
const { resolveTestMongoUri } = require('./support/testMongoUri');
const { runDbTool } = require('./support/runDbTool');

const DAY_MS = 24 * 60 * 60 * 1000;
const URL = '/api/host/events';

// These tests run the real application (node server.js) as its own process,
// connected to the same MongoDB server as the app but to a separate "ems_test"
// database, and talk to it over HTTP.
let mongoUri;
let server;
let hostA;
let hostB;
let hostEmpty;

function get(path, token) {
  const req = request(server.baseUrl).get(path);
  return token ? req.set('Authorization', `Bearer ${token}`) : req;
}

function makeEvents(hostId, label, upcoming, past) {
  const now = Date.now();
  const docs = [];

  for (let i = 1; i <= upcoming; i += 1) {
    docs.push({
      hostId,
      title: `${label} Upcoming ${i}`,
      venue: `Venue ${i}`,
      date: new Date(now + i * DAY_MS).toISOString(),
    });
  }
  for (let i = 1; i <= past; i += 1) {
    docs.push({
      hostId,
      title: `${label} Past ${i}`,
      venue: `Venue ${i}`,
      date: new Date(now - i * DAY_MS).toISOString(),
    });
  }

  return docs;
}

beforeAll(async () => {
  mongoUri = resolveTestMongoUri();
  server = await startTestServer({ mongoUri });

  hostA = await createUserAndLogin(server.baseUrl, { role: 'host' });
  hostB = await createUserAndLogin(server.baseUrl, { role: 'host' });
  hostEmpty = await createUserAndLogin(server.baseUrl, { role: 'host' });

  runDbTool(mongoUri, 'reset');
  runDbTool(mongoUri, 'insertEvents', [
    ...makeEvents(hostA.id, 'A', 8, 7),
    ...makeEvents(hostB.id, 'B', 2, 1),
  ]);
}, 180000);

afterAll(async () => {
  try {
    if (mongoUri) runDbTool(mongoUri, 'reset');
  } finally {
    if (server) await server.stop();
  }
}, 120000);

describe('EMS-FR-05 listing', () => {
  test('upcoming returns only the logged-in host events, soonest first', async () => {
    const response = await get(`${URL}?status=upcoming&limit=50`, hostA.token).expect(200);
    const { events, total } = response.body;

    expect(total).toBe(8);
    expect(events).toHaveLength(8);
    expect(events.every((e) => e.title.startsWith('A Upcoming'))).toBe(true);

    const times = events.map((e) => new Date(e.date).getTime());
    expect(times).toEqual([...times].sort((x, y) => x - y));
    expect(times.every((t) => t >= Date.now() - 1000)).toBe(true);
  });

  test('past returns only the logged-in host events, most recent first', async () => {
    const response = await get(`${URL}?status=past&limit=50`, hostA.token).expect(200);
    const { events, total } = response.body;

    expect(total).toBe(7);
    expect(events.every((e) => e.title.startsWith('A Past'))).toBe(true);

    const times = events.map((e) => new Date(e.date).getTime());
    expect(times).toEqual([...times].sort((x, y) => y - x));
    expect(times.every((t) => t < Date.now())).toBe(true);
  });

  test('another host never sees these events and vice versa', async () => {
    const response = await get(`${URL}?status=upcoming&limit=50`, hostB.token).expect(200);

    expect(response.body.total).toBe(2);
    expect(response.body.events.every((e) => e.title.startsWith('B '))).toBe(true);
  });

  test('a hostId in the query string is ignored', async () => {
    const response = await get(`${URL}?status=upcoming&hostId=${hostA.id}`, hostB.token).expect(200);

    expect(response.body.total).toBe(2);
  });

  test('each event exposes only id, title, date and venue', async () => {
    const response = await get(`${URL}?status=upcoming&limit=1`, hostA.token).expect(200);

    expect(Object.keys(response.body.events[0]).sort()).toEqual(['date', 'id', 'title', 'venue']);
  });

  test('empty state: a host with no events gets an empty page', async () => {
    for (const status of ['upcoming', 'past']) {
      const response = await get(`${URL}?status=${status}`, hostEmpty.token).expect(200);

      expect(response.body).toMatchObject({ events: [], total: 0, totalPages: 0, page: 1 });
    }
  });
});

describe('EMS-FR-05 pagination', () => {
  test('defaults to 6 per page', async () => {
    const response = await get(`${URL}?status=upcoming`, hostA.token).expect(200);

    expect(response.body.limit).toBe(6);
    expect(response.body.events).toHaveLength(6);
    expect(response.body.totalPages).toBe(2);
  });

  test('pages are complete, in order and never repeat an event', async () => {
    const seen = [];

    for (let page = 1; page <= 3; page += 1) {
      const response = await get(`${URL}?status=upcoming&limit=3&page=${page}`, hostA.token).expect(200);

      expect(response.body.totalPages).toBe(3);
      seen.push(...response.body.events.map((e) => e.id));
    }

    expect(seen).toHaveLength(8);
    expect(new Set(seen).size).toBe(8);
  });

  test('the last page holds the remainder', async () => {
    const response = await get(`${URL}?status=upcoming&limit=3&page=3`, hostA.token).expect(200);

    expect(response.body.events).toHaveLength(2);
  });

  test('a page beyond the end is empty but keeps the totals', async () => {
    const response = await get(`${URL}?status=upcoming&limit=3&page=10`, hostA.token).expect(200);

    expect(response.body.events).toEqual([]);
    expect(response.body.total).toBe(8);
    expect(response.body.totalPages).toBe(3);
  });
});

describe('EMS-FR-05 reliability', () => {
  test('handles 30 simultaneous requests', async () => {
    const responses = await Promise.all(
      Array.from({ length: 30 }, () => get(`${URL}?status=past&limit=6`, hostA.token))
    );

    expect(responses.every((r) => r.status === 200)).toBe(true);
    expect(new Set(responses.map((r) => r.body.total)).size).toBe(1);
  }, 30000);

  test('the running server reports MongoDB as connected', () => {
    expect(server.getOutput()).toContain('MongoDB connected');
  });
});