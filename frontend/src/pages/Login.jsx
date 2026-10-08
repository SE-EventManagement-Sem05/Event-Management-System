import { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE, saveSession } from '../utils/auth.js';
import '../styles/signup.css';

export default function Login() {
  const [formData, setFormData] = useState({
    role: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { id, value } = event.target;

    setFormData((previous) => ({ ...previous, [id]: value }));
    setErrors((previous) => ({ ...previous, [id]: '', submit: '' }));
    setSuccess('');
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.role) {
      newErrors.role = 'Please select a role.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
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
      setSuccess('');
      return;
    }

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

      if (!response.ok || !data.token) {
        setErrors({ submit: data.message || 'Unable to log in. Please try again.' });
        setSuccess('');
        return;
      }

      saveSession(data.token, data.user);
      setErrors({});
      setSuccess(`Welcome back, ${data.user.name}. You are logged in as ${data.user.role}.`);
      setFormData({ role: '', email: '', password: '' });
    } catch (error) {
      setErrors({ submit: 'Unable to connect to the server. Please try again.' });
      setSuccess('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <p className="eyebrow">Eventide</p>

          <h1 className="auth-title">
            Welcome <em>back</em>
          </h1>

          <p className="auth-subtitle">
            Log in to continue to your Eventide dashboard.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="role">
              Role
            </label>

            <select
              id="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="" disabled>
                Select your role
              </option>
              <option value="attendee">Attendee</option>
              <option value="host">Host</option>
            </select>

            {errors.role && <p className="form-error">{errors.role}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="Enter your email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
            />

            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />

            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          {errors.submit && <p className="form-error">{errors.submit}</p>}

          {success && <p className="form-success">{success}</p>}

          <button
            type="submit"
            className="btn btn-gold btn-block"
            disabled={loading}
          >
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <div className="auth-footer">
          Don&apos;t have an account?
          <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </section>
  );
}