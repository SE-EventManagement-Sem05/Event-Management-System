import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import ErrorMessage from './ErrorMessage.jsx';

describe('ErrorMessage', () => {
  test('displays a readable error without exposing stack traces', () => {
    render(
      <ErrorMessage message="Unable to connect to the server. Please try again." />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Unable to connect to the server. Please try again.'
    );
    expect(screen.queryByText(/TypeError|at \w+ \(/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('shows Retry and calls the retry handler when clicked', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();

    render(
      <ErrorMessage
        message="Something went wrong on our server. Please try again."
        onRetry={onRetry}
        retryLabel="Retry"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('does not render when there is no message', () => {
    const { container } = render(<ErrorMessage message="" onRetry={vi.fn()} />);

    expect(container.firstChild).toBeNull();
  });
});
