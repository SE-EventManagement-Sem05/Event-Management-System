import { fireEvent, render, screen } from '@testing-library/react';
import AttendeeDashboard from '../../../frontend/src/pages/AttendeeDashboard.jsx';

describe('AttendeeDashboard', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('greets the attendee using the stored profile name', () => {
    sessionStorage.setItem('user', JSON.stringify({ name: 'Sharanya' }));

    render(<AttendeeDashboard />);

    expect(screen.getByText('Welcome, Sharanya!')).toBeInTheDocument();
  });

  test('uses the generic greeting when the stored name is absent', () => {
    sessionStorage.setItem('user', JSON.stringify({}));

    render(<AttendeeDashboard />);

    expect(screen.getByText('Welcome, Attendee!')).toBeInTheDocument();
  });

  test('logout clears the stored token and user', () => {
    sessionStorage.setItem('token', 'test-token');
    sessionStorage.setItem('user', JSON.stringify({ name: 'Test User' }));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<AttendeeDashboard />);
    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(sessionStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('user')).toBeNull();
  });
});
