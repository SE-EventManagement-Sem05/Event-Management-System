import { describe, expect, test } from 'vitest';
import { formatCapacity, formatEventDate, formatPrice } from './eventFormat.js';

describe('EMS-FR-06 event formatting', () => {
  test.each([
    [undefined, 'Not set'],
    [null, 'Not set'],
    [0, 'Free'],
    [499.99, '499.99'],
    [250, '250.00'],
    [0.5, '0.50'],
  ])('formatPrice(%s) is "%s"', (price, expected) => {
    expect(formatPrice(price)).toBe(expected);
  });

  test.each([
    [undefined, 'Not set'],
    [null, 'Not set'],
    [150, '150'],
    [1, '1'],
  ])('formatCapacity(%s) is "%s"', (capacity, expected) => {
    expect(formatCapacity(capacity)).toBe(expected);
  });

  test('formatEventDate shows a readable date', () => {
    expect(formatEventDate('2030-06-15T10:30:00.000Z')).toContain('2030');
  });

  test('formatEventDate handles an invalid date', () => {
    expect(formatEventDate('not a date')).toBe('Date to be announced');
  });
});