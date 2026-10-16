const request = require('supertest');

const { createUserAndLogin } = require('./helpers');
const { startTestServer } = require('./support/testServer');
const { resolveTestMongoUri } = require('./support/testMongoUri');
const { runDbTool } = require('./support/runDbTool');

jest.setTimeout(120000);

const DAY_MS = 24 * 60 * 60 * 1000;
const URL = '/api/host/events';
const MISSING_ID = '000000000000000000000000';

const futureIso = (days = 10) => new Date(Date.now() + days * DAY_MS).toISOString();
const pastIso = (days = 10) => new Date(Date.now() - days * DAY_MS).toISOString();

// These tests run the real application (node server.js) as its own process,
// connected to the same MongoDB server as the app but to a separate "ems_test"
// database, and talk to it over HTTP.
let mongoUri;
let server;
let hostA;
let hostB;
let ids;
let specs;
let legacyId;

const db = (command, payload) => runDbTool(mongoUri, command, payload);

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
  const req = request(server.baseUrl)[method](path);
  if (token) req.set('Authorization', `Bearer ${token}`);
  return body === undefined ? req : req.send(body);
}

function eventSpec(hostId, overrides = {}) {
  return {
    hostId,
    title: 'Seeded Event',
    description: 'Seeded description',
    venue: 'Seeded Venue',
    price: 10,
    capacity: 20,
    date: futureIso(5),
    ...overrides,
  };
}

const storedEvent = (id) => db('getEvent', { id }).event;
const eventCount = (filter) => db('countEvents', filter).count;

beforeAll(async () => {
  mongoUri = resolveTestMongoUri();
  server = await startTestServer({ mongoUri });

  hostA = await createUserAndLogin(server.baseUrl, { role: 'host' });
  hostB = await createUserAndLogin(server.baseUrl, { role: 'host' });

  db('reset');

  specs = {
    editMain: eventSpec(hostA.id, { title: 'Before Edit' }),
    protectedEvent: eventSpec(hostA.id, { title: 'Protected Event' }),
    stableEvent: eventSpec(hostA.id, { title: 'Stable Event' }),
    hostIdEvent: eventSpec(hostA.id, { title: 'Ownership Event' }),
    intoPastEvent: eventSpec(hostA.id, { title: 'Future Event' }),
    pastSame: eventSpec(hostA.id, { title: 'Past Same Date', date: pastIso(5) }),
    pastDifferent: eventSpec(hostA.id, { title: 'Past Different Date', date: pastIso(5) }),
    rescheduled: eventSpec(hostA.id, { title: 'Rescheduled Event', date: pastIso(5) }),
    capacityEvent: eventSpec(hostA.id, { title: 'Capacity Event', capacity: 10 }),
  };

  const names = Object.keys(specs);
  const inserted = db('insertEvents', names.map((name) => specs[name]));

  ids = Object.fromEntries(names.map((name, index) => [name, inserted.ids[index]]));

  db('insertRegistrations', [
    { eventId: ids.editMain, count: 1, firstAttendeeId: 41 },
    { eventId: ids.capacityEvent, count: 3, firstAttendeeId: 500 },
  ]);

  legacyId = db('insertRawEvent', {
    hostId: hostA.id,
    title: 'Legacy Event',
    description: 'Created before FR-07',
    venue: 'Old Hall',
    date: futureIso(5),
  }).id;
}, 300000);

afterAll(async () => {
  try {
    if (mongoUri) db('reset');
  } finally {
    if (server) await server.stop();
  }
}, 120000);

