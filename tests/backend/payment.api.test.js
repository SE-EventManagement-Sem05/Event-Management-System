
const request = require('supertest');

const { createUserAndLogin } = require('../../backend/tests/helpers');
const { startTestServer } = require('../../backend/tests/support/testServer');
const { resolveTestMongoUri } = require('../../backend/tests/support/testMongoUri');
const { runDbTool } = require('../../backend/tests/support/runDbTool');

jest.setTimeout(120000);

const URL = '/api/attendee/events';

let mongoUri;
let server;
let host;
let attendee;
let unregisteredAttendee;
let eventId;
let freeEventId;

const db = (command, payload) => runDbTool(mongoUri, command, payload);

function post(path, token, body) {
  const req = request(server.baseUrl).post(path);

  if (token) {
    req.set('Authorization', `Bearer ${token}`);
  }

  return body === undefined ? req : req.send(body);
}

beforeAll(async () => {
  mongoUri = resolveTestMongoUri(undefined, 'ems_payment_api_test');
  server = await startTestServer({ mongoUri });

  host = await createUserAndLogin(server.baseUrl, { role: 'host' });
  attendee = await createUserAndLogin(server.baseUrl, { role: 'attendee' });
  unregisteredAttendee = await createUserAndLogin(server.baseUrl, {
    role: 'attendee',
  });
}, 300000);

beforeEach(async () => {
  await db('reset');

  const inserted = await db('insertEvents', [
    {
      hostId: host.id,
      title: 'Paid Payment Event',
      description: 'An event requiring payment.',
      venue: 'Hall A',
      date: new Date(Date.now() + 3 * 86400000).toISOString(),
      price: 500,
      capacity: 100,
    },
    {
      hostId: host.id,
      title: 'Free Payment Event',
      description: 'An event with no charge.',
      venue: 'Hall B',
      date: new Date(Date.now() + 5 * 86400000).toISOString(),
      price: 0,
      capacity: 100,
    },
  ]);

  eventId = inserted.ids[0];
  freeEventId = inserted.ids[1];

  await db('insertRegistrations', [
    {
      eventId,
      count: 1,
      firstAttendeeId: attendee.id,
    },
    {
      eventId: freeEventId,
      count: 1,
      firstAttendeeId: attendee.id,
    },
  ]);
});

afterAll(async () => {
  try {
    if (mongoUri) {
      await db('reset');
    }
  } finally {
    if (server) {
      await server.stop();
    }
  }
}, 120000);

describe('EMS-FR-11 simulated payment authorization', () => {
  test('payment requires authentication', async () => {
    await post(`${URL}/${eventId}/payment`, undefined, {
      outcome: 'success',
    }).expect(401);
  });

  test('a host cannot make an attendee payment', async () => {
    await post(`${URL}/${eventId}/payment`, host.token, {
      outcome: 'success',
    }).expect(403);
  });

  test('an unregistered attendee cannot pay', async () => {
    const response = await post(
      `${URL}/${eventId}/payment`,
      unregisteredAttendee.token,
      { outcome: 'success' }
    ).expect(403);

    expect(response.body.message).toMatch(/register for this event/i);
  });

  test('a non-existent event returns 404', async () => {
    await post(
      `${URL}/507f1f77bcf86cd799439011/payment`,
      attendee.token,
      { outcome: 'success' }
    ).expect(404);
  });

  test('an invalid event ID returns 404', async () => {
    await post(`${URL}/invalid-id/payment`, attendee.token, {
      outcome: 'success',
    }).expect(404);
  });
});

describe('EMS-FR-11 payment validation', () => {
  test.each([undefined, null, '', 'pending', 'SUCCESS', 123])(
    'invalid outcome %j is rejected',
    async (outcome) => {
      const response = await post(
        `${URL}/${eventId}/payment`,
        attendee.token,
        { outcome }
      ).expect(400);

      expect(response.body.message).toMatch(
        /valid simulated payment outcome/i
      );
    }
  );
});

describe('EMS-FR-11 payment processing', () => {
  test('a registered attendee can successfully pay for a paid event', async () => {
    const response = await post(
      `${URL}/${eventId}/payment`,
      attendee.token,
      { outcome: 'success' }
    ).expect(201);

    expect(response.body.payment.status).toBe('success');
    expect(response.body.payment.amount).toBe(500);
    expect(response.body.payment.eventId).toBe(eventId);
    expect(response.body.payment.transactionId).toMatch(/^SIM-/);

    const result = await db('countPayments', {
      attendeeId: attendee.id,
      status: 'success',
    });

    expect(result.count).toBe(1);
  });

  test('a failed payment is recorded and can be retried', async () => {
    const failed = await post(
      `${URL}/${eventId}/payment`,
      attendee.token,
      { outcome: 'failed' }
    ).expect(402);

    expect(failed.body.payment.status).toBe('failed');

    const successful = await post(
      `${URL}/${eventId}/payment`,
      attendee.token,
      { outcome: 'success' }
    ).expect(201);

    expect(successful.body.payment.status).toBe('success');

    const result = await db('countPayments', {
      attendeeId: attendee.id,
    });

    expect(result.count).toBe(2);
  });

  test('a successful payment cannot be repeated', async () => {
    await post(`${URL}/${eventId}/payment`, attendee.token, {
      outcome: 'success',
    }).expect(201);

    const response = await post(
      `${URL}/${eventId}/payment`,
      attendee.token,
      { outcome: 'success' }
    ).expect(409);

    expect(response.body.message).toMatch(/already been completed/i);

    const result = await db('countPayments', {
      attendeeId: attendee.id,
      status: 'success',
    });

    expect(result.count).toBe(1);
  });

  test('a free event does not require payment', async () => {
    const response = await post(
      `${URL}/${freeEventId}/payment`,
      attendee.token,
      { outcome: 'success' }
    ).expect(400);

    expect(response.body.message).toMatch(/free event/i);

    const result = await db('countPayments', {
      attendeeId: attendee.id,
    });

    expect(result.count).toBe(0);
  });
});
