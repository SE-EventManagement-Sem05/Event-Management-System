import { useState } from 'react';
import '../styles/signup.css';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  function handleChange(event) {
    const { id, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [id]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [id]: '',
    }));

    setSuccess('');
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role.';
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

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          submit: data.message || 'Unable to create account.',
        });
        setSuccess('');
        return;
      }

      setErrors({});
      setSuccess('Account created successfully.');

      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
      });
    } catch (error) {
      setErrors({
        submit: 'Unable to connect to the server.',
      });
      setSuccess('');
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <p className="eyebrow">Eventide</p>

          <h1 className="auth-title">
            Create <em>your account</em>
          </h1>

          <p className="auth-subtitle">
            Join Eventide and discover experiences worth remembering.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Name
            </label>

            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
            />

            {errors.name && (
              <p className="form-error">{errors.name}</p>
            )}
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
              value={formData.email}
              onChange={handleChange}
            />

            {errors.email && (
              <p className="form-error">{errors.email}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
            />

            <p className="password-hint">
              Password must contain at least 8 characters.
            </p>

            {errors.password && (
              <p className="form-error">{errors.password}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              className="form-input"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            {errors.confirmPassword && (
              <p className="form-error">{errors.confirmPassword}</p>
            )}
          </div>

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

            {errors.role && (
              <p className="form-error">{errors.role}</p>
            )}
          </div>

          {errors.submit && (
            <p className="form-error">{errors.submit}</p>
          )}

          {success && (
            <p className="form-success">{success}</p>
          )}

          <button type="submit" className="btn btn-gold btn-block">
            Create Account
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?
          <a href="/login">Log in</a>
        </div>
      </div>
    </section>
  );
}