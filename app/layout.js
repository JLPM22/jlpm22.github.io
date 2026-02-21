import './globals.css';
import { Inter, Outfit } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import Particles from '@/components/Particles';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'Jose Luis Ponton - Research Scientist',
    template: '%s | Jose Luis Ponton',
  },
  description: 'Personal website of Jose Luis Ponton, Research Scientist specializing in character animation, motion matching, and computer graphics.',
  keywords: ['research', 'character animation', 'motion matching', 'computer graphics', 'machine learning', 'Unity'],
  authors: [{ name: 'Jose Luis Ponton' }],
  metadataBase: new URL('https://jlpm22.github.io'),
  openGraph: {
    title: 'Jose Luis Ponton - Research Scientist',
    description: 'Research in character animation, motion matching, and computer graphics.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'Jose Luis Ponton - Research Scientist',
    description: 'Research in character animation, motion matching, and computer graphics.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🤖</text></svg>',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans bg-bg text-text min-h-screen flex flex-col antialiased">
        <Particles className="fixed inset-0 z-0 pointer-events-none opacity-40" />
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-border/60 shadow-sm" role="navigation" aria-label="Main navigation">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-auto sm:h-16 flex flex-col sm:flex-row items-center justify-between py-3 sm:py-0">
            <a href="/" className="font-outfit font-bold text-xl tracking-tight text-text hover:text-accent transition-colors flex-shrink-0 mb-3 sm:mb-0">
              Jose Luis Ponton
            </a>
            <div className="flex gap-1 font-medium text-sm overflow-x-auto w-full sm:w-auto no-scrollbar justify-start sm:justify-end pb-1 sm:pb-0 px-2 sm:px-0 scroll-smooth">
              <a href="/" className="whitespace-nowrap px-3 py-1.5 rounded-lg text-text-secondary hover:text-accent hover:bg-accent/5 transition-all">About</a>
              <a href="/publications" className="whitespace-nowrap px-3 py-1.5 rounded-lg text-text-secondary hover:text-accent hover:bg-accent/5 transition-all">Publications</a>
              <a href="/opensource" className="whitespace-nowrap px-3 py-1.5 rounded-lg text-text-secondary hover:text-accent hover:bg-accent/5 transition-all">Open Source</a>
              <a href="/teaching" className="whitespace-nowrap px-3 py-1.5 rounded-lg text-text-secondary hover:text-accent hover:bg-accent/5 transition-all">Teaching</a>
              <a href="/service" className="whitespace-nowrap px-3 py-1.5 rounded-lg text-text-secondary hover:text-accent hover:bg-accent/5 transition-all">Service</a>
              <a href="/cv_joseluis_ponton.pdf" target="_blank" rel="noopener noreferrer" className="whitespace-nowrap px-3 py-1.5 rounded-lg text-text-secondary hover:text-accent hover:bg-accent/5 transition-all">CV</a>
            </div>
          </div>
        </nav>
        <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 relative z-10">
          {children}
        </main>
        <footer className="mt-12 text-center text-sm text-text-muted">
          <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
          <p className="py-8">© {new Date().getFullYear()} Jose Luis Ponton. All rights reserved.</p>
        </footer>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
