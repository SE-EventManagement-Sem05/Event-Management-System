import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';
import CreateEvent from './CreateEvent.jsx';
import { ApiError, SessionExpiredError, createHostEvent } from '../utils/events.js';

vi.mock('../utils/events.js', async () => {
  const actual = await vi.importActual('../utils/events.js');
  return { ...actual, createHostEvent: vi.fn() };
});

function DashboardStub() {
  const location = useLocation();
  return <p>DASHBOARD {location.state?.notice}</p>;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/host/events/new']}>
      <Routes>
        <Route path="/host/events/new" element={<CreateEvent />} />
        <Route path="/host/dashboard" element={<DashboardStub />} />
        <Route path="/login" element={<p>LOGIN PAGE</p>} />
      </Routes>
    </MemoryRouter>
  );
}

async function fillAndSubmit(user) {
  await user.type(screen.getByLabelText('Title'), 'Design Summit');
  await user.type(screen.getByLabelText('Description'), 'Two-day conference');
  fireEvent.change(screen.getByLabelText('Date and time'), { target: { value: '2030-06-15T10:30' } });
  await user.type(screen.getByLabelText('Venue'), 'Hall A');
  await user.type(screen.getByLabelText('Price'), '499.99');
  await user.type(screen.getByLabelText('Capacity'), '150');
  await user.click(screen.getByRole('button', { name: 'Create event' }));
}

describe('EMS-FR-07 Create event page', () => {
  test('saving returns to the dashboard with a success notice', async () => {
    createHostEvent.mockReset();
    createHostEvent.mockResolvedValue({ id: 'new1' });
    const user = userEvent.setup();
    renderPage();

    await fillAndSubmit(user);

    expect(await screen.findByText('DASHBOARD Event created successfully.')).toBeInTheDocument();
    expect(createHostEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Design Summit',
        venue: 'Hall A',
        price: 499.99,
        capacity: 150,
      })
    );
  });

  test('a server error keeps the user on the form', async () => {
    createHostEvent.mockReset();
    createHostEvent.mockRejectedValue(new ApiError('Events are temporarily unavailable. Please try again shortly.', 503));
    const user = userEvent.setup();
    renderPage();

    await fillAndSubmit(user);

    expect(
      await screen.findByText('Events are temporarily unavailable. Please try again shortly.')
    ).toBeInTheDocument();
    expect(screen.queryByText(/DASHBOARD/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue('Design Summit');
  });

  test('an expired session sends the user to login', async () => {
    createHostEvent.mockReset();
    createHostEvent.mockRejectedValue(new SessionExpiredError('expired'));
    const user = userEvent.setup();
    renderPage();

    await fillAndSubmit(user);

    expect(await screen.findByText('LOGIN PAGE')).toBeInTheDocument();
  });
});