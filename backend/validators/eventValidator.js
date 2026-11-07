
const LIMITS = {
  title: 120,
  description: 2000,
  venue: 200,
  category: 50,
  maxPrice: 1000000,
  maxCapacity: 100000,
  maxYear: 2100,
};

// The API accepts dates only as UTC ISO strings.
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function validateText(input, field, label, max, errors) {
  if (typeof input !== 'string' || !input.trim()) {
    errors[field] = `${label} is required.`;
    return undefined;
  }

  const text = input.trim();

  if (text.length > max) {
    errors[field] = `${label} must be ${max} characters or fewer.`;
    return undefined;
  }

  return text;
}

function validateDate(input, existingDate, now, errors) {
  if (typeof input !== 'string' || !input.trim()) {
    errors.date = 'Date and time are required.';
    return undefined;
  }

  const parsed = new Date(input);

  if (
    !ISO_UTC.test(input) ||
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString() !== input ||
    parsed.getUTCFullYear() > LIMITS.maxYear
  ) {
    errors.date = 'Enter a valid date and time.';
    return undefined;
  }

  const unchanged =
    existingDate && parsed.getTime() === existingDate.getTime();

  if (!unchanged && parsed.getTime() <= now.getTime()) {
    errors.date = 'Event date and time must be in the future.';
    return undefined;
  }

  return parsed;
}

function validatePrice(input, errors) {
  if (input === undefined || input === null || input === '') {
    errors.price = 'Price is required.';
    return undefined;
  }

  if (typeof input !== 'number' || !Number.isFinite(input)) {
    errors.price = 'Price must be a number.';
    return undefined;
  }

  if (input < 0 || input > LIMITS.maxPrice) {
    errors.price = 'Price must be between 0 and 1,000,000.';
    return undefined;
  }

  if (Math.round(input * 100) / 100 !== input) {
    errors.price = 'Price can have at most 2 decimal places.';
    return undefined;
  }

  return input;
}

function validateCapacity(input, errors) {
  if (input === undefined || input === null || input === '') {
    errors.capacity = 'Capacity is required.';
    return undefined;
  }

  if (typeof input !== 'number' || !Number.isInteger(input)) {
    errors.capacity = 'Capacity must be a whole number.';
    return undefined;
  }

  if (input < 1 || input > LIMITS.maxCapacity) {
    errors.capacity = 'Capacity must be between 1 and 100,000.';
    return undefined;
  }

  return input;
}

function validateEventInput(body, { existingDate = null, now = new Date() } = {}) {
  const input =
    body && typeof body === 'object' && !Array.isArray(body) ? body : {};

  const errors = {};

  const category =
    input.category === undefined || input.category === null
      ? ''
      : input.category;

  let validatedCategory = '';

  if (typeof category !== 'string') {
    errors.category = 'Category must be text.';
  } else if (category.trim().length > LIMITS.category) {
    errors.category = `Category must be ${LIMITS.category} characters or fewer.`;
  } else {
    validatedCategory = category.trim();
  }

  const value = {
    title: validateText(input.title, 'title', 'Title', LIMITS.title, errors),
    description: validateText(
      input.description,
      'description',
      'Description',
      LIMITS.description,
      errors
    ),
    date: validateDate(input.date, existingDate, now, errors),
    venue: validateText(input.venue, 'venue', 'Venue', LIMITS.venue, errors),
    category: validatedCategory,
    price: validatePrice(input.price, errors),
    capacity: validateCapacity(input.capacity, errors),
  };

  return { errors, value };
}

module.exports = { validateEventInput, LIMITS };
