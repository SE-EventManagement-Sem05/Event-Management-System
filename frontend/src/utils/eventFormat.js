export function formatEventDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Date to be announced';

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function formatPrice(price) {
  if (price === undefined || price === null) return 'Not set';
  if (price === 0) return 'Free';

  return Number(price).toFixed(2);
}

export function formatCapacity(capacity) {
  if (capacity === undefined || capacity === null) return 'Not set';

  return String(capacity);
}