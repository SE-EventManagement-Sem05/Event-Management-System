
const request = require('supertest');

const { createUserAndLogin } = require('./helpers');
const { startTestServer } = require('./support/testServer');
const { resolveTestMongoUri } = require('./support/testMongoUri');
const { runDbTool } = require('./support/runDbTool');

jest.setTimeout(120000);

const DAY_MS = 24 * 60 * 60 * 1000;
const URL = '/api/attendee/events';
const futureDate = () => new Date(Date.now() + 7 * DAY_MS).toISOString();

let mongoUri;
let server;
let host;
let attendee;
let anotherAttendee;

const db = (command, payload) => runDbTool(mongoUri, command, payload);

function sendRegister(eventId, token) {
  const req = request(server.baseUrl).post(`${URL}/${eventId}/register`);
  if (token) req.set('Authorization', `Bearer ${token}`);
  return req;
}

function eventSpec(overrides = {}) {
  return {
    hostId: host.id,
    title: 'Registration Test Event',
    description: 'Event for registration tests',
    venue: 'PES University',
    date: futureDate(),
    price: 0,
    capacity: 10,
    ...overrides,
  };
}

function insertEvent(overrides = {}) {
  return db('insertEvents', [eventSpec(overrides)]).ids[0];
}

beforeAll(async () => {
  mongoUri = resolveTestMongoUri();
  server = await startTestServer({ mongoUri });

  host = await createUserAndLogin(server.baseUrl, { role: 'host' });
  attendee = await createUserAndLogin(server.baseUrl, { role: 'attendee' });
  anotherAttendee = await createUserAndLogin(server.baseUrl, { role: 'attendee' });

  db('reset');
}, 300000);

afterAll(async () => {
  try {
    if (mongoUri) db('reset');
  } finally {
    if (server) await server.stop();
  }
}, 120000);

describe('EMS-FR-10 event registration', () => {
  test('an attendee can register for an upcoming event', async () => {
    const eventId = insertEvent();

    const response = await sendRegister(eventId, attendee.token).expect(201);

    expect(response.body.registration.eventId.toString()).toBe(eventId);
    expect(response.body.registration.attendeeId).toBe(attendee.id);

    const registrations = db('countRegistrations', { eventId });
    expect(registrations.count).toBe(1);
  });

  test('an attendee cannot register twice for the same event', async () => {
    const eventId = insertEvent();

    await sendRegister(eventId, attendee.token).expect(201);
    await sendRegister(eventId, attendee.token).expect(409);

    expect(db('countRegistrations', { eventId }).count).toBe(1);
  });

  test('a full event rejects another attendee', async () => {
    const eventId = insertEvent({ capacity: 1 });

    await sendRegister(eventId, attendee.token).expect(201);
    await sendRegister(eventId, anotherAttendee.token).expect(409);

    expect(db('countRegistrations', { eventId }).count).toBe(1);
  });

  test('a past event rejects registration', async () => {
    const eventId = insertEvent({
      date: new Date(Date.now() - DAY_MS).toISOString(),
    });

    await sendRegister(eventId, attendee.token).expect(400);
  });

  test('an unauthenticated request is rejected', async () => {
    const eventId = insertEvent();
    await sendRegister(eventId).expect(401);
  });

  test('a host cannot register as an attendee', async () => {
    const eventId = insertEvent();
    await sendRegister(eventId, host.token).expect(403);
  });

  test('an unknown event returns 404', async () => {
    await sendRegister('000000000000000000000000', attendee.token).expect(404);
  });
});
