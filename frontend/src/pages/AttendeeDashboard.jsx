
export default function AttendeeDashboard() {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  function handleLogout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/login';
  }

  return (
    <section className="auth-placeholder">
      <div className="placeholder-card">
        <p className="eyebrow">Eventide · Attendee</p>
        <h1>Attendee Dashboard</h1>
        <p className="muted">
          Welcome, {user.name || 'Attendee'}!
        </p>
        <p>You can discover and register for events from here.</p>
        <button onClick={handleLogout}>Log out</button>
      </div>
    </section>
  );
}
