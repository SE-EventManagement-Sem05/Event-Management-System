const request = require('supertest');

const { createUserAndLogin } = require('./helpers');
const { startTestServer } = require('./support/testServer');
const { resolveTestMongoUri } = require('./support/testMongoUri');
const { runDbTool } = require('./support/runDbTool');

jest.setTimeout(120000);

const DAY_MS = 24 * 60 * 60 * 1000;
const URL = '/api/host/events';
const MISSING_ID = '000000000000000000000000';

// These tests run the real application (node server.js) as its own process,
// connected to the same MongoDB server as the app but to a separate "ems_test"
// database, and talk to it over HTTP.
let mongoUri;
let server;
let hostA;
let hostB;
let ids;
let dates;
let legacyId;

const db = (command, payload) => runDbTool(mongoUri, command, payload);

function get(path, token) {
  const req = request(server.baseUrl).get(path);
  return token ? req.set('Authorization', `Bearer ${token}`) : req;
}

function eventSpec(hostId, overrides = {}) {
  return {
    hostId,
    title: 'Detail Event',
    description: 'Detail description',
    venue: 'Detail Venue',
    price: 499.99,
    capacity: 150,
    date: new Date(Date.now() + 5 * DAY_MS).toISOString(),
    ...overrides,
  };
}

beforeAll(async () => {
  mongoUri = resolveTestMongoUri();
  server = await startTestServer({ mongoUri });

  hostA = await createUserAndLogin(server.baseUrl, { role: 'host' });
  hostB = await createUserAndLogin(server.baseUrl, { role: 'host' });

  db('reset');

  const specs = {
    main: eventSpec(hostA.id),
    other: eventSpec(hostA.id, { title: 'Other Event' }),
    empty: eventSpec(hostA.id, { title: 'Empty Event' }),
    growing: eventSpec(hostA.id, { title: 'Growing Event' }),
    past: eventSpec(hostA.id, {
      title: 'Past Event',
      date: new Date(Date.now() - 5 * DAY_MS).toISOString(),
    }),
    hostile: eventSpec(hostA.id, { title: '<img src=x onerror=alert(1)>' }),
    popular: eventSpec(hostA.id, { title: 'Popular Event' }),
  };

  const names = Object.keys(specs);
  const inserted = db('insertEvents', names.map((name) => specs[name]));

  ids = Object.fromEntries(names.map((name, index) => [name, inserted.ids[index]]));
  dates = Object.fromEntries(names.map((name) => [name, specs[name].date]));

  db('insertRegistrations', [
    { eventId: ids.main, count: 3, firstAttendeeId: 1000 },
    { eventId: ids.other, count: 5, firstAttendeeId: 2000 },
    { eventId: ids.popular, count: 2000, firstAttendeeId: 10000 },
  ]);

  legacyId = db('insertRawEvent', {
    hostId: hostA.id,
    title: 'Legacy Event',
    description: 'Created before price and capacity existed',
    venue: 'Old Hall',
    date: new Date(Date.now() + 5 * DAY_MS).toISOString(),
  }).id;
}, 300000);

afterAll(async () => {
  try {
    if (mongoUri) db('reset');
  } finally {
    if (server) await server.stop();
  }
}, 120000);

describe('EMS-FR-06 access to other hosts events', () => {
  test('another host gets 403 and no event data', async () => {
    const response = await get(`${URL}/${ids.main}`, hostB.token);

    expect(response.status).toBe(403);
    expect(response.body.event).toBeUndefined();
    expect(response.body.message).toBe('You can only access your own events.');
  });

  test('an unknown id gives 404', async () => {
    const response = await get(`${URL}/${MISSING_ID}`, hostA.token);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Event not found.');
  });
});

describe('EMS-FR-06 event details', () => {
  test('the owner receives every detail and the registered attendees count', async () => {
    const response = await get(`${URL}/${ids.main}`, hostA.token).expect(200);

    expect(response.body.event).toEqual({
      id: ids.main,
      title: 'Detail Event',
      description: 'Detail description',
      date: dates.main,
      venue: 'Detail Venue',
      price: 499.99,
      capacity: 150,
      registeredCount: 3,
    });
  });

  test('only the documented fields are returned', async () => {
    const response = await get(`${URL}/${ids.main}`, hostA.token).expect(200);

    expect(Object.keys(response.body.event).sort()).toEqual([
      'capacity',
      'date',
      'description',
      'id',
      'price',
      'registeredCount',
      'title',
      'venue',
    ]);
  });

  test('the count only includes registrations of that event', async () => {
    const other = await get(`${URL}/${ids.other}`, hostA.token).expect(200);
    const empty = await get(`${URL}/${ids.empty}`, hostA.token).expect(200);

    expect(other.body.event.registeredCount).toBe(5);
    expect(empty.body.event.registeredCount).toBe(0);
  });

  test('the count follows new registrations', async () => {
    const before = await get(`${URL}/${ids.growing}`, hostA.token).expect(200);
    expect(before.body.event.registeredCount).toBe(0);

    db('insertRegistrations', [{ eventId: ids.growing, count: 2, firstAttendeeId: 3000 }]);

    const after = await get(`${URL}/${ids.growing}`, hostA.token).expect(200);
    expect(after.body.event.registeredCount).toBe(2);
  });

  test('a past event can be opened', async () => {
    const response = await get(`${URL}/${ids.past}`, hostA.token).expect(200);

    expect(response.body.event.title).toBe('Past Event');
  });

  test('an event without price and capacity still opens, with those fields absent', async () => {
    const response = await get(`${URL}/${legacyId}`, hostA.token).expect(200);

    expect(response.body.event.title).toBe('Legacy Event');
    expect(response.body.event.price).toBeUndefined();
    expect(response.body.event.capacity).toBeUndefined();
    expect(response.body.event.registeredCount).toBe(0);
  });

  test('script text is returned unchanged', async () => {
    const response = await get(`${URL}/${ids.hostile}`, hostA.token).expect(200);

    expect(response.body.event.title).toBe('<img src=x onerror=alert(1)>');
  });
});

describe('EMS-FR-06 compatibility with the event list (EMS-FR-05)', () => {
  test('list items still hold only id, title, date and venue', async () => {
    const response = await get(`${URL}?status=upcoming&limit=1`, hostA.token).expect(200);

    expect(Object.keys(response.body.events[0]).sort()).toEqual(['date', 'id', 'title', 'venue']);
  });
});

describe('EMS-FR-06 reliability', () => {
  test('handles 30 simultaneous requests with identical results', async () => {
    const responses = await Promise.all(
      Array.from({ length: 30 }, () => get(`${URL}/${ids.main}`, hostA.token))
    );

    expect(responses.every((r) => r.status === 200)).toBe(true);
    expect(new Set(responses.map((r) => JSON.stringify(r.body))).size).toBe(1);
  });

  test('counts a large number of registrations correctly', async () => {
    const response = await get(`${URL}/${ids.popular}`, hostA.token).expect(200);

    expect(response.body.event.registeredCount).toBe(2000);
  });
});