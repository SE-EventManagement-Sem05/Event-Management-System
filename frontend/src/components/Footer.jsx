import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <Logo />
          <p className="muted">Host, discover and review events. Payments on this platform are simulated.</p>
        </div>
        <div>
          <h4>Platform</h4>
          <Link to="/#features">Features</Link>
          <Link to="/#categories">Categories</Link>
        </div>
        <div>
          <h4>Account</h4>
          <Link to="/login">Log in</Link>
          <Link to="/signup">Sign up</Link>
        </div>
      </div>
      <p className="footer-note">&copy; {new Date().getFullYear()} Eventide. Software Engineering Sem 5 project.</p>
    </footer>
  );
}
