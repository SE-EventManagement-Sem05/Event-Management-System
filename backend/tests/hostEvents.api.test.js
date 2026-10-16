const request = require('supertest');

const app = require('../server');
const { createUserAndLogin } = require('./helpers');

const URL = '/api/host/events';
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

describe('EMS-FR-05 access control', () => {
  test('no token gives 401', async () => {
    await get(`${URL}?status=upcoming`).expect(401);
  });

  test('an invalid token gives 401', async () => {
    await get(`${URL}?status=upcoming`, 'abc').expect(401);
  });

  test('an attendee token gives 403 and no events', async () => {
    const response = await get(`${URL}?status=upcoming`, attendee.token);

    expect(response.status).toBe(403);
    expect(response.body.events).toBeUndefined();
  });
});

describe('EMS-FR-05 input validation', () => {
  test.each([
    ['missing status', ''],
    ['unknown status', '?status=all'],
    ['status array', '?status=upcoming&status=past'],
    ['operator injection', '?status[$ne]=past'],
    ['page zero', '?status=upcoming&page=0'],
    ['page text', '?status=upcoming&page=abc'],
    ['negative page', '?status=upcoming&page=-1'],
    ['page above the maximum', '?status=upcoming&page=100001'],
    ['limit zero', '?status=upcoming&limit=0'],
    ['limit above the maximum', '?status=upcoming&limit=51'],
    ['fractional limit', '?status=upcoming&limit=1.5'],
    ['huge page', '?status=upcoming&page=99999999999'],
  ])('%s gives 400', async (_label, query) => {
    const response = await get(`${URL}${query}`, host.token);

    expect(response.status).toBe(400);
    expect(response.body.events).toBeUndefined();
    expect(response.body.message).toBeTruthy();
  });

  test('an unknown status names the allowed values', async () => {
    const response = await get(`${URL}?status=all`, host.token);

    expect(response.body.message).toBe('Query parameter "status" must be "upcoming" or "past".');
  });
});

describe('EMS-FR-05 valid requests and an unavailable database', () => {
  test.each([
    ['upcoming, defaults', '?status=upcoming'],
    ['past, page 2 of 10', '?status=past&page=2&limit=10'],
    ['the largest allowed limit', '?status=upcoming&limit=50'],
    ['the largest allowed page', '?status=past&page=100000'],
  ])('%s passes validation and, without a database, gives 503', async (_label, query) => {
    const response = await get(`${URL}${query}`, host.token);

    expect(response.status).toBe(503);
    expect(response.body.message).toBe(UNAVAILABLE);
    expect(response.body.events).toBeUndefined();
  });

  test('the login still works while the event database is unavailable', async () => {
    const again = await createUserAndLogin(app, { role: 'host' });

    expect(again.token).toBeTruthy();
  });
});