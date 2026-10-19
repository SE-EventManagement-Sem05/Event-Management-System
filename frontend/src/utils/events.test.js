import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  ApiError,
  ApiValidationError,
  SessionExpiredError,
  createHostEvent,
  fetchHostEvent,
  updateHostEvent,
} from './events.js';

function response(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      if (body === undefined) throw new Error('no JSON body');
      return body;
    },
  };
}

beforeEach(() => {
  sessionStorage.setItem('token', 'jwt-token');
  sessionStorage.setItem('user', JSON.stringify({ role: 'host' }));
});

describe('EMS-FR-06 fetchHostEvent', () => {
  test('requests the event with the bearer token and returns it', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(response(200, { event: { id: 'abc', title: 'T' } }));

    const event = await fetchHostEvent('abc');

    expect(event).toEqual({ id: 'abc', title: 'T' });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/host\/events\/abc$/),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
      })
    );
  });

  test('encodes the id in the URL', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(response(200, { event: {} }));

    await fetchHostEvent('a/b');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/host\/events\/a%2Fb$/),
      expect.anything()
    );
  });

  test('a 401 clears the session and reports an expired session', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(response(401, { message: 'Invalid or expired token.' }));

    await expect(fetchHostEvent('abc')).rejects.toBeInstanceOf(SessionExpiredError);
    expect(sessionStorage.getItem('token')).toBeNull();
  });

  test.each([
    [403, 'You can only access your own events.'],
    [404, 'Event not found.'],
    [503, 'Events are temporarily unavailable. Please try again shortly.'],
  ])('a %s response becomes an ApiError with the server message', async (status, message) => {
    globalThis.fetch = vi.fn().mockResolvedValue(response(status, { message }));

    await expect(fetchHostEvent('abc')).rejects.toBeInstanceOf(ApiError);
    await expect(fetchHostEvent('abc')).rejects.toMatchObject({ status, message });
  });

  test('an error without a JSON body gets a default message', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(response(500, undefined));

      const error = await fetchHostEvent('abc').catch(e => e);
      expect(error.status).toBe(500);
      expect(error.message).toBe('Something went wrong on our server. Please try again.');
    });

  test('a network failure becomes an ApiError with status 0', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(fetchHostEvent('abc')).rejects.toMatchObject({
      status: 0,
      message: 'Unable to connect to the server. Please try again.',
    });
  });

    test('uses a friendly fallback when the server returns an unexpected error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      response(500, { message: 'Something went wrong on our server. Please try again.' })
    );

    await expect(fetchHostEvent('abc')).rejects.toMatchObject({
      status: 500,
      message: 'Something went wrong on our server. Please try again.',
    });
  });

  test('a 403 does not clear the authenticated session', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      response(403, { message: 'You do not have permission to perform this action.' })
    );

    await expect(fetchHostEvent('abc')).rejects.toMatchObject({
      status: 403,
    });

    expect(sessionStorage.getItem('token')).toBe('jwt-token');
  });
  
});

describe('EMS-FR-07 createHostEvent and updateHostEvent', () => {
  const payload = { title: 'T', description: 'D', date: '2030-06-15T10:30:00.000Z', venue: 'V', price: 1, capacity: 2 };

  test('createHostEvent posts the payload with the bearer token and returns the event', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(response(201, { event: { id: 'new1' } }));

    const event = await createHostEvent(payload);

    expect(event).toEqual({ id: 'new1' });

    const [url, options] = globalThis.fetch.mock.calls[0];
    expect(url).toMatch(/\/host\/events$/);
    expect(options.method).toBe('POST');
    expect(options.headers).toMatchObject({
      Authorization: 'Bearer jwt-token',
      'Content-Type': 'application/json',
    });
    expect(JSON.parse(options.body)).toEqual(payload);
  });

  test('updateHostEvent puts the payload to the event URL', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(response(200, { event: { id: 'abc' } }));

    await updateHostEvent('abc', payload);

    const [url, options] = globalThis.fetch.mock.calls[0];
    expect(url).toMatch(/\/host\/events\/abc$/);
    expect(options.method).toBe('PUT');
    expect(JSON.parse(options.body)).toEqual(payload);
  });

  test('a 400 with field errors becomes an ApiValidationError', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      response(400, {
        message: 'Please correct the highlighted fields.',
        errors: { title: 'Title is required.' },
      })
    );

    await expect(createHostEvent(payload)).rejects.toBeInstanceOf(ApiValidationError);
    await expect(createHostEvent(payload)).rejects.toMatchObject({
      status: 400,
      fieldErrors: { title: 'Title is required.' },
    });
  });

  test('a 403 on update becomes an ApiError with the server message', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      response(403, { message: 'You can only access your own events.' })
    );

    await expect(updateHostEvent('abc', payload)).rejects.toMatchObject({
      status: 403,
      message: 'You can only access your own events.',
    });
  });

  test('a 401 on create clears the session', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(response(401, { message: 'Invalid or expired token.' }));

    await expect(createHostEvent(payload)).rejects.toBeInstanceOf(SessionExpiredError);
    expect(sessionStorage.getItem('token')).toBeNull();
  });
});