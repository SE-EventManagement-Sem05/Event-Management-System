import { describe, expect, test } from 'vitest';
import { API_BASE, clearSession, getToken, getUser, saveSession } from './auth.js';

const USER = { id: 7, name: 'Host One', email: 'host1@test.com', role: 'host' };

describe('EMS-FR-03 session helpers', () => {
  test('saveSession keeps the token and user in sessionStorage under the keys the dashboards read', () => {
    saveSession('jwt-token', USER);

    expect(sessionStorage.getItem('token')).toBe('jwt-token');
    expect(JSON.parse(sessionStorage.getItem('user'))).toEqual(USER);
  });

  test('saveSession does not use localStorage', () => {
    saveSession('jwt-token', USER);

    expect(localStorage.length).toBe(0);
  });

  test('getToken and getUser return what was saved', () => {
    saveSession('jwt-token', USER);

    expect(getToken()).toBe('jwt-token');
    expect(getUser()).toEqual(USER);
  });

  test('without a session, getToken and getUser return null', () => {
    expect(getToken()).toBeNull();
    expect(getUser()).toBeNull();
  });

  test('getUser returns null when the stored user is not valid JSON', () => {
    sessionStorage.setItem('user', '{not json');

    expect(getUser()).toBeNull();
  });

  test('clearSession removes both the token and the user', () => {
    saveSession('jwt-token', USER);

    clearSession();

    expect(getToken()).toBeNull();
    expect(getUser()).toBeNull();
  });

  test('a new login replaces the previous session', () => {
    saveSession('first-token', USER);
    saveSession('second-token', { ...USER, role: 'attendee' });

    expect(getToken()).toBe('second-token');
    expect(getUser().role).toBe('attendee');
  });

  test('API_BASE is a path or URL ending without a slash', () => {
    expect(typeof API_BASE).toBe('string');
    expect(API_BASE.endsWith('/')).toBe(false);
  });
});