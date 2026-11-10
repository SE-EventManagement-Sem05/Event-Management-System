import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Signup from '../../../frontend/src/pages/Signup.jsx';

function change(label, value) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function fillValidForm() {
  change('Name', 'Test Attendee');
  change('Email', 'attendee@example.com');
  change('Password', 'Password123');
  change('Confirm Password', 'Password123');
  change('Role', 'attendee');
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Signup form validation', () => {
  test('shows required errors when submitted empty', () => {
    render(<Signup />);
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(screen.getByText('Name is required.')).toBeInTheDocument();
    expect(screen.getByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(screen.getByText('Please confirm your password.')).toBeInTheDocument();
    expect(screen.getByText('Please select a role.')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  test('rejects an invalid email, short password and mismatched confirmation', () => {
    render(<Signup />);
    change('Name', 'Test User');
    change('Email', 'not-an-email');
    change('Password', 'short');
    change('Confirm Password', 'different');
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument();
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    expect(screen.getByText('Please select a role.')).toBeInTheDocument();
  });

  test('clears a field error when that field changes', () => {
    render(<Signup />);
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(screen.getByText('Name is required.')).toBeInTheDocument();

    change('Name', 'Sharanya');
    expect(screen.queryByText('Name is required.')).not.toBeInTheDocument();
  });
});

describe('Signup submission', () => {
  test('sends the validated fields and shows success', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Account created successfully.' }),
    });

    render(<Signup />);
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(screen.getByText('Account created successfully.')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/auth/signup',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Attendee',
          email: 'attendee@example.com',
          password: 'Password123',
          role: 'attendee',
        }),
      })
    );

    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('Email')).toHaveValue('');
    expect(screen.getByLabelText('Password')).toHaveValue('');
    expect(screen.getByLabelText('Confirm Password')).toHaveValue('');
    expect(screen.getByLabelText('Role')).toHaveValue('');
  });

  test.each([
    [{ message: 'An account with this email already exists.' }, 'An account with this email already exists.'],
    [{}, 'Unable to create account.'],
  ])('shows the server error message or fallback', async (payload, expected) => {
    fetch.mockResolvedValue({
      ok: false,
      json: async () => payload,
    });

    render(<Signup />);
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(await screen.findByText(expected)).toBeInTheDocument();
    expect(screen.queryByText('Account created successfully.')).not.toBeInTheDocument();
  });

  test('shows a connection error when the request rejects', async () => {
    fetch.mockRejectedValue(new Error('network unavailable'));

    render(<Signup />);
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(await screen.findByText('Unable to connect to the server.')).toBeInTheDocument();
  });
});
