import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test } from 'vitest';
import Navbar from './Navbar.jsx';

function setScrollY(value) {
  Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value });
}

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );
}

beforeEach(() => {
  setScrollY(0);
});

describe('EMS-FR-01 Navigation bar', () => {
  test('shows the logo linking to the landing page', () => {
    renderNavbar();

    expect(screen.getByRole('link', { name: 'Eventide home' })).toHaveAttribute('href', '/');
  });

  test('offers Log in and Sign up', () => {
    renderNavbar();

    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/signup');
  });

  test('links to the landing page sections', () => {
    renderNavbar();

    expect(screen.getByRole('link', { name: 'Features' })).toHaveAttribute('href', '/#features');
    expect(screen.getByRole('link', { name: 'Categories' })).toHaveAttribute('href', '/#categories');
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/#about');
  });

  test('the menu button opens and closes the links on small screens', async () => {
    const { container } = renderNavbar();
    const user = userEvent.setup();
    const toggle = screen.getByRole('button', { name: 'Menu' });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(container.querySelector('.nav-links')).not.toHaveClass('open');

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(container.querySelector('.nav-links')).toHaveClass('open');

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('choosing a link closes the open menu', async () => {
    renderNavbar();
    const user = userEvent.setup();
    const toggle = screen.getByRole('button', { name: 'Menu' });

    await user.click(toggle);
    await user.click(screen.getByRole('link', { name: 'Log in' }));

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('the bar changes style once the page is scrolled', () => {
    const { container } = renderNavbar();
    const header = container.querySelector('header');

    expect(header).not.toHaveClass('nav-scrolled');

    setScrollY(100);
    fireEvent.scroll(window);

    expect(header).toHaveClass('nav-scrolled');

    setScrollY(0);
    fireEvent.scroll(window);

    expect(header).not.toHaveClass('nav-scrolled');
  });
});