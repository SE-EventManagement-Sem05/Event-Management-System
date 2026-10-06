import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import Orbs from './Orbs.jsx';

export default function Layout() {
  return (
    <>
      <Orbs />
      <Navbar />
      <main className="page">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
