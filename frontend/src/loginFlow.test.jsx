import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';
import App from './App.jsx';

function reply(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

// Answers each endpoint the login journey touches.
function mockApi({ login }) {
  globalThis.fetch = vi.fn(async (url) => {
    const target = String(url);

    if (target.endsWith('/auth/login')) return login;
    if (target.includes('/host/dashboard')) return reply(200, { message: 'Welcome to the Host dashboard.' });
    if (target.includes('/attendee/dashboard')) return reply(200, { message: 'Welcome to the Attendee dashboard.' });
    if (target.includes('/host/events')) {
      return reply(200, { events: [], total: 0, totalPages: 0, page: 1, limit: 6 });
    }

    return reply(404, {});
  });
}

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <App />
    </MemoryRouter>
  );
}

describe('EMS-FR-03 login journey through the app', () => {
  test('a host who logs in reaches the guarded host dashboard', async () => {
    mockApi({
      login: reply(200, {
        status: 'success',
        token: 'jwt-token',
        user: { id: 1, name: 'Host One', email: 'host1@test.com', role: 'host' },
      }),
    });
    const user = userEvent.setup();
    renderLogin();

    await user.selectOptions(screen.getByLabelText('Sign in as'), 'host');
    await user.type(screen.getByLabelText('Email address'), 'host1@test.com');
    await user.type(screen.getByLabelText('Password'), 'Password123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Host Dashboard' })).toBeInTheDocument();
    expect(screen.getByText(/Welcome, Host One!/)).toBeInTheDocument();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/host/dashboard'),
      expect.objectContaining({ headers: { Authorization: 'Bearer jwt-token' } })
    );
  });

  test('an attendee who logs in reaches the guarded attendee dashboard', async () => {
    mockApi({
      login: reply(200, {
        status: 'success',
        token: 'jwt-token',
        user: { id: 2, name: 'Att One', email: 'att1@test.com', role: 'attendee' },
      }),
    });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText('Email address'), 'att1@test.com');
    await user.type(screen.getByLabelText('Password'), 'Password123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Attendee Dashboard' })).toBeInTheDocument();
  });

  test('wrong credentials keep the user on the login page with no session', async () => {
    mockApi({ login: reply(401, { message: 'Invalid email or password.' }) });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText('Email address'), 'att1@test.com');
    await user.type(screen.getByLabelText('Password'), 'Wrong1234');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Welcome back' })).toBeInTheDocument();
    expect(sessionStorage.getItem('token')).toBeNull();
  });
});