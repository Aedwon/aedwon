import "@testing-library/jest-dom";
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TechLogo, hasTechLogo } from '../design-v3/TechLogo';

describe('technology artwork', () => {
  it('keeps helpers without marks as text and recognizes explicit aliases', () => {
    expect(hasTechLogo('Dio')).toBe(false);
    expect(hasTechLogo('Tailwind CSS')).toBe(true);
    expect(hasTechLogo('Google Sheets')).toBe(true);
    expect(hasTechLogo('discord.py')).toBe(true);
  });
  it('uses the approved dark wordmark and warm-paper override', () => {
    const { rerender } = render(<TechLogo name="next-intl" theme="dark" />);
    expect(screen.getByRole('img', { name: 'next-intl' }).querySelector('img')).toHaveAttribute('src', '/tech-icons/next-intl.dark.svg');
    rerender(<TechLogo name="next-intl" theme="dark" paper />);
    expect(screen.getByRole('img', { name: 'next-intl' }).querySelector('img')).toHaveAttribute('src', '/tech-icons/next-intl.svg');
  });
  it('uses the approved readable catalog color on paper', () => {
    render(<TechLogo name="Vitest" theme="dark" paper />);
    const mark = screen.getByRole('img', { name: 'Vitest' });
    expect(mark.querySelector('.v3-tech-brand')).toHaveStyle({ background: '#009E48' });
    expect(mark).toHaveAttribute('tabindex', '0');
  });
  it('retains multicolor artwork and labels the Discord platform substitution', () => {
    render(<><TechLogo name="Playwright" /><TechLogo name="discord.py" /></>);
    expect(screen.getByRole('img', { name: 'Playwright' }).querySelector('img')).toHaveAttribute('src', '/tech-icons/playwright.svg');
    expect(screen.getByRole('img', { name: 'discord.py' })).toHaveAttribute('title', 'discord.py (Discord platform mark)');
  });
  it('keeps always-colored marks out of the keyboard tab order', () => {
    render(<TechLogo name="Playwright" appearance="brand" />);
    expect(screen.getByRole('img', { name: 'Playwright' })).not.toHaveAttribute('tabindex');
  });
  it('identifies SDK and platform aliases without inventing a KV mark', () => {
    expect(hasTechLogo('Vercel Analytics')).toBe(true);
    expect(hasTechLogo('purchases_flutter')).toBe(true);
    expect(hasTechLogo('Cloudflare KV')).toBe(false);
    const { rerender } = render(<><TechLogo name="Vercel Analytics" theme="dark" /><TechLogo name="purchases_flutter" /></>);
    const analytics = screen.getByRole('img', { name: 'Vercel Analytics' });
    expect(analytics).toHaveAttribute('title', 'Vercel Analytics (Vercel platform mark)');
    expect(analytics.querySelector('.v3-tech-brand')).toHaveStyle({ background: '#EDEDED' });
    expect(screen.getByRole('img', { name: 'purchases_flutter' })).toHaveAttribute('title', 'purchases_flutter (RevenueCat SDK)');
    rerender(<TechLogo name="Vercel Analytics" theme="dark" paper />);
    expect(screen.getByRole('img', { name: 'Vercel Analytics' }).querySelector('.v3-tech-brand')).toHaveStyle({ background: '#000000' });
  });

  it('keeps Drift as text instead of presenting the SQLite mark as its logo', () => {
    expect(hasTechLogo('Drift')).toBe(false);
    expect(hasTechLogo('SQLite')).toBe(true);
    render(<><TechLogo name="Drift" /><TechLogo name="SQLite" /></>);
    expect(screen.queryByRole('img', { name: 'Drift' })).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'SQLite' })).toBeInTheDocument();
  });

});
