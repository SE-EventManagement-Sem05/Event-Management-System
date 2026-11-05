
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import { getToken, clearSession } from '../utils/auth.js';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(!!getToken());
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const syncAuth = () => setLoggedIn(!!getToken());
    window.addEventListener('auth-change', syncAuth);
    return () => window.removeEventListener('auth-change', syncAuth);
  }, []);

  const close = () => setOpen(false);

  const logout = () => {
    clearSession();
    setLoggedIn(false);
    close();
    window.dispatchEvent(new Event('auth-change'));
    navigate('/', { replace: true });
  };

  return (
    <header className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
      <Logo />
      <button
        className="nav-toggle"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span /><span /><span />
      </button>

      <nav className={`nav-links ${open ? 'open' : ''}`}>
        <Link to="/#features" onClick={close}>Features</Link>
        <Link to="/#categories" onClick={close}>Categories</Link>
        <Link to="/#about" onClick={close}>About</Link>

        {loggedIn ? (
          <button className="btn btn-gold btn-sm" onClick={logout}>
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" onClick={close}>Log in</Link>
            <Link to="/signup" className="btn btn-gold btn-sm" onClick={close}>
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
