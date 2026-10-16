import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import App from './App.jsx';

let scrolled;

beforeEach(() => {
  scrolled = [];
  Element.prototype.scrollIntoView = vi.fn(function scrollIntoView() {
    scrolled.push(this.id);
  });
  window.scrollTo = vi.fn();
});

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

const heroHeading = () => screen.getByRole('heading', { level: 1, name: /where great events find their people/i });

describe('EMS-FR-01 Landing page in the app', () => {
  test('the landing page is shown at / with the navigation bar and footer', () => {
    renderApp('/');

    expect(heroHeading()).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  test('"Get started" opens the signup page', async () => {
    renderApp('/');
    const user = userEvent.setup();

    await user.click(within(screen.getByRole('main')).getByRole('link', { name: 'Get started' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Create your account' })).toBeInTheDocument();
  });

  test('"Log in" opens the login page', async () => {
    renderApp('/');
    const user = userEvent.setup();

    await user.click(within(screen.getByRole('main')).getByRole('link', { name: 'Log in' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Welcome back' })).toBeInTheDocument();
  });

  test('the navigation bar links reach signup and login', async () => {
    renderApp('/');
    const user = userEvent.setup();
    const nav = within(screen.getByRole('banner'));

    await user.click(nav.getByRole('link', { name: 'Sign up' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Create your account' })).toBeInTheDocument();

    await user.click(within(screen.getByRole('banner')).getByRole('link', { name: 'Log in' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Welcome back' })).toBeInTheDocument();
  });

  test('the footer also offers Log in and Sign up', () => {
    renderApp('/');
    const footer = within(screen.getByRole('contentinfo'));

    expect(footer.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
    expect(footer.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/signup');
  });

  test('the logo returns to the landing page from the login page', async () => {
    renderApp('/login');
    const user = userEvent.setup();

    await user.click(within(screen.getByRole('banner')).getByRole('link', { name: 'Eventide home' }));

    expect(await screen.findByRole('heading', { level: 1, name: /where great events find their people/i })).toBeInTheDocument();
  });

  test('a section link in the navigation scrolls the landing page to that section', async () => {
    renderApp('/login');
    const user = userEvent.setup();

    await user.click(within(screen.getByRole('banner')).getByRole('link', { name: 'About' }));

    expect(await screen.findByRole('heading', { level: 1, name: /where great events find their people/i })).toBeInTheDocument();
    expect(scrolled).toEqual(['about']);
  });
});

describe('EMS-FR-01 routes', () => {
  test('/login and /signup open directly with the navigation bar', () => {
    const login = renderApp('/login');
    expect(screen.getByRole('heading', { level: 1, name: 'Welcome back' })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    login.unmount();

    renderApp('/signup');
    expect(screen.getByRole('heading', { level: 1, name: 'Create your account' })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  test.each(['/abc', '/dashboard/xyz', '/login/extra'])('an unknown address (%s) goes to the landing page', (path) => {
    renderApp(path);

    expect(heroHeading()).toBeInTheDocument();
  });
});