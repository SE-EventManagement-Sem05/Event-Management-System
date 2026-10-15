import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';
import Login from './Login.jsx';

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<p>SIGNUP PAGE</p>} />
        <Route path="/host/dashboard" element={<p>HOST DASHBOARD PAGE</p>} />
        <Route path="/attendee/dashboard" element={<p>ATTENDEE DASHBOARD PAGE</p>} />
      </Routes>
    </MemoryRouter>
  );
}

function reply(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      if (body === undefined) throw new Error('no JSON body');
      return body;
    },
  };
}

function mockFetch(status, body) {
  globalThis.fetch = vi.fn().mockResolvedValue(reply(status, body));
}

const HOST_LOGIN = {
  status: 'success',
  token: 'jwt-token',
  user: { id: 1, name: 'Host One', email: 'host1@test.com', role: 'host' },
};

const ATTENDEE_LOGIN = {
  status: 'success',
  token: 'jwt-token',
  user: { id: 2, name: 'Att One', email: 'att1@test.com', role: 'attendee' },
};

async function fillAndSubmit(user, { role, email = 'user@test.com', password = 'Password123' } = {}) {
  if (role) await user.selectOptions(screen.getByLabelText('Sign in as'), role);
  if (email) await user.type(screen.getByLabelText('Email address'), email);
  if (password) await user.type(screen.getByLabelText('Password'), password);
  await user.click(screen.getByRole('button', { name: /^sign in$/i }));
}

describe('EMS-FR-03 Login form', () => {
  test('has a role selector, email, password and a submit button', () => {
    renderLogin();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome back');
    expect(screen.getByLabelText('Email address')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
  });

  test('the role selector offers Attendee and Host and starts on Attendee', () => {
    renderLogin();

    const select = screen.getByLabelText('Sign in as');

    expect(select).toHaveValue('attendee');
    expect(screen.getByRole('option', { name: 'Attendee' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Host' })).toBeInTheDocument();
  });

  test('has a link to create an account', async () => {
    renderLogin();
    const user = userEvent.setup();

    const link = screen.getByRole('link', { name: 'Create account' });
    expect(link).toHaveAttribute('href', '/signup');

    await user.click(link);

    expect(await screen.findByText('SIGNUP PAGE')).toBeInTheDocument();
  });
});

describe('EMS-FR-03 Login form validation', () => {
  test('an empty form shows what is missing and sends nothing', async () => {
    globalThis.fetch = vi.fn();
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(screen.getByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test('a malformed email is rejected without calling the API', async () => {
    globalThis.fetch = vi.fn();
    const user = userEvent.setup();
    renderLogin();

    await fillAndSubmit(user, { email: 'not-an-email' });

    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test('a message disappears once the user edits that field', async () => {
    globalThis.fetch = vi.fn();
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByText('Email is required.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Email address'), 'a');

    expect(screen.queryByText('Email is required.')).not.toBeInTheDocument();
  });
});

describe('EMS-FR-03 Login request and session', () => {
  test('sends the role, email and password as JSON to the login endpoint', async () => {
    mockFetch(200, HOST_LOGIN);
    const user = userEvent.setup();
    renderLogin();

    await fillAndSubmit(user, { role: 'host', email: 'host1@test.com' });
    await screen.findByText('HOST DASHBOARD PAGE');

    const [url, options] = globalThis.fetch.mock.calls[0];

    expect(url).toMatch(/\/auth\/login$/);
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toEqual({
      role: 'host',
      email: 'host1@test.com',
      password: 'Password123',
    });
  });

  test('a host login saves the session and opens the host dashboard', async () => {
    mockFetch(200, HOST_LOGIN);
    const user = userEvent.setup();
    renderLogin();

    await fillAndSubmit(user, { role: 'host', email: 'host1@test.com' });

    expect(await screen.findByText('HOST DASHBOARD PAGE')).toBeInTheDocument();
    expect(sessionStorage.getItem('token')).toBe('jwt-token');
    expect(JSON.parse(sessionStorage.getItem('user'))).toEqual(HOST_LOGIN.user);
  });

  test('an attendee login opens the attendee dashboard', async () => {
    mockFetch(200, ATTENDEE_LOGIN);
    const user = userEvent.setup();
    renderLogin();

    await fillAndSubmit(user, { email: 'att1@test.com' });

    expect(await screen.findByText('ATTENDEE DASHBOARD PAGE')).toBeInTheDocument();
    expect(JSON.parse(sessionStorage.getItem('user')).role).toBe('attendee');
  });

  test('the dashboard follows the role the server returns, not the one picked', async () => {
    mockFetch(200, ATTENDEE_LOGIN);
    const user = userEvent.setup();
    renderLogin();

    await fillAndSubmit(user, { role: 'host', email: 'att1@test.com' });

    expect(await screen.findByText('ATTENDEE DASHBOARD PAGE')).toBeInTheDocument();
  });
});

describe('EMS-FR-03 Login failures', () => {
  test('invalid credentials show the server message and store nothing', async () => {
    mockFetch(401, { message: 'Invalid email or password.' });
    const user = userEvent.setup();
    renderLogin();

    await fillAndSubmit(user);

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.');
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('user')).toBeNull();
    expect(screen.queryByText('ATTENDEE DASHBOARD PAGE')).not.toBeInTheDocument();
  });

  test('a role mismatch shows the server message', async () => {
    mockFetch(403, { message: 'This account does not belong to the selected role.' });
    const user = userEvent.setup();
    renderLogin();

    await fillAndSubmit(user, { role: 'host' });

    expect(await screen.findByText('This account does not belong to the selected role.')).toBeInTheDocument();
    expect(sessionStorage.getItem('token')).toBeNull();
  });

  test('an error without a message gets a default one', async () => {
    mockFetch(500, undefined);
    const user = userEvent.setup();
    renderLogin();

    await fillAndSubmit(user);

    expect(await screen.findByText('Unable to log in. Please try again.')).toBeInTheDocument();
  });

  test('a success reply without a token or user is treated as a failure', async () => {
    mockFetch(200, { status: 'success' });
    const user = userEvent.setup();
    renderLogin();

    await fillAndSubmit(user);

    expect(await screen.findByText('Unable to log in. Please try again.')).toBeInTheDocument();
    expect(sessionStorage.getItem('token')).toBeNull();
  });

  test('a network failure shows a clear message and the user can try again', async () => {
    globalThis.fetch = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(reply(200, ATTENDEE_LOGIN));
    const user = userEvent.setup();
    renderLogin();

    await fillAndSubmit(user);

    expect(
      await screen.findByText('Unable to connect to the server. Please try again.')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toHaveValue('user@test.com');

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('ATTENDEE DASHBOARD PAGE')).toBeInTheDocument();
  });

  test('the button is disabled while the request is pending', async () => {
    globalThis.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    renderLogin();

    await fillAndSubmit(user);

    const button = await screen.findByRole('button', { name: /signing in/i });
    expect(button).toBeDisabled();
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(1));
  });
});