import { API_BASE, getToken, clearSession } from './auth.js';

export class SessionExpiredError extends Error {}

export async function fetchHostEvents({ status, page, limit = 6 }) {
  const params = new URLSearchParams({
    status,
    page: String(page),
    limit: String(limit),
  });

  let response;

  try {
    response = await fetch(`${API_BASE}/host/events?${params}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  } catch {
    throw new Error('Unable to connect to the server. Please try again.');
  }

  if (response.status === 401 || response.status === 403) {
    clearSession();
    throw new SessionExpiredError('Your session has expired. Please log in again.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Unable to load events. Please try again.');
  }

  return data;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function authorizedRequest(path) {
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  } catch {
    throw new ApiError('Unable to connect to the server. Please try again.', 0);
  }

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    clearSession();
    throw new SessionExpiredError('Your session has expired. Please log in again.');
  }

  if (!response.ok) {
    throw new ApiError(
      data.message || 'Unable to complete the request. Please try again.',
      response.status
    );
  }

  return data;
}

export async function fetchHostEvent(id) {
  const data = await authorizedRequest(`/host/events/${encodeURIComponent(id)}`);
  return data.event;
}