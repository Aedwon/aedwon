import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import BookPage from '../design-v3/BookPage';
import { VOLUMES } from '@/lib/design-v3/data/volumes';
import { ThemeContext } from '@/lib/design-v3/theme';

it('renders generated workflow technology pages on readable paper and keeps contents navigation aligned', () => {
  const workflow = VOLUMES.find((volume) => volume.id === 'about-02')!;
  const integrations = workflow.all.find((page) => page.t === 'Documented integrations')!;
  const onGo = vi.fn();
  const dark = { theme: 'dark' as const, toggle: vi.fn() };
  const { container, rerender } = render(
    <ThemeContext.Provider value={dark}><BookPage page={integrations} /></ThemeContext.Provider>,
  );
  expect(screen.getByText(integrations.title!)).toBeVisible();
  expect(screen.getByText(integrations.body!)).toBeVisible();
  expect(screen.getByText('Dio')).toBeVisible();
  expect(screen.getByText('Cloudflare KV')).toBeVisible();
  expect(screen.queryByRole('img', { name: 'Dio' })).not.toBeInTheDocument();
  expect(screen.queryByRole('img', { name: 'Cloudflare KV' })).not.toBeInTheDocument();
  const marks = screen.getAllByRole('img');
  expect(marks.length).toBeGreaterThan(0);
  for (const mark of marks) {
    expect(mark).toHaveAttribute('data-appearance', 'brand');
    expect(mark).not.toHaveAttribute('tabindex');
  }
  expect(screen.getByRole('img', { name: 'Cloudflare Workers' }).querySelector('.v3-tech-brand'))
    .toHaveStyle({ background: '#D26E1C' });
  expect(screen.getByRole('img', { name: 'PostHog' }).querySelector('.v3-tech-brand'))
    .toHaveStyle({ background: '#000000' });
  expect(container.querySelector('[tabindex="0"]')).not.toBeInTheDocument();

  expect(workflow.all).toHaveLength(12);
  expect(workflow.spreads).toBe(6);
  expect(workflow.all.at(-1)?.kind).toBe('end');
  const contents = workflow.all[0];
  const technologyPages = workflow.all.filter((page) => page.kind === 'tech');
  expect(technologyPages).toHaveLength(7);
  for (const page of technologyPages) {
    const entry = contents.toc?.find((row) => row.title === page.t);
    expect(entry).toBeDefined();
    expect(workflow.all[entry!.page]).toBe(page);
  }
  rerender(<ThemeContext.Provider value={dark}><BookPage page={contents} onGo={onGo} /></ThemeContext.Provider>);
  fireEvent.click(screen.getByText('Documented integrations'));
  expect(onGo).toHaveBeenCalledWith(workflow.all.indexOf(integrations));
  const storage = workflow.all.find((page) => page.t === 'Apps and data')!;
  rerender(<ThemeContext.Provider value={dark}><BookPage page={storage} /></ThemeContext.Provider>);
  expect(screen.getByText('Drift + SQLite')).toBeVisible();
  expect(screen.getAllByRole('img', { name: 'SQLite' })).toHaveLength(1);
  expect(screen.queryByRole('img', { name: 'Drift' })).not.toBeInTheDocument();
  rerender(<BookPage page={workflow.all.at(-1)} />);
  expect(screen.queryByRole('button', { name: /Affiliations/ })).not.toBeInTheDocument();
});
