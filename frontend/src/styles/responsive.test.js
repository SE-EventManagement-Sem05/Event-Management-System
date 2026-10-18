import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const stylesheetPath = resolve(__dirname, 'responsive.css');
const css = readFileSync(stylesheetPath, 'utf8');

describe('EMS-NFR-03 responsive stylesheet', () => {
  it('defines the mobile, tablet, desktop and wide-screen rules', () => {
    expect(css).toContain('@media (max-width: 380px)');
    expect(css).toContain('@media (max-width: 600px)');
    expect(css).toContain('@media (max-width: 768px)');
    expect(css).toContain('@media (min-width: 769px) and (max-width: 1280px)');
    expect(css).toContain('@media (min-width: 1600px)');
  });

  it('allows the page root and major containers to shrink', () => {
    expect(css).toContain('#root');
    expect(css).toContain('min-width: 0');
  });

  it('constrains media and form controls to their containers', () => {
    expect(css).toContain('max-width: 100%');
    expect(css).toContain('input,');
    expect(css).toContain('select,');
    expect(css).toContain('textarea');
  });

  it('defines responsive event-card columns', () => {
    expect(css).toContain('grid-template-columns: repeat(');
    expect(css).toContain('min(100%, 260px)');
  });

  it('allows dashboard actions and tabs to wrap on narrow screens', () => {
    expect(css).toContain('.dash-actions');
    expect(css).toContain('.dash-tabs');
    expect(css).toContain('flex-wrap: wrap');
  });
});