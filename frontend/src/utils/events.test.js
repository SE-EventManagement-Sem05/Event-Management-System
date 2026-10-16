import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ApiError, SessionExpiredError, fetchHostEvent } from './events.js';

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

    await expect(fetchHostEvent('abc')).rejects.toMatchObject({
      status: 500,
      message: 'Unable to complete the request. Please try again.',
    });
  });

  test('a network failure becomes an ApiError with status 0', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(fetchHostEvent('abc')).rejects.toMatchObject({
      status: 0,
      message: 'Unable to connect to the server. Please try again.',
    });
  });
});