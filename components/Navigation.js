'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/', label: 'About' },
  { href: '/publications', label: 'Publications' },
  { href: '/opensource', label: 'Open Source' },
  { href: '/service', label: 'Academic Service' },
  { href: '/teaching', label: 'Teaching' },
  { href: '/awards', label: 'Awards' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => setIsOpen(false), [pathname]);

  const isActive = (href) => href === '/' ? pathname === '/' : pathname.startsWith(href);
  const linkClass = (href) => `whitespace-nowrap px-3 py-2 rounded-lg transition-all ${
    isActive(href)
      ? 'bg-accent/10 text-accent font-semibold'
      : 'text-text-secondary hover:text-accent hover:bg-accent/5'
  }`;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-border/60 shadow-sm" aria-label="Main navigation">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 min-h-16 flex items-center justify-between">
        <Link href="/" className="font-outfit font-bold text-xl tracking-tight text-text hover:text-accent transition-colors">
          Jose Luis Ponton
        </Link>

        <button type="button" className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border text-text-secondary hover:text-accent hover:bg-accent/5 transition-colors" aria-label="Toggle navigation" aria-expanded={isOpen} aria-controls="mobile-navigation" onClick={() => setIsOpen(open => !open)}>
          {isOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>

        <div className="hidden lg:flex items-center gap-1 font-medium text-sm">
          {navItems.map(item => <Link key={item.href} href={item.href} className={linkClass(item.href)} aria-current={isActive(item.href) ? 'page' : undefined}>{item.label}</Link>)}
          <a href="/cv_joseluis_ponton.pdf" target="_blank" rel="noopener noreferrer" className="whitespace-nowrap px-3 py-2 rounded-lg text-text-secondary hover:text-accent hover:bg-accent/5 transition-all">CV</a>
        </div>
      </div>

      {isOpen && (
        <div id="mobile-navigation" className="lg:hidden border-t border-border/60 bg-white/95 px-4 py-3 shadow-lg">
          <div className="max-w-5xl mx-auto flex flex-col gap-1 text-sm">
            {navItems.map(item => <Link key={item.href} href={item.href} className={linkClass(item.href)} aria-current={isActive(item.href) ? 'page' : undefined}>{item.label}</Link>)}
            <a href="/cv_joseluis_ponton.pdf" target="_blank" rel="noopener noreferrer" className="whitespace-nowrap px-3 py-2 rounded-lg text-text-secondary hover:text-accent hover:bg-accent/5 transition-all">CV</a>
          </div>
        </div>
      )}
    </nav>
  );
}
