import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import EventDetails from './EventDetails.jsx';
import { ApiError, SessionExpiredError, fetchHostEvent } from '../utils/events.js';

vi.mock('../utils/events.js', async () => {
  const actual = await vi.importActual('../utils/events.js');
  return { ...actual, fetchHostEvent: vi.fn() };
});

const EVENT = {
  id: 'abc123',
  title: 'Design Summit',
  description: 'Line one\nLine two',
  date: '2030-06-15T10:30:00.000Z',
  venue: 'Hall A',
  price: 499.99,
  capacity: 150,
  registeredCount: 42,
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/host/events/abc123']}>
      <Routes>
        <Route path="/host/events/:id" element={<EventDetails />} />
        <Route path="/host/dashboard" element={<p>DASHBOARD PAGE</p>} />
        <Route path="/login" element={<p>LOGIN PAGE</p>} />
      </Routes>
    </MemoryRouter>
  );
}

function renderPageWithNotice() {
  return render(
    <MemoryRouter
      initialEntries={[{ pathname: '/host/events/abc123', state: { notice: 'Event updated successfully.' } }]}
    >
      <Routes>
        <Route path="/host/events/:id" element={<EventDetails />} />
        <Route path="/login" element={<p>LOGIN PAGE</p>} />
      </Routes>
    </MemoryRouter>
  );
}

const valueOf = (label) => screen.getByText(label).nextElementSibling;

beforeEach(() => {
  fetchHostEvent.mockReset();
});

describe('EMS-FR-06 Event details page', () => {
  test('requests the event named in the URL', async () => {
    fetchHostEvent.mockResolvedValue(EVENT);
    renderPage();

    await screen.findByRole('heading', { level: 1, name: 'Design Summit' });

    expect(fetchHostEvent).toHaveBeenCalledWith('abc123');
  });

  test('shows title, description, date/time, venue, price, capacity and registered attendees', async () => {
    fetchHostEvent.mockResolvedValue(EVENT);
    const { container } = renderPage();

    await screen.findByRole('heading', { level: 1, name: 'Design Summit' });

    expect(valueOf('Date and time').querySelector('time')).toHaveAttribute('dateTime', EVENT.date);
    expect(valueOf('Venue')).toHaveTextContent('Hall A');
    expect(valueOf('Price')).toHaveTextContent('499.99');
    expect(valueOf('Capacity')).toHaveTextContent('150');
    expect(valueOf('Registered attendees')).toHaveTextContent('42');
    expect(container.querySelector('.event-description').textContent).toBe(EVENT.description);
  });

  test('shows 0 when nobody has registered', async () => {
    fetchHostEvent.mockResolvedValue({ ...EVENT, registeredCount: 0 });
    renderPage();

    await screen.findByRole('heading', { level: 1, name: 'Design Summit' });

    expect(valueOf('Registered attendees')).toHaveTextContent('0');
  });

  test('a price of 0 shows as Free', async () => {
    fetchHostEvent.mockResolvedValue({ ...EVENT, price: 0 });
    renderPage();

    await screen.findByRole('heading', { level: 1, name: 'Design Summit' });

    expect(valueOf('Price')).toHaveTextContent('Free');
  });

  test('an event without price and capacity shows "Not set"', async () => {
    fetchHostEvent.mockResolvedValue({
      ...EVENT,
      price: undefined,
      capacity: undefined,
    });
    renderPage();

    await screen.findByRole('heading', { level: 1, name: 'Design Summit' });

    expect(valueOf('Price')).toHaveTextContent('Not set');
    expect(valueOf('Capacity')).toHaveTextContent('Not set');
  });

  test('script text is shown as plain text', async () => {
    fetchHostEvent.mockResolvedValue({ ...EVENT, title: '<img src=x onerror=alert(1)>' });
    const { container } = renderPage();

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      '<img src=x onerror=alert(1)>'
    );
    expect(container.querySelector('img')).toBeNull();
  });

  test('has a link back to the dashboard', async () => {
    fetchHostEvent.mockResolvedValue(EVENT);
    renderPage();

    await screen.findByRole('heading', { level: 1, name: 'Design Summit' });

    expect(screen.getByRole('link', { name: /back to dashboard/i })).toHaveAttribute(
      'href',
      '/host/dashboard'
    );
  });

  test('an event owned by another host shows the message, no details and no retry', async () => {
    fetchHostEvent.mockRejectedValue(new ApiError('You can only access your own events.', 403));
    renderPage();

    expect(await screen.findByText('You can only access your own events.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });

  test('an unknown event shows "Event not found."', async () => {
    fetchHostEvent.mockRejectedValue(new ApiError('Event not found.', 404));
    renderPage();

    expect(await screen.findByText('Event not found.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });

  test('a connection problem can be retried', async () => {
    fetchHostEvent
      .mockRejectedValueOnce(new ApiError('Unable to connect to the server. Please try again.', 0))
      .mockResolvedValueOnce(EVENT);
    const user = userEvent.setup();
    renderPage();

    expect(
      await screen.findByText('Unable to connect to the server. Please try again.')
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Design Summit' })).toBeInTheDocument();
  });

  test('an expired session sends the user to login', async () => {
    fetchHostEvent.mockRejectedValue(new SessionExpiredError('expired'));
    renderPage();

    expect(await screen.findByText('LOGIN PAGE')).toBeInTheDocument();
  });

    test('has an Edit event link to the edit form (EMS-FR-07)', async () => {
    fetchHostEvent.mockResolvedValue(EVENT);
    renderPage();

    expect(await screen.findByRole('link', { name: 'Edit event' })).toHaveAttribute(
      'href',
      '/host/events/abc123/edit'
    );
  });

  test('shows the notice sent after saving an edit (EMS-FR-07)', async () => {
    fetchHostEvent.mockResolvedValue(EVENT);
    renderPageWithNotice();

    expect(screen.getByText('Event updated successfully.')).toBeInTheDocument();
    await screen.findByRole('heading', { level: 1, name: 'Design Summit' });
  });

  test('shows no Edit event link when the event cannot be opened (EMS-FR-07)', async () => {
    fetchHostEvent.mockRejectedValue(new ApiError('You can only access your own events.', 403));
    renderPage();

    await screen.findByText('You can only access your own events.');

    expect(screen.queryByRole('link', { name: 'Edit event' })).not.toBeInTheDocument();
  });
  
});