import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AttendeeDashboard from '../../../frontend/src/pages/AttendeeDashboard.jsx';

describe('AttendeeDashboard', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderDashboard = () => {
    return render(
      <MemoryRouter>
        <AttendeeDashboard />
      </MemoryRouter>
    );
  };

  test('greets the attendee using the stored profile name', () => {
    sessionStorage.setItem('user', JSON.stringify({ name: 'Sharanya' }));

    renderDashboard();

    expect(
      screen.getByText((_, element) =>
        element.tagName === 'P' &&
        element.textContent.includes('Welcome, Sharanya!')
      )
    ).toBeInTheDocument();
  });

  test('uses the generic greeting when the stored name is absent', () => {
    sessionStorage.setItem('user', JSON.stringify({}));

    renderDashboard();

    expect(
      screen.getByText((_, element) =>
        element.tagName === 'P' &&
        element.textContent.includes('Welcome, Attendee!')
      )
    ).toBeInTheDocument();
  });

  test('logout clears the stored token and user', () => {
    sessionStorage.setItem('token', 'test-token');
    sessionStorage.setItem('user', JSON.stringify({ name: 'Test User' }));

    renderDashboard();

    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(sessionStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('user')).toBeNull();
  });
});
