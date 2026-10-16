import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import Landing from './Landing.jsx';

let scrolled;

beforeEach(() => {
  scrolled = [];
  Element.prototype.scrollIntoView = vi.fn(function scrollIntoView() {
    scrolled.push(this.id);
  });
  window.scrollTo = vi.fn();
});

function renderLanding(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Landing />
    </MemoryRouter>
  );
}

describe('EMS-FR-01 Landing page content', () => {
  test('the main headline states the purpose of the platform', () => {
    renderLanding();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Where great events find their people'
    );
  });

  test('the hero offers Get started (signup) and Log in', () => {
    const { container } = renderLanding();
    const hero = within(container.querySelector('.hero'));

    expect(hero.getByRole('link', { name: 'Get started' })).toHaveAttribute('href', '/signup');
    expect(hero.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
  });

  test('a closing call to action offers Create an account', () => {
    renderLanding();

    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute('href', '/signup');
  });

  test('every signup option leads to /signup and every login option to /login', () => {
    renderLanding();

    const links = screen.getAllByRole('link');
    const signupLinks = links.filter((link) => /get started|create an account/i.test(link.textContent));
    const loginLinks = links.filter((link) => /log in/i.test(link.textContent));

    expect(signupLinks.length).toBeGreaterThanOrEqual(2);
    expect(loginLinks.length).toBeGreaterThanOrEqual(1);
    signupLinks.forEach((link) => expect(link).toHaveAttribute('href', '/signup'));
    loginLinks.forEach((link) => expect(link).toHaveAttribute('href', '/login'));
  });

  test('describes the four main features', () => {
    renderLanding();

    for (const title of ['Host Dashboard', 'Smart Discovery', 'Simulated Checkout', 'Ratings & Reviews']) {
      expect(screen.getByRole('heading', { level: 3, name: title })).toBeInTheDocument();
    }
  });

  test('states that no real payments are processed', () => {
    renderLanding();

    expect(screen.getByText('Real payments processed')).toBeInTheDocument();
  });

  test('lists the event categories', () => {
    renderLanding();

    for (const name of ['Conferences', 'Concerts', 'Workshops', 'Weddings & Galas', 'Sports']) {
      expect(screen.getByRole('heading', { level: 3, name })).toBeInTheDocument();
    }
  });

  test('has sections that the navigation can jump to', () => {
    const { container } = renderLanding();

    for (const id of ['features', 'about', 'categories']) {
      expect(container.querySelector(`#${id}`)).toBeInTheDocument();
    }
  });
});

describe('EMS-FR-01 Landing page scrolling', () => {
  test.each(['features', 'about', 'categories'])('opening /#%s scrolls to that section', (id) => {
    renderLanding(`/#${id}`);

    expect(scrolled).toEqual([id]);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  test('opening the page without a hash scrolls to the top', () => {
    renderLanding('/');

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    expect(scrolled).toEqual([]);
  });

  test('a hash that matches no section does not break the page', () => {
    renderLanding('/#missing');

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(scrolled).toEqual([]);
  });
});