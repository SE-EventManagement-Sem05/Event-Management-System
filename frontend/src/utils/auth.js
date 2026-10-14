const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function saveSession(token, user) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  try {
    return JSON.parse(sessionStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}