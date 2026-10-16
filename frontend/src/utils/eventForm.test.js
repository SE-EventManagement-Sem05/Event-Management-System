import { describe, expect, test } from 'vitest';
import {
  EMPTY_FORM,
  toFormValues,
  toLocalInputValue,
  toPayload,
  validateEventForm,
} from './eventForm.js';

const NOW = new Date('2026-10-14T12:00');
const VALID = {
  title: 'Tech Meetup',
  description: 'Monthly meetup',
  date: '2030-06-15T10:30',
  venue: 'Hall A',
  price: '19.99',
  capacity: '10',
};

const check = (values, options = {}) => validateEventForm(values, { now: NOW, ...options });

describe('EMS-FR-07 form validation', () => {
  test('accepts valid values', () => {
    expect(check(VALID)).toEqual({});
  });

  test('reports every required field when the form is empty', () => {
    expect(Object.keys(check(EMPTY_FORM)).sort()).toEqual(
      ['capacity', 'date', 'description', 'price', 'title', 'venue']
    );
  });

  test('treats whitespace-only text as empty', () => {
    const errors = check({ ...VALID, title: '   ', description: ' ', venue: '  ' });

    expect(Object.keys(errors).sort()).toEqual(['description', 'title', 'venue']);
  });

  test('enforces text limits at the boundary', () => {
    expect(check({ ...VALID, title: 'a'.repeat(120) }).title).toBeUndefined();
    expect(check({ ...VALID, title: 'a'.repeat(121) }).title).toBeTruthy();
    expect(check({ ...VALID, description: 'a'.repeat(2001) }).description).toBeTruthy();
    expect(check({ ...VALID, venue: 'a'.repeat(201) }).venue).toBeTruthy();
  });

  test.each([
    ['badly formatted', '15/06/2030'],
    ['impossible day', '2030-02-31T10:00'],
    ['too far ahead', '2101-01-01T00:00'],
  ])('rejects an invalid date: %s', (_label, date) => {
    expect(check({ ...VALID, date }).date).toBe('Enter a valid date and time.');
  });

  test('rejects a date in the past or exactly now, accepts one minute ahead', () => {
    expect(check({ ...VALID, date: '2020-01-01T10:00' }).date).toBe(
      'Event date and time must be in the future.'
    );
    expect(check({ ...VALID, date: '2026-10-14T12:00' }).date).toBeTruthy();
    expect(check({ ...VALID, date: '2026-10-14T12:01' }).date).toBeUndefined();
  });

  test.each(['-1', 'abc', '12.345', '1000001', '1e3'])('rejects price %s', (price) => {
    expect(check({ ...VALID, price }).price).toBeTruthy();
  });

  test.each(['0', '0.01', '1000000', '49.5'])('accepts price %s', (price) => {
    expect(check({ ...VALID, price }).price).toBeUndefined();
  });

  test.each(['0', '-5', '1.5', '100001', 'abc'])('rejects capacity %s', (capacity) => {
    expect(check({ ...VALID, capacity }).capacity).toBeTruthy();
  });

  test.each(['1', '100000'])('accepts capacity %s', (capacity) => {
    expect(check({ ...VALID, capacity }).capacity).toBeUndefined();
  });

  describe('when editing', () => {
    const original = {
      title: 'Old',
      description: 'D',
      date: '2020-03-04T05:06:07.890Z',
      venue: 'V',
      price: 5,
      capacity: 3,
    };

    test('keeping the original date is allowed even if it is in the past', () => {
      expect(check(toFormValues(original), { originalEvent: original })).toEqual({});
    });

    test('changing a past event to another past date is rejected', () => {
      const values = { ...toFormValues(original), date: '2020-03-05T10:00' };

      expect(check(values, { originalEvent: original }).date).toBeTruthy();
    });
  });
});

describe('EMS-FR-07 form helpers', () => {
  test('toPayload trims text, converts numbers and sends a UTC ISO date', () => {
    const payload = toPayload({ ...VALID, title: '  Tech Meetup  ', price: '19.99', capacity: '10' });

    expect(payload).toEqual({
      title: 'Tech Meetup',
      description: 'Monthly meetup',
      date: new Date('2030-06-15T10:30').toISOString(),
      venue: 'Hall A',
      price: 19.99,
      capacity: 10,
    });
    expect(payload.date.endsWith('Z')).toBe(true);
  });

  test('an untouched date on edit is sent back exactly as stored', () => {
    const original = { date: '2020-03-04T05:06:07.890Z', title: 'T', description: 'D', venue: 'V', price: 1, capacity: 1 };

    expect(toPayload(toFormValues(original), original).date).toBe(original.date);
  });

  test('toFormValues pre-fills every field and tolerates missing price and capacity', () => {
    const values = toFormValues({
      title: 'T',
      description: 'D',
      date: '2030-06-15T10:30:00.000Z',
      venue: 'V',
      price: 0,
      capacity: 5,
    });

    expect(values).toMatchObject({ title: 'T', description: 'D', venue: 'V', price: '0', capacity: '5' });
    expect(values.date).toBe(toLocalInputValue('2030-06-15T10:30:00.000Z'));

    const legacy = toFormValues({ title: 'Old', date: '2030-06-15T10:30:00.000Z' });
    expect(legacy.price).toBe('');
    expect(legacy.capacity).toBe('');
  });

  test('toLocalInputValue returns an empty string for an invalid date', () => {
    expect(toLocalInputValue('not a date')).toBe('');
  });
});