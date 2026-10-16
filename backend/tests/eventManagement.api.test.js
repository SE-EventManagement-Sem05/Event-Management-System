const request = require('supertest');

const app = require('../server');
const { createUserAndLogin } = require('./helpers');

const DAY_MS = 24 * 60 * 60 * 1000;
const URL = '/api/host/events';
const SOME_ID = '000000000000000000000000';
const UNAVAILABLE = 'Events are temporarily unavailable. Please try again shortly.';

const futureIso = (days = 10) => new Date(Date.now() + days * DAY_MS).toISOString();
const pastIso = (days = 10) => new Date(Date.now() - days * DAY_MS).toISOString();

function validBody(overrides = {}) {
  return {
    title: 'Tech Meetup',
    description: 'Monthly meetup',
    date: futureIso(),
    venue: 'Hall A',
    price: 99.5,
    capacity: 100,
    ...overrides,
  };
}

function send(method, path, token, body) {
  const req = request(app)[method](path);
  if (token) req.set('Authorization', `Bearer ${token}`);
  return body === undefined ? req : req.send(body);
}

let host;
let attendee;

beforeAll(async () => {
  host = await createUserAndLogin(app, { role: 'host' });
  attendee = await createUserAndLogin(app, { role: 'attendee' });
});

// This file never connects to MongoDB. Everything below is decided before the
// database is used, so these tests do not depend on a database being available.

describe('EMS-FR-07 access control', () => {
  test.each([
    ['post', URL],
    ['put', `${URL}/${SOME_ID}`],
  ])('%s %s without a token gives 401', async (method, path) => {
    await send(method, path, undefined, validBody()).expect(401);
  });

  test.each([
    ['post', URL],
    ['put', `${URL}/${SOME_ID}`],
  ])('%s %s with an invalid token gives 401', async (method, path) => {
    await send(method, path, 'abc', validBody()).expect(401);
  });

  test.each([
    ['post', URL],
    ['put', `${URL}/${SOME_ID}`],
  ])('%s %s with an attendee token gives 403', async (method, path) => {
    await send(method, path, attendee.token, validBody()).expect(403);
  });
});

describe('EMS-FR-07 create validation', () => {
  test.each(['title', 'description', 'date', 'venue', 'price', 'capacity'])(
    'a missing %s gives 400 with a message for that field',
    async (field) => {
      const body = validBody();
      delete body[field];

      const response = await send('post', URL, host.token, body);

      expect(response.status).toBe(400);
      expect(response.body.errors[field]).toBeTruthy();
    }
  );

  test.each([
    ['title', '   '],
    ['title', 'a'.repeat(121)],
    ['title', { $gt: '' }],
    ['title', 123],
    ['description', 'a'.repeat(2001)],
    ['description', 5],
    ['venue', ''],
    ['venue', 'a'.repeat(201)],
    ['date', 'tomorrow'],
    ['date', '2030-06-15'],
    ['date', '2030-06-15T10:30'],
    ['date', '2030-02-31T10:00:00.000Z'],
    ['date', pastIso()],
    ['date', '2101-01-01T00:00:00.000Z'],
    ['date', 12345],
    ['date', null],
    ['price', -1],
    ['price', 1000001],
    ['price', 1.234],
    ['price', '10'],
    ['price', null],
    ['capacity', 0],
    ['capacity', -1],
    ['capacity', 1.5],
    ['capacity', 100001],
    ['capacity', '5'],
  ])('invalid %s (%j) gives 400 with a message for that field', async (field, value) => {
    const response = await send('post', URL, host.token, validBody({ [field]: value }));

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Please correct the highlighted fields.');
    expect(response.body.errors[field]).toBeTruthy();
  });

  test.each([
    ['an empty body', {}],
    ['an array body', []],
  ])('%s gives 400 with an error for every field', async (_label, body) => {
    const response = await send('post', URL, host.token, body);

    expect(response.status).toBe(400);
    expect(Object.keys(response.body.errors).sort()).toEqual(
      ['capacity', 'date', 'description', 'price', 'title', 'venue']
    );
  });

  test('several invalid fields are all reported together', async () => {
    const response = await send(
      'post',
      URL,
      host.token,
      validBody({ title: '', price: -5, capacity: 0 })
    );

    expect(Object.keys(response.body.errors).sort()).toEqual(['capacity', 'price', 'title']);
  });
});

describe('EMS-FR-07 valid requests and an unavailable database', () => {
  test('a valid create passes validation and, without a database, gives 503', async () => {
    const response = await send('post', URL, host.token, validBody());

    expect(response.status).toBe(503);
    expect(response.body.message).toBe(UNAVAILABLE);
    expect(response.body.event).toBeUndefined();
  });

  test('values exactly at the limits pass validation', async () => {
    const bodies = [
      validBody({ price: 0, capacity: 1 }),
      validBody({ price: 0.01 }),
      validBody({ price: 1000000, capacity: 100000 }),
      validBody({ title: 'a'.repeat(120), venue: 'b'.repeat(200), description: 'c'.repeat(2000) }),
    ];

    for (const body of bodies) {
      await send('post', URL, host.token, body).expect(503);
    }
  });

  test('an edit with a well-formed id gives 503 when the database is not connected', async () => {
    const response = await send('put', `${URL}/${SOME_ID}`, host.token, validBody());

    expect(response.status).toBe(503);
    expect(response.body.message).toBe(UNAVAILABLE);
  });

  test('an edit with a malformed id gives 404', async () => {
    await send('put', `${URL}/abc`, host.token, validBody()).expect(404);
  });
});