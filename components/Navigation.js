'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import icons from '@/components/SocialIcons';

const navItems = [
  { href: '/', label: 'About' },
  { href: '/publications', label: 'Publications' },
  { href: '/opensource', label: 'Open Source' },
  { href: '/service', label: 'Academic Service' },
  { href: '/teaching', label: 'Teaching' },
  { href: '/awards', label: 'Awards' },
];

export default function Navigation({ email, social = {} }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [pastAbout, setPastAbout] = useState(false);
  const navRef = useRef(null);
  const showSocials = pathname !== '/' || pastAbout;

  useEffect(() => {
    if (pathname !== '/') return;
    let frame;
    const update = () => {
      const hero = document.querySelector('.about-hero');
      setPastAbout(!!hero && hero.getBoundingClientRect().bottom <= (navRef.current?.offsetHeight || 80));
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [pathname]);

  useEffect(() => setIsOpen(false), [pathname]);

  const isActive = (href) => href === '/' ? pathname === '/' : pathname.startsWith(href);
  const linkClass = (href) => `whitespace-nowrap px-3 py-2 rounded-md transition-all ${
    isActive(href)
      ? 'bg-accent/[0.06] text-accent font-semibold'
      : 'text-text-secondary hover:text-accent hover:bg-accent/5'
  }`;

  return (
    <nav ref={navRef} className="site-navigation sticky top-0 z-50 backdrop-blur-xl border-b border-border/70" aria-label="Main navigation">
      <div className="site-container min-h-20 flex items-center justify-between">
        <div className="nav-identity">
        <Link href="/" className="nav-name font-outfit font-semibold text-base tracking-tight text-text hover:text-accent transition-colors">
          Jose Luis Ponton
        </Link>
        <div className={`nav-socials ${showSocials ? 'is-visible' : ''}`} aria-hidden={!showSocials}>
          {[
            { key: 'email', label: 'Email', href: email ? `mailto:${email}` : null },
            { key: 'linkedin', label: 'LinkedIn', href: social.linkedin },
            { key: 'scholar', label: 'Google Scholar', href: social.scholar },
          ].map(({ key, label, href }) => href && (
            <a key={key} href={href} aria-label={label} title={label} tabIndex={showSocials ? undefined : -1} target={key === 'email' ? undefined : '_blank'} rel={key === 'email' ? undefined : 'noopener noreferrer'}>
              <span aria-hidden="true">{icons[key]}</span>
            </a>
          ))}
        </div>
        </div>

        <button type="button" className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-border text-text-secondary hover:text-accent hover:bg-accent/5 transition-colors" aria-label="Toggle navigation" aria-expanded={isOpen} aria-controls="mobile-navigation" onClick={() => setIsOpen(open => !open)}>
          {isOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>

        <div className="hidden lg:flex items-center gap-1 font-medium text-sm">
          {navItems.map(item => <Link key={item.href} href={item.href} className={linkClass(item.href)} aria-current={isActive(item.href) ? 'page' : undefined}>{item.label}</Link>)}
          <a href="/cv_joseluis_ponton.pdf" target="_blank" rel="noopener noreferrer" className="whitespace-nowrap px-3 py-2 rounded-md text-text-secondary hover:text-accent hover:bg-accent/5 transition-all">CV</a>
        </div>
      </div>

      {isOpen && (
        <div id="mobile-navigation" className="lg:hidden border-t border-border/60 bg-white/95 px-4 py-3 shadow-lg">
          <div className="site-container flex flex-col gap-1 text-sm">
            {navItems.map(item => <Link key={item.href} href={item.href} className={linkClass(item.href)} aria-current={isActive(item.href) ? 'page' : undefined}>{item.label}</Link>)}
            <a href="/cv_joseluis_ponton.pdf" target="_blank" rel="noopener noreferrer" className="whitespace-nowrap px-3 py-2 rounded-md text-text-secondary hover:text-accent hover:bg-accent/5 transition-all">CV</a>
          </div>
        </div>
      )}
    </nav>
  );
}
