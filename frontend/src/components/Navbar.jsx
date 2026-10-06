import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = () => setOpen(false);

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
        <Link to="/login" onClick={close}>Log in</Link>
        <Link to="/signup" className="btn btn-gold btn-sm" onClick={close}>Sign up</Link>
      </nav>
    </header>
  );
}