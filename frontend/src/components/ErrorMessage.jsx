
export default function ErrorMessage({
  message,
  onRetry,
  retryLabel = 'Retry',
  variant = 'error',
}) {
  if (!message) return null;

  return (
    <div
      className={`app-message app-message-${variant}`}
      role={variant === 'success' ? 'status' : 'alert'}
      aria-live={variant === 'success' ? 'polite' : 'assertive'}
    >
      <p>{message}</p>

      {onRetry && (
        <button
          type="button"
          className="event-button"
          onClick={onRetry}
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
