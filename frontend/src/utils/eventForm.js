export const LIMITS = {
  title: 120,
  description: 2000,
  venue: 200,
  maxPrice: 1000000,
  maxCapacity: 100000,
  maxYear: 2100,
};

export const EMPTY_FORM = {
  title: '',
  description: '',
  date: '',
  venue: '',
  price: '',
  capacity: '',
};

const LOCAL_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;
const WHOLE_NUMBER = /^\d+$/;

const pad = (number) => String(number).padStart(2, '0');

// Converts an ISO date into the "YYYY-MM-DDTHH:mm" local time a
// datetime-local input uses.
export function toLocalInputValue(iso) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return '';

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function toFormValues(event) {
  const text = (value) => (value === undefined || value === null ? '' : String(value));

  return {
    title: text(event.title),
    description: text(event.description),
    date: toLocalInputValue(event.date),
    venue: text(event.venue),
    price: text(event.price),
    capacity: text(event.capacity),
  };
}

function isDateUnchanged(values, originalEvent) {
  return Boolean(originalEvent) && toLocalInputValue(originalEvent.date) === values.date;
}

function checkText(values, field, label, max, errors) {
  const text = values[field].trim();

  if (!text) {
    errors[field] = `${label} is required.`;
  } else if (text.length > max) {
    errors[field] = `${label} must be ${max} characters or fewer.`;
  }
}

export function validateEventForm(values, { originalEvent = null, now = new Date() } = {}) {
  const errors = {};

  checkText(values, 'title', 'Title', LIMITS.title, errors);
  checkText(values, 'description', 'Description', LIMITS.description, errors);
  checkText(values, 'venue', 'Venue', LIMITS.venue, errors);

  if (!values.date) {
    errors.date = 'Date and time are required.';
  } else {
    const parsed = new Date(values.date);
    const isValid =
      LOCAL_DATETIME.test(values.date) &&
      !Number.isNaN(parsed.getTime()) &&
      toLocalInputValue(parsed.toISOString()) === values.date &&
      parsed.getFullYear() <= LIMITS.maxYear;

    if (!isValid) {
      errors.date = 'Enter a valid date and time.';
    } else if (!isDateUnchanged(values, originalEvent) && parsed.getTime() <= now.getTime()) {
      errors.date = 'Event date and time must be in the future.';
    }
  }

  const price = values.price.trim();

  if (!price) {
    errors.price = 'Price is required.';
  } else if (!PRICE_PATTERN.test(price)) {
    errors.price = 'Price must be a number with at most 2 decimal places.';
  } else if (Number(price) > LIMITS.maxPrice) {
    errors.price = 'Price must be between 0 and 1,000,000.';
  }

  const capacity = values.capacity.trim();

  if (!capacity) {
    errors.capacity = 'Capacity is required.';
  } else if (!WHOLE_NUMBER.test(capacity)) {
    errors.capacity = 'Capacity must be a whole number.';
  } else if (Number(capacity) < 1 || Number(capacity) > LIMITS.maxCapacity) {
    errors.capacity = 'Capacity must be between 1 and 100,000.';
  }

  return errors;
}

// Builds the API request body. When editing and the date field was not
// touched, the original date is sent back unchanged.
export function toPayload(values, originalEvent = null) {
  const date = isDateUnchanged(values, originalEvent)
    ? new Date(originalEvent.date).toISOString()
    : new Date(values.date).toISOString();

  return {
    title: values.title.trim(),
    description: values.description.trim(),
    date,
    venue: values.venue.trim(),
    price: Number(values.price),
    capacity: Number(values.capacity),
  };
}