describe('EMS-FR-07 create event', () => {
  test('creates an event for the logged-in host and returns it (201)', async () => {
    const body = validBody();
    const response = await send('post', URL, hostA.token, body);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Event created successfully.');
    expect(response.body.event).toMatchObject({
      title: 'Tech Meetup',
      description: 'Monthly meetup',
      date: body.date,
      venue: 'Hall A',
      price: 99.5,
      capacity: 100,
      registeredCount: 0,
    });
    expect(storedEvent(response.body.event.id).hostId).toBe(hostA.id);
  });

  test('the new event appears in the host event list and in the details', async () => {
    const created = await send('post', URL, hostA.token, validBody({ title: 'Listed Event' })).expect(201);

    const list = await send('get', `${URL}?status=upcoming&limit=50`, hostA.token).expect(200);
    expect(list.body.events.map((e) => e.id)).toContain(created.body.event.id);

    const details = await send('get', `${URL}/${created.body.event.id}`, hostA.token).expect(200);
    expect(details.body.event.title).toBe('Listed Event');
  });

  test('trims text fields', async () => {
    const response = await send(
      'post',
      URL,
      hostA.token,
      validBody({ title: '  Spaced Title  ', venue: '  Spaced Venue ', description: ' Text ' })
    ).expect(201);

    expect(response.body.event).toMatchObject({
      title: 'Spaced Title',
      venue: 'Spaced Venue',
      description: 'Text',
    });
  });

  test('accepts values exactly at the limits, including a free event', async () => {
    const bodies = [
      validBody({ price: 0, capacity: 1 }),
      validBody({ price: 0.01 }),
      validBody({ price: 1000000, capacity: 100000 }),
      validBody({ title: 'a'.repeat(120), venue: 'b'.repeat(200), description: 'c'.repeat(2000) }),
    ];

    for (const body of bodies) {
      await send('post', URL, hostA.token, body).expect(201);
    }
  });

  test('invalid requests store nothing', async () => {
    const before = eventCount({ hostId: hostA.id });

    await send('post', URL, hostA.token, validBody({ title: '' })).expect(400);
    await send('post', URL, hostA.token, validBody({ date: pastIso() })).expect(400);
    await send('post', URL, hostA.token, validBody({ price: -1 })).expect(400);
    await send('post', URL, hostA.token, validBody({ capacity: 0 })).expect(400);
    await send('post', URL, hostA.token, {}).expect(400);

    expect(eventCount({ hostId: hostA.id })).toBe(before);
  });

  test('ignores hostId and other extra fields in the body', async () => {
    const response = await send(
      'post',
      URL,
      hostA.token,
      validBody({ hostId: hostB.id, _id: '000000000000000000000001', isAdmin: true })
    ).expect(201);

    const stored = storedEvent(response.body.event.id);

    expect(stored.hostId).toBe(hostA.id);
    expect(stored._id).not.toBe('000000000000000000000001');
    expect(stored.isAdmin).toBeUndefined();
  });

  test('stores script text literally', async () => {
    const response = await send(
      'post',
      URL,
      hostA.token,
      validBody({ title: '<img src=x onerror=alert(1)>' })
    ).expect(201);

    expect(response.body.event.title).toBe('<img src=x onerror=alert(1)>');
  });
});

describe('EMS-FR-07 edit event', () => {
  test('the owner can change every field and it shows in the details and the list', async () => {
    const newDate = futureIso(40);

    const response = await send(
      'put',
      `${URL}/${ids.editMain}`,
      hostA.token,
      validBody({
        title: 'After Edit',
        description: 'New description',
        venue: 'New Venue',
        price: 250,
        capacity: 75,
        date: newDate,
      })
    );

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Event updated successfully.');
    expect(response.body.event).toMatchObject({
      title: 'After Edit',
      description: 'New description',
      venue: 'New Venue',
      price: 250,
      capacity: 75,
      date: newDate,
      registeredCount: 1,
    });

    const details = await send('get', `${URL}/${ids.editMain}`, hostA.token).expect(200);
    expect(details.body.event).toMatchObject({ title: 'After Edit', price: 250, capacity: 75, registeredCount: 1 });

    const list = await send('get', `${URL}?status=upcoming&limit=50`, hostA.token).expect(200);
    const listed = list.body.events.find((e) => e.id === ids.editMain);
    expect(listed).toMatchObject({ title: 'After Edit', venue: 'New Venue', date: newDate });
  });

  test('another host gets 403 and the event is unchanged', async () => {
    const response = await send(
      'put',
      `${URL}/${ids.protectedEvent}`,
      hostB.token,
      validBody({ title: 'Hijacked' })
    );

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('You can only access your own events.');
    expect(storedEvent(ids.protectedEvent).title).toBe('Protected Event');
  });

  test('ownership is checked before the body, so a non-owner with bad data still gets 403', async () => {
    await send('put', `${URL}/${ids.protectedEvent}`, hostB.token, {}).expect(403);
  });

  test('invalid data gives 400 and the event is unchanged', async () => {
    const response = await send(
      'put',
      `${URL}/${ids.stableEvent}`,
      hostA.token,
      validBody({ title: '', price: -5 })
    );

    expect(response.status).toBe(400);
    expect(response.body.errors.title).toBeTruthy();
    expect(response.body.errors.price).toBeTruthy();
    expect(storedEvent(ids.stableEvent).title).toBe('Stable Event');
  });

  test('an unknown id gives 404', async () => {
    const response = await send('put', `${URL}/${MISSING_ID}`, hostA.token, validBody());

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Event not found.');
  });

  test('hostId in the body cannot move an event to another host', async () => {
    await send(
      'put',
      `${URL}/${ids.hostIdEvent}`,
      hostA.token,
      validBody({ hostId: hostB.id })
    ).expect(200);

    expect(storedEvent(ids.hostIdEvent).hostId).toBe(hostA.id);
  });

  test('an event cannot be moved into the past', async () => {
    const response = await send(
      'put',
      `${URL}/${ids.intoPastEvent}`,
      hostA.token,
      validBody({ date: pastIso(1) })
    );

    expect(response.status).toBe(400);
    expect(response.body.errors.date).toBeTruthy();
  });

  test('a past event can be edited while its date stays the same', async () => {
    const response = await send(
      'put',
      `${URL}/${ids.pastSame}`,
      hostA.token,
      validBody({ venue: 'Corrected Venue', date: specs.pastSame.date })
    );

    expect(response.status).toBe(200);
    expect(response.body.event.venue).toBe('Corrected Venue');
  });

  test('a past event cannot be moved to a different past date', async () => {
    await send(
      'put',
      `${URL}/${ids.pastDifferent}`,
      hostA.token,
      validBody({ date: pastIso(2) })
    ).expect(400);
  });

  test('rescheduling a past event to the future moves it from Past to Upcoming', async () => {
    await send(
      'put',
      `${URL}/${ids.rescheduled}`,
      hostA.token,
      validBody({ date: futureIso(3) })
    ).expect(200);

    const upcoming = await send('get', `${URL}?status=upcoming&limit=50`, hostA.token).expect(200);
    const past = await send('get', `${URL}?status=past&limit=50`, hostA.token).expect(200);

    expect(upcoming.body.events.map((e) => e.id)).toContain(ids.rescheduled);
    expect(past.body.events.map((e) => e.id)).not.toContain(ids.rescheduled);
  });

  test('capacity cannot be lowered below the number of registered attendees', async () => {
    const tooLow = await send(
      'put',
      `${URL}/${ids.capacityEvent}`,
      hostA.token,
      validBody({ capacity: 2 })
    );

    expect(tooLow.status).toBe(400);
    expect(tooLow.body.errors.capacity).toMatch(/3 attendee/);
    expect(storedEvent(ids.capacityEvent).capacity).toBe(10);

    const exact = await send(
      'put',
      `${URL}/${ids.capacityEvent}`,
      hostA.token,
      validBody({ capacity: 3 })
    );

    expect(exact.status).toBe(200);
    expect(exact.body.event.registeredCount).toBe(3);
  });

  test('an older event without price and capacity can be opened and completed', async () => {
    await send('get', `${URL}/${legacyId}`, hostA.token).expect(200);

    const response = await send(
      'put',
      `${URL}/${legacyId}`,
      hostA.token,
      validBody({ price: 20, capacity: 30 })
    );

    expect(response.status).toBe(200);
    expect(response.body.event).toMatchObject({ price: 20, capacity: 30 });
  });
});

describe('EMS-FR-07 reliability', () => {
  test('20 simultaneous creates all succeed and none are lost', async () => {
    const filter = { hostId: hostA.id, title: 'Parallel Event' };
    const before = eventCount(filter);

    const responses = await Promise.all(
      Array.from({ length: 20 }, () => send('post', URL, hostA.token, validBody({ title: 'Parallel Event' })))
    );

    expect(responses.every((r) => r.status === 201)).toBe(true);
    expect(eventCount(filter)).toBe(before + 20);
  });
});