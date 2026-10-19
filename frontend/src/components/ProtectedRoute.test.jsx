import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';
import ProtectedRoute from './ProtectedRoute.jsx';
import { useLocation } from 'react-router-dom';

function renderProtected(role) {
  return render(
    <MemoryRouter initialEntries={['/secret']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute role={role} />}>
          <Route path="/secret" element={<p>SECRET CONTENT</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

function startSession(role) {
  sessionStorage.setItem('token', 'jwt-token');
  sessionStorage.setItem('user', JSON.stringify({ id: 1, name: 'T', role }));
}
function LoginPage() {
  const location = useLocation();

  return (
    <div>
      <p>LOGIN PAGE</p>
      {location.state?.message && (
        <p role="alert">{location.state.message}</p>
      )}
    </div>
  );
}

describe('EMS-FR-04 ProtectedRoute', () => {
  test('redirects to login when there is no session', async () => {
    globalThis.fetch = vi.fn();
    renderProtected('host');

    expect(await screen.findByText('LOGIN PAGE')).toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test('redirects to login when the role does not match', async () => {
    globalThis.fetch = vi.fn();
    startSession('attendee');
    renderProtected('host');

    expect(await screen.findByText('LOGIN PAGE')).toBeInTheDocument();
  });

  test('shows the page when the server accepts the token', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    startSession('host');
    renderProtected('host');

    expect(await screen.findByText('SECRET CONTENT')).toBeInTheDocument();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/host/dashboard'),
      expect.objectContaining({ headers: { Authorization: 'Bearer jwt-token' } })
    );
  });

  test('clears the session and redirects when the server rejects the token', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401 });
    startSession('host');
    renderProtected('host');

    expect(await screen.findByText('LOGIN PAGE')).toBeInTheDocument();
    expect(sessionStorage.getItem('token')).toBeNull();
  });

  test('shows a clear message when the backend cannot be reached', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    startSession('host');
    renderProtected('host');

    expect(await screen.findByRole('alert')).toHaveTextContent(/unable to verify your session/i);
  });

    test('redirects with an explanation when the token is expired', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    });
    startSession('host');

    renderProtected('host');

    expect(await screen.findByText('LOGIN PAGE')).toBeInTheDocument();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /session.*expired|invalid/i
    );
    expect(sessionStorage.getItem('token')).toBeNull();
  });

  test('does not log the user out for a 403 permission response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
    });
    startSession('host');

    renderProtected('host');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /unable to verify your session/i
    );
    expect(sessionStorage.getItem('token')).toBe('jwt-token');
  });
});