import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import EditEvent from './EditEvent.jsx';
import {
  ApiError,
  SessionExpiredError,
  fetchHostEvent,
  updateHostEvent,
} from '../utils/events.js';
import { toLocalInputValue } from '../utils/eventForm.js';

vi.mock('../utils/events.js', async () => {
  const actual = await vi.importActual('../utils/events.js');
  return { ...actual, fetchHostEvent: vi.fn(), updateHostEvent: vi.fn() };
});

const EVENT = {
  id: 'abc123',
  title: 'Old Gala',
  description: 'Gala description',
  date: '2030-01-01T10:00:00.000Z',
  venue: 'Hall B',
  price: 250,
  capacity: 75,
  registeredCount: 3,
};

function DetailsStub() {
  const location = useLocation();
  return <p>DETAILS {location.state?.notice}</p>;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/host/events/abc123/edit']}>
      <Routes>
        <Route path="/host/events/:id/edit" element={<EditEvent />} />
        <Route path="/host/events/:id" element={<DetailsStub />} />
        <Route path="/host/dashboard" element={<p>DASHBOARD PAGE</p>} />
        <Route path="/login" element={<p>LOGIN PAGE</p>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  fetchHostEvent.mockReset();
  updateHostEvent.mockReset();
});

describe('EMS-FR-07 Edit event page', () => {
  test('loads the event and pre-fills the form', async () => {
    fetchHostEvent.mockResolvedValue(EVENT);
    renderPage();

    expect(await screen.findByLabelText('Title')).toHaveValue('Old Gala');
    expect(screen.getByLabelText('Description')).toHaveValue('Gala description');
    expect(screen.getByLabelText('Date and time')).toHaveValue(toLocalInputValue(EVENT.date));
    expect(screen.getByLabelText('Venue')).toHaveValue('Hall B');
    expect(screen.getByLabelText('Price')).toHaveValue(250);
    expect(screen.getByLabelText('Capacity')).toHaveValue(75);
    expect(fetchHostEvent).toHaveBeenCalledWith('abc123');
  });

  test('saving sends the changes and opens the details page with a notice', async () => {
    fetchHostEvent.mockResolvedValue(EVENT);
    updateHostEvent.mockResolvedValue({ ...EVENT, title: 'New Title' });
    const user = userEvent.setup();
    renderPage();

    const title = await screen.findByLabelText('Title');
    await user.clear(title);
    await user.type(title, 'New Title');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('DETAILS Event updated successfully.')).toBeInTheDocument();
    expect(updateHostEvent).toHaveBeenCalledWith(
      'abc123',
      expect.objectContaining({ title: 'New Title', venue: 'Hall B', price: 250, capacity: 75 })
    );
  });

  test('clearing a required field blocks the save', async () => {
    fetchHostEvent.mockResolvedValue(EVENT);
    const user = userEvent.setup();
    renderPage();

    await user.clear(await screen.findByLabelText('Title'));
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(screen.getByText('Title is required.')).toBeInTheDocument();
    expect(updateHostEvent).not.toHaveBeenCalled();
  });

  test('an event owned by another host shows the message and no form', async () => {
    fetchHostEvent.mockRejectedValue(new ApiError('You can only access your own events.', 403));
    renderPage();

    expect(await screen.findByText('You can only access your own events.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Title')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to dashboard' })).toHaveAttribute('href', '/host/dashboard');
  });

  test('an unknown event shows "Event not found."', async () => {
    fetchHostEvent.mockRejectedValue(new ApiError('Event not found.', 404));
    renderPage();

    expect(await screen.findByText('Event not found.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Title')).not.toBeInTheDocument();
  });

  test('an expired session sends the user to login', async () => {
    fetchHostEvent.mockRejectedValue(new SessionExpiredError('expired'));
    renderPage();

    expect(await screen.findByText('LOGIN PAGE')).toBeInTheDocument();
  });
});