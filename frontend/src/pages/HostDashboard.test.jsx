import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import HostDashboard from './HostDashboard.jsx';
import { fetchHostEvents } from '../utils/events.js';

vi.mock('../utils/events.js', () => ({
  fetchHostEvents: vi.fn(),
  SessionExpiredError: class SessionExpiredError extends Error {},
}));

const UPCOMING = {
  events: [{ id: 'u1', title: 'Future Fest', date: '2030-01-01T10:00:00.000Z', venue: 'Hall A' }],
  total: 1,
  totalPages: 1,
};
const PAST = {
  events: [{ id: 'p1', title: 'Old Gala', date: '2020-01-01T10:00:00.000Z', venue: 'Hall B' }],
  total: 1,
  totalPages: 1,
};
const NONE = { events: [], total: 0, totalPages: 0 };

function renderDashboard() {
  return render(
    <MemoryRouter>
      <HostDashboard />
    </MemoryRouter>
  );
}

beforeEach(() => {
  sessionStorage.setItem('user', JSON.stringify({ name: 'Host One', role: 'host' }));
  fetchHostEvents.mockReset();
});

describe('EMS-FR-05 Host dashboard', () => {
  test('welcomes the host and requests upcoming and past events separately', async () => {
    fetchHostEvents.mockImplementation(async ({ status }) => (status === 'upcoming' ? UPCOMING : PAST));
    renderDashboard();

    expect(screen.getByText('Welcome, Host One!')).toBeInTheDocument();
    await screen.findByText('Future Fest');

    expect(fetchHostEvents).toHaveBeenCalledWith({ status: 'upcoming', page: 1, limit: 6 });
    expect(fetchHostEvents).toHaveBeenCalledWith({ status: 'past', page: 1, limit: 6 });
  });

  test('shows Upcoming first and the Past list after switching tabs', async () => {
    fetchHostEvents.mockImplementation(async ({ status }) => (status === 'upcoming' ? UPCOMING : PAST));
    const user = userEvent.setup();
    renderDashboard();

    expect(await screen.findByText('Future Fest')).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Upcoming' })).toHaveAttribute('aria-selected', 'true');
    expect(await screen.findByText('Old Gala')).not.toBeVisible();

    await user.click(screen.getByRole('tab', { name: 'Past' }));

    expect(screen.getByText('Old Gala')).toBeVisible();
    expect(screen.getByText('Future Fest')).not.toBeVisible();
    expect(screen.getByRole('tab', { name: 'Past' })).toHaveAttribute('aria-selected', 'true');
  });

  test('shows an empty message in each tab for a host without events', async () => {
    fetchHostEvents.mockResolvedValue(NONE);
    const user = userEvent.setup();
    renderDashboard();

    expect(await screen.findByText('You have no upcoming events yet.')).toBeVisible();

    await user.click(screen.getByRole('tab', { name: 'Past' }));

    expect(await screen.findByText('You have no past events yet.')).toBeVisible();
  });

  test('every event title links to its details page (EMS-FR-06)', async () => {
    fetchHostEvents.mockImplementation(async ({ status }) => (status === 'upcoming' ? UPCOMING : PAST));
    renderDashboard();

    await screen.findByText('Future Fest');
    await screen.findByText('Old Gala');

    expect(screen.getByRole('link', { name: 'Future Fest' })).toHaveAttribute('href', '/host/events/u1');
    expect(screen.getByRole('link', { name: 'Old Gala', hidden: true })).toHaveAttribute(
      'href',
      '/host/events/p1'
    );
  });
});