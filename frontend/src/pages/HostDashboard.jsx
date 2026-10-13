
export default function HostDashboard() {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  function handleLogout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/login';
  }

  return (
    <section className="auth-placeholder">
      <div className="placeholder-card">
        <p className="eyebrow">Eventide · Host</p>
        <h1>Host Dashboard</h1>
        <p className="muted">
          Welcome, {user.name || 'Host'}!
        </p>
        <p>You can manage your events from here.</p>
        <button onClick={handleLogout}>Log out</button>
      </div>
    </section>
  );
}
