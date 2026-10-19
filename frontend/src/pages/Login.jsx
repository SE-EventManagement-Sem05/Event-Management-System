import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { API_BASE, saveSession } from '../utils/auth.js';
import '../styles/signup.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionMessage = location.state?.message || '';

  const [formData, setFormData] = useState({
    role: 'attendee',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { id, value } = event.target;
    setFormData((previous) => ({ ...previous, [id]: value }));
    setErrors((previous) => ({ ...previous, [id]: '', submit: '' }));
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.role) {
      newErrors.role = 'Please select a role.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    }

    return newErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: formData.role,
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.token || !data.user) {
        setErrors({
          submit: data.message || 'Unable to log in. Please try again.',
        });
        return;
      }

      saveSession(data.token, data.user);
      navigate(
        data.user.role === 'host' ? '/host/dashboard' : '/attendee/dashboard',
        { replace: true }
      );
    } catch (error) {
      setErrors({
        submit: 'Unable to connect to the server. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <header className="auth-header">
          <p className="eyebrow">EVENTIDE</p>
          <h1 className="auth-title">Welcome <em>back</em></h1>
          <p className="auth-subtitle">
            Log in to continue to your Eventide dashboard.
          </p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {sessionMessage && (
            <p className="form-error" role="alert">
              {sessionMessage}
            </p>
          )}
          <div className="form-group">
            <label className="form-label" htmlFor="role">Sign in as</label>
            <select
              id="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="attendee">Attendee</option>
              <option value="host">Host</option>
            </select>
            {errors.role && <p className="form-error" role="alert">{errors.role}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <p className="form-error" role="alert">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && <p className="form-error" role="alert">{errors.password}</p>}
          </div>

          {errors.submit && <p className="form-error" role="alert">{errors.submit}</p>}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <footer className="auth-footer">
          Don&apos;t have an account? <Link to="/signup">Create account</Link>
        </footer>
      </div>
    </section>
  );
}
