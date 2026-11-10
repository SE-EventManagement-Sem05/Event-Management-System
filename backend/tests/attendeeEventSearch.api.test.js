
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

const db = (command, payload) => runDbTool(mongoUri, command, payload);

function get(path, token) {
  const req = request(server.baseUrl).get(path);
  return token ? req.set('Authorization', `Bearer ${token}`) : req;
}

function eventSpec(overrides = {}) {
  return {
    hostId: host.id,
    title: 'Technology Workshop',
    description: 'Learn artificial intelligence and machine learning.',
    venue: 'PES University, Bengaluru',
    category: 'Technology',
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

  db('insertEvents', [
    eventSpec({
      title: 'AI Workshop',
      description: 'Artificial intelligence and machine learning.',
      venue: 'PES University, Bengaluru',
      category: 'Technology',
    }),
    eventSpec({
      title: 'Classical Music Night',
      description: 'An evening of Indian classical music.',
      venue: 'Mysuru Palace',
      category: 'Music',
    }),
    eventSpec({
      title: 'Football Tournament',
      description: 'Inter-college sports competition.',
      venue: 'PES University, Bengaluru',
      category: 'Sports',
    }),
  ]);
}, 300000);

afterAll(async () => {
  try {
    if (mongoUri) db('reset');
  } finally {
    if (server) await server.stop();
  }
}, 120000);

describe('EMS-FR-09 attendee event search and filtering', () => {
  test('filters events by location', async () => {
    const response = await get(
      `${URL}?status=upcoming&location=Bengaluru`,
      attendee.token
    );

    expect(response.status).toBe(200);
    expect(response.body.events).toHaveLength(2);
    expect(
      response.body.events.every((event) =>
        event.venue.toLowerCase().includes('bengaluru')
      )
    ).toBe(true);
  });

  test('searches events by interest keyword', async () => {
    const response = await get(
      `${URL}?status=upcoming&interest=artificial`,
      attendee.token
    );

    expect(response.status).toBe(200);
    expect(response.body.events).toHaveLength(1);
    expect(response.body.events[0].title).toBe('AI Workshop');
  });

  test('filters events by category', async () => {
    const response = await get(
      `${URL}?status=upcoming&category=Music`,
      attendee.token
    );

    expect(response.status).toBe(200);
    expect(response.body.events).toHaveLength(1);
    expect(response.body.events[0].category).toBe('Music');
  });

  test('supports combining location and category filters', async () => {
    const response = await get(
      `${URL}?status=upcoming&location=Bengaluru&category=Sports`,
      attendee.token
    );

    expect(response.status).toBe(200);
    expect(response.body.events).toHaveLength(1);
    expect(response.body.events[0].title).toBe('Football Tournament');
  });

  test('returns an empty list when no events match', async () => {
    const response = await get(
      `${URL}?status=upcoming&category=Nonexistent`,
      attendee.token
    );

    expect(response.status).toBe(200);
    expect(response.body.events).toHaveLength(0);
    expect(response.body.total).toBe(0);
  });

  test('rejects filters exceeding allowed lengths', async () => {
    const response = await get(
      `${URL}?status=upcoming&location=${'a'.repeat(201)}`,
      attendee.token
    );

    expect(response.status).toBe(400);
  });

  test('rejects unauthenticated search requests', async () => {
    const response = await get(
      `${URL}?status=upcoming&category=Technology`
    );

    expect(response.status).toBe(401);
  });

  test('rejects host search requests', async () => {
    const response = await get(
      `${URL}?status=upcoming&category=Technology`,
      (await createUserAndLogin(server.baseUrl, { role: 'host' })).token
    );

    expect(response.status).toBe(403);
  });
});
