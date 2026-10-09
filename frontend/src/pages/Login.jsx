
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/signup.css';

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'attendee',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));

      navigate(
        data.user.role === 'host'
          ? '/host/dashboard'
          : '/attendee/dashboard',
        { replace: true }
      );
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Cannot connect to the server. Please try again.'
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <header className="auth-header">
          <p className="eyebrow">EVENTIDE</p>
          <h1 className="auth-title">Welcome back.</h1>
          <p className="auth-subtitle">
            Sign in to continue your journey.
          </p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email address
            </label>
            <input
              className="form-input"
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              className="form-input"
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">
              Sign in as
            </label>
            <select
              className="form-select"
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="attendee">Attendee</option>
              <option value="host">Host</option>
            </select>
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

           <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loading}
            >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <footer className="auth-footer">
          Don't have an account?
          <Link to="/signup">Create account</Link>
        </footer>
      </div>
    </section>
  );
}
