import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';
import EventForm from './EventForm.jsx';
import { ApiValidationError, SessionExpiredError } from '../utils/events.js';
import { EMPTY_FORM, toFormValues } from '../utils/eventForm.js';

function renderForm(props = {}) {
  const onSubmit = props.onSubmit || vi.fn().mockResolvedValue(undefined);

  render(
    <MemoryRouter>
      <EventForm
        initialValues={EMPTY_FORM}
        submitLabel="Create event"
        onSubmit={onSubmit}
        {...props}
      />
    </MemoryRouter>
  );

  return onSubmit;
}

async function fillForm(user, overrides = {}) {
  const values = {
    title: 'Tech Meetup',
    description: 'Monthly meetup',
    date: '2030-06-15T10:30',
    venue: 'Hall A',
    price: '99.5',
    capacity: '100',
    ...overrides,
  };

  await user.type(screen.getByLabelText('Title'), values.title);
  await user.type(screen.getByLabelText('Description'), values.description);
  fireEvent.change(screen.getByLabelText('Date and time'), { target: { value: values.date } });
  await user.type(screen.getByLabelText('Venue'), values.venue);
  await user.type(screen.getByLabelText('Price'), values.price);
  await user.type(screen.getByLabelText('Capacity'), values.capacity);
}

describe('EMS-FR-07 EventForm', () => {
  test('shows title, description, date/time, venue, price and capacity fields', () => {
    renderForm();

    for (const label of ['Title', 'Description', 'Date and time', 'Venue', 'Price', 'Capacity']) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: 'Create event' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/host/dashboard');
  });

  test('an empty form shows a message for every field and does not submit', async () => {
    const onSubmit = renderForm();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Create event' }));

    for (const message of [
      'Title is required.',
      'Description is required.',
      'Date and time are required.',
      'Venue is required.',
      'Price is required.',
      'Capacity is required.',
    ]) {
      expect(screen.getByText(message)).toBeInTheDocument();
    }
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('a past date is rejected', async () => {
    const onSubmit = renderForm();
    const user = userEvent.setup();

    await fillForm(user, { date: '2020-01-01T10:00' });
    await user.click(screen.getByRole('button', { name: 'Create event' }));

    expect(screen.getByText('Event date and time must be in the future.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('a field error disappears when the user edits that field', async () => {
    renderForm();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Create event' }));
    expect(screen.getByText('Title is required.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Title'), 'A');

    expect(screen.queryByText('Title is required.')).not.toBeInTheDocument();
  });

  test('a valid form submits the cleaned payload', async () => {
    const onSubmit = renderForm();
    const user = userEvent.setup();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Create event' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Tech Meetup',
      description: 'Monthly meetup',
      date: new Date('2030-06-15T10:30').toISOString(),
      venue: 'Hall A',
      price: 99.5,
      capacity: 100,
    });
  });

  test('edit mode is pre-filled and an unchanged past date is sent back as stored', async () => {
    const event = {
      id: 'abc',
      title: 'Old Gala',
      description: 'Past event',
      date: '2020-03-04T05:06:07.890Z',
      venue: 'Hall B',
      price: 250,
      capacity: 75,
    };
    const onSubmit = renderForm({
      initialValues: toFormValues(event),
      originalEvent: event,
      submitLabel: 'Save changes',
    });
    const user = userEvent.setup();

    expect(screen.getByLabelText('Title')).toHaveValue('Old Gala');
    expect(screen.getByLabelText('Description')).toHaveValue('Past event');
    expect(screen.getByLabelText('Venue')).toHaveValue('Hall B');
    expect(screen.getByLabelText('Price')).toHaveValue(250);
    expect(screen.getByLabelText('Capacity')).toHaveValue(75);

    await user.clear(screen.getByLabelText('Venue'));
    await user.type(screen.getByLabelText('Venue'), 'Hall C');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ venue: 'Hall C', date: event.date })
    );
  });

  test('server field errors are shown next to their fields and the input is kept', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(
        new ApiValidationError('Please correct the highlighted fields.', {
          title: 'Title is required.',
        })
      );
    renderForm({ onSubmit });
    const user = userEvent.setup();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Create event' }));

    expect(await screen.findByText('Title is required.')).toBeInTheDocument();
    expect(screen.getByText('Please correct the highlighted fields.')).toBeInTheDocument();
    expect(screen.getByLabelText('Venue')).toHaveValue('Hall A');
  });

  test('a general error is shown and the input is kept so the user can retry', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new Error('Unable to connect to the server. Please try again.'));
    renderForm({ onSubmit });
    const user = userEvent.setup();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Create event' }));

    expect(
      await screen.findByText('Unable to connect to the server. Please try again.')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue('Tech Meetup');
    expect(screen.getByRole('button', { name: 'Create event' })).toBeEnabled();
  });

  test('an expired session is reported to the parent', async () => {
    const onSessionExpired = vi.fn();
    const onSubmit = vi.fn().mockRejectedValue(new SessionExpiredError('expired'));
    renderForm({ onSubmit, onSessionExpired });
    const user = userEvent.setup();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Create event' }));

    await vi.waitFor(() => expect(onSessionExpired).toHaveBeenCalledTimes(1));
  });

  test('double clicking submits only once while saving', async () => {
    const onSubmit = vi.fn().mockReturnValue(new Promise(() => {}));
    renderForm({ onSubmit });
    const user = userEvent.setup();

    await fillForm(user);
    const button = screen.getByRole('button', { name: 'Create event' });
    await user.dblClick(button);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole('button', { name: 'Saving…' })).toBeDisabled();
  });
});