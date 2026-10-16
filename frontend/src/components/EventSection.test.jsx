import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import EventSection from './EventSection.jsx';
import { SessionExpiredError } from '../utils/events.js';
import { MemoryRouter } from 'react-router-dom';



const ISO_DATE = '2030-01-15T10:30:00.000Z';

function sample(count, offset = 0) {
  return Array.from({ length: count }, (_, index) => ({
    id: `e${offset + index + 1}`,
    title: `Event ${offset + index + 1}`,
    date: ISO_DATE,
    venue: `Venue ${offset + index + 1}`,
  }));
}

function renderSection(fetchPage, props = {}) {
  return render(
    <EventSection
      title="Upcoming events"
      status="upcoming"
      emptyMessage="You have no upcoming events yet."
      fetchPage={fetchPage}
      {...props}
    />
  );
}

describe('EMS-FR-05 EventSection', () => {
  test('requests page 1 with the right status and page size', async () => {
    const fetchPage = vi.fn().mockResolvedValue({ events: sample(1), total: 1, totalPages: 1 });
    renderSection(fetchPage);

    await screen.findByText('Event 1');

    expect(fetchPage).toHaveBeenCalledWith({ status: 'upcoming', page: 1, limit: 6 });
    
  });

  test('each card shows title, date and venue', async () => {
    const fetchPage = vi.fn().mockResolvedValue({ events: sample(2), total: 2, totalPages: 1 });
    const { container } = renderSection(fetchPage);

    expect(await screen.findByText('Event 1')).toBeInTheDocument();
    expect(screen.getByText('Venue 1')).toBeInTheDocument();
    expect(screen.getByText('Event 2')).toBeInTheDocument();
    expect(screen.getByText('Venue 2')).toBeInTheDocument();

    const times = container.querySelectorAll('time');
    expect(times).toHaveLength(2);
    expect(times[0]).toHaveAttribute('dateTime', ISO_DATE);
    expect(times[0].textContent).not.toBe('');
  });

  test('shows the empty message and no pagination when there are no events', async () => {
    const fetchPage = vi.fn().mockResolvedValue({ events: [], total: 0, totalPages: 0 });
    renderSection(fetchPage);

    expect(await screen.findByText('You have no upcoming events yet.')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  test('hides pagination when everything fits on one page', async () => {
    const fetchPage = vi.fn().mockResolvedValue({ events: sample(3), total: 3, totalPages: 1 });
    renderSection(fetchPage);

    await screen.findByText('Event 1');

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  test('Next and Previous move between pages and respect the boundaries', async () => {
    const fetchPage = vi.fn(async ({ page }) =>
      page === 1
        ? { events: sample(6), total: 8, totalPages: 2 }
        : { events: sample(2, 6), total: 8, totalPages: 2 }
    );
    const user = userEvent.setup();
    renderSection(fetchPage);

    await screen.findByText('Event 1');
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(await screen.findByText('Event 7')).toBeInTheDocument();
    expect(fetchPage).toHaveBeenLastCalledWith({ status: 'upcoming', page: 2, limit: 6 });
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Previous' }));

    expect(await screen.findByText('Event 1')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  });

  test('steps back to a valid page when the current page no longer exists', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({ events: sample(6), total: 8, totalPages: 2 })
      .mockResolvedValueOnce({ events: [], total: 6, totalPages: 1 })
      .mockResolvedValueOnce({ events: sample(6), total: 6, totalPages: 1 });
    const user = userEvent.setup();
    renderSection(fetchPage);

    await screen.findByText('Event 1');
    await user.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() =>
      expect(fetchPage).toHaveBeenLastCalledWith({ status: 'upcoming', page: 1, limit: 6 })
    );
    expect(await screen.findByText('Event 1')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  test('shows an error and recovers when Try again is clicked', async () => {
    const fetchPage = vi
      .fn()
      .mockRejectedValueOnce(new Error('Unable to connect to the server. Please try again.'))
      .mockResolvedValueOnce({ events: sample(1), total: 1, totalPages: 1 });
    const user = userEvent.setup();
    renderSection(fetchPage);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to connect to the server. Please try again.'
    );

    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(await screen.findByText('Event 1')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('tells the parent when the session has expired', async () => {
    const fetchPage = vi.fn().mockRejectedValue(new SessionExpiredError('expired'));
    const onSessionExpired = vi.fn();
    renderSection(fetchPage, { onSessionExpired });

    await waitFor(() => expect(onSessionExpired).toHaveBeenCalledTimes(1));
  });

    test('each title links to the details page when getDetailsPath is given (EMS-FR-06)', async () => {
    const fetchPage = vi.fn().mockResolvedValue({ events: sample(2), total: 2, totalPages: 1 });

    render(
      <MemoryRouter>
        <EventSection
          title="Upcoming events"
          status="upcoming"
          emptyMessage="none"
          fetchPage={fetchPage}
          getDetailsPath={(event) => `/host/events/${event.id}`}
        />
      </MemoryRouter>
    );

    expect(await screen.findByRole('link', { name: 'Event 1' })).toHaveAttribute('href', '/host/events/e1');
    expect(screen.getByRole('link', { name: 'Event 2' })).toHaveAttribute('href', '/host/events/e2');
  });

  test('titles are plain text when getDetailsPath is not given', async () => {
    const fetchPage = vi.fn().mockResolvedValue({ events: sample(1), total: 1, totalPages: 1 });
    renderSection(fetchPage);

    await screen.findByText('Event 1');

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

    test('shows an Edit link on each card when getEditPath is given (EMS-FR-07)', async () => {
    const fetchPage = vi.fn().mockResolvedValue({ events: sample(2), total: 2, totalPages: 1 });

    render(
      <MemoryRouter>
        <EventSection
          title="Upcoming events"
          status="upcoming"
          emptyMessage="none"
          fetchPage={fetchPage}
          getEditPath={(event) => `/host/events/${event.id}/edit`}
        />
      </MemoryRouter>
    );

    const links = await screen.findAllByRole('link', { name: 'Edit' });

    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/host/events/e1/edit',
      '/host/events/e2/edit',
    ]);
  });

  test('shows no Edit link when getEditPath is not given', async () => {
    const fetchPage = vi.fn().mockResolvedValue({ events: sample(1), total: 1, totalPages: 1 });
    renderSection(fetchPage);

    await screen.findByText('Event 1');

    expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument();
  });
});