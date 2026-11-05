
const request = require('supertest');

const { createUserAndLogin } = require('./helpers');
const { startTestServer } = require('./support/testServer');
const { resolveTestMongoUri } = require('./support/testMongoUri');
const { runDbTool } = require('./support/runDbTool');

jest.setTimeout(120000);

const DAY_MS = 24 * 60 * 60 * 1000;
const URL = '/api/attendee/events';

let mongoUri;
let server;
let attendee;
let host;
let ids;

const db = (command, payload) => runDbTool(mongoUri, command, payload);

function get(path, token) {
  const req = request(server.baseUrl).get(path);
  return token ? req.set('Authorization', `Bearer ${token}`) : req;
}

function eventSpec(overrides = {}) {
  return {
    hostId: host.id,
    title: 'Attendee Event',
    description: 'Attendee event description',
    venue: 'PES University',
    price: 0,
    capacity: 100,
    date: new Date(Date.now() + 5 * DAY_MS).toISOString(),
    ...overrides,
  };
}

beforeAll(async () => {
  mongoUri = resolveTestMongoUri();
  server = await startTestServer({ mongoUri });

  attendee = await createUserAndLogin(server.baseUrl, {
    role: 'attendee',
  });

  host = await createUserAndLogin(server.baseUrl, {
    role: 'host',
  });

  db('reset');

  const specs = [
    eventSpec({ title: 'Upcoming A', date: new Date(Date.now() + 2 * DAY_MS).toISOString() }),
    eventSpec({ title: 'Upcoming B', date: new Date(Date.now() + 5 * DAY_MS).toISOString() }),
    eventSpec({ title: 'Past A', date: new Date(Date.now() - 2 * DAY_MS).toISOString() }),
    eventSpec({ title: 'Past B', date: new Date(Date.now() - 5 * DAY_MS).toISOString() }),
  ];

  const inserted = db('insertEvents', specs);
  ids = inserted.ids;
}, 300000);

afterAll(async () => {
  try {
    if (mongoUri) db('reset');
  } finally {
    if (server) await server.stop();
  }
}, 120000);

describe('EMS-FR-08 attendee views upcoming and past events', () => {
  test('attendee can view upcoming events in ascending date order', async () => {
    const response = await get(`${URL}?status=upcoming`, attendee.token);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('upcoming');
    expect(response.body.events).toHaveLength(2);

    const dates = response.body.events.map((event) => new Date(event.date).getTime());
    expect(dates).toEqual([...dates].sort((a, b) => a - b));
  });

  test('attendee can view past events in descending date order', async () => {
    const response = await get(`${URL}?status=past`, attendee.token);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('past');
    expect(response.body.events).toHaveLength(2);

    const dates = response.body.events.map((event) => new Date(event.date).getTime());
    expect(dates).toEqual([...dates].sort((a, b) => b - a));
  });

  test('supports pagination', async () => {
    const response = await get(`${URL}?status=upcoming&page=1&limit=1`, attendee.token);

    expect(response.status).toBe(200);
    expect(response.body.page).toBe(1);
    expect(response.body.limit).toBe(1);
    expect(response.body.total).toBe(2);
    expect(response.body.totalPages).toBe(2);
    expect(response.body.events).toHaveLength(1);
  });

  test('rejects missing status', async () => {
    const response = await get(URL, attendee.token);

    expect(response.status).toBe(400);
  });

  test('rejects invalid status', async () => {
    const response = await get(`${URL}?status=all`, attendee.token);

    expect(response.status).toBe(400);
  });

  test('rejects invalid pagination parameters', async () => {
    const response = await get(`${URL}?status=upcoming&page=0&limit=abc`, attendee.token);

    expect(response.status).toBe(400);
  });

  test('rejects unauthenticated requests', async () => {
    const response = await get(`${URL}?status=upcoming`);

    expect(response.status).toBe(401);
  });

  test('rejects host access', async () => {
    const response = await get(`${URL}?status=upcoming`, host.token);

    expect(response.status).toBe(403);
  });
});
