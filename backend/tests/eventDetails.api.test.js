const request = require('supertest');

const app = require('../server');
const { createUserAndLogin } = require('./helpers');

const URL = '/api/host/events';
const SOME_ID = '000000000000000000000000';
const UNAVAILABLE = 'Events are temporarily unavailable. Please try again shortly.';

let host;
let attendee;

function get(path, token) {
  const req = request(app).get(path);
  return token ? req.set('Authorization', `Bearer ${token}`) : req;
}

beforeAll(async () => {
  host = await createUserAndLogin(app, { role: 'host' });
  attendee = await createUserAndLogin(app, { role: 'attendee' });
});

// This file never connects to MongoDB. Everything below is decided before the
// database is used, so these tests do not depend on a database being available.

describe('EMS-FR-06 access control', () => {
  test('no token gives 401', async () => {
    await get(`${URL}/${SOME_ID}`).expect(401);
  });

  test('an invalid token gives 401', async () => {
    await get(`${URL}/${SOME_ID}`, 'abc').expect(401);
  });

  test('an attendee token gives 403 and no data', async () => {
    const response = await get(`${URL}/${SOME_ID}`, attendee.token);

    expect(response.status).toBe(403);
    expect(response.body.event).toBeUndefined();
  });
});

describe('EMS-FR-06 malformed ids', () => {
  test.each([
    ['too short', 'abc'],
    ['digits only', '123'],
    ['operator text', '{"$ne":null}'],
    ['24 non-hex characters', 'zzzzzzzzzzzzzzzzzzzzzzzz'],
    ['very long', 'a'.repeat(5000)],
  ])('a malformed id (%s) gives 404', async (_label, id) => {
    const response = await get(`${URL}/${encodeURIComponent(id)}`, host.token);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Event not found.');
    expect(response.body.event).toBeUndefined();
  });
});

describe('EMS-FR-06 database unavailable', () => {
  test('a well-formed id gives 503 and no data when the database is not connected', async () => {
    const response = await get(`${URL}/${SOME_ID}`, host.token);

    expect(response.status).toBe(503);
    expect(response.body.message).toBe(UNAVAILABLE);
    expect(response.body.event).toBeUndefined();
  });
});