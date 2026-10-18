import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AttendeeEventDetails from './AttendeeEventDetails.jsx';

import {
  fetchAttendeeEvent,
  submitEventReview,
} from '../utils/events.js';

vi.mock('../utils/events.js', async () => {
  const actual = await vi.importActual('../utils/events.js');

  return {
    ...actual,
    fetchAttendeeEvent: vi.fn(),
    submitEventReview: vi.fn(),
  };
});

const EVENT = {
  id: '507f1f77bcf86cd799439011',
  title: 'Design Workshop',
  description: 'A completed workshop.',
  date: '2020-06-15T10:30:00.000Z',
  venue: 'Hall A',
  price: 100,
  capacity: 50,
  averageRating: 4,
  reviewCount: 1,
  reviews: [
    {
      _id: 'review-1',
      attendeeName: 'Test Attendee',
      rating: 4,
      comment: 'Well organised.',
      createdAt: '2026-01-01T10:00:00.000Z',
    },
  ],
  canReview: true,
  hasReviewed: false,
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={[
      `/attendee/events/${EVENT.id}`,
    ]}>
      <Routes>
        <Route
          path="/attendee/events/:id"
          element={<AttendeeEventDetails />}
        />
        <Route
          path="/attendee/dashboard"
          element={<p>ATTENDEE DASHBOARD</p>}
        />
        <Route path="/login" element={<p>LOGIN PAGE</p>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  fetchAttendeeEvent.mockReset();
  submitEventReview.mockReset();
});

describe('EMS-FR-12 attendee reviews', () => {
  test('shows the average rating and existing reviews', async () => {
    fetchAttendeeEvent.mockResolvedValue(EVENT);

    renderPage();

    expect(
      await screen.findByRole('heading', { name: 'Design Workshop' })
    ).toBeInTheDocument();

    expect(
      screen.getByText((content, element) => {
        const hasText = (node) => node.textContent.includes('4.00 out of 5');
        const nodeHasText = hasText(element);
        const childrenDontHaveText = Array.from(element.children).every(
          (child) => !hasText(child)
        );
        return nodeHasText && childrenDontHaveText;
      })
    ).toBeInTheDocument();

    expect(screen.getByText('Well organised.')).toBeInTheDocument();
    expect(screen.getByText('Rating: 4/5')).toBeInTheDocument();
  });

  test('a review-eligible attendee can submit a rating and comment', async () => {
    fetchAttendeeEvent
      .mockResolvedValueOnce(EVENT)
      .mockResolvedValueOnce({
        ...EVENT,
        canReview: false,
        hasReviewed: true,
        averageRating: 4.5,
        reviewCount: 2,
      });

    submitEventReview.mockResolvedValue({
      message: 'Review submitted successfully.',
    });

    const user = userEvent.setup();
    renderPage();

    await screen.findByRole('heading', { name: 'Design Workshop' });

    await user.selectOptions(
      screen.getByLabelText('Rating'),
      '3'
    );

    await user.type(
      screen.getByLabelText('Comment (optional)'),
      'Enjoyed the workshop.'
    );

    await user.click(
      screen.getByRole('button', { name: 'Submit review' })
    );

    expect(submitEventReview).toHaveBeenCalledWith(EVENT.id, {
      rating: 3,
      comment: 'Enjoyed the workshop.',
    });

    expect(
      await screen.findByText('You have already reviewed this event.')
    ).toBeInTheDocument();
  });

  test('does not show the form when the attendee is not eligible', async () => {
    fetchAttendeeEvent.mockResolvedValue({
      ...EVENT,
      canReview: false,
      hasReviewed: false,
    });

    renderPage();

    await screen.findByRole('heading', { name: 'Design Workshop' });

    expect(
      screen.queryByRole('heading', { name: 'Write a review' })
    ).not.toBeInTheDocument();

    expect(
      screen.getByText(
        'Reviews are available to registered attendees after the event.'
      )
    ).toBeInTheDocument();
  });
});