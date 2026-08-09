import './globals.css';
import { Inter, Outfit } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import Particles from '@/components/Particles';
import ScrollToTop from '@/components/ScrollToTop';
import Navigation from '@/components/Navigation';
import { getProfile } from '@/lib/content';

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
    default: 'Jose Luis Ponton — AI & Computer Graphics Researcher',
    template: '%s | Jose Luis Ponton',
  },
  description: 'Jose Luis Ponton is an AI and computer graphics researcher at the Max Planck Institute for Informatics, working on generative AI, human motion, virtual reality, and robotics.',
  keywords: ['generative AI', 'human motion', 'character animation', 'robotics', 'virtual reality', 'computer graphics', 'motion matching', 'Max Planck Institute for Informatics'],
  authors: [{ name: 'Jose Luis Ponton' }],
  metadataBase: new URL('https://joseluisponton.com'),
  openGraph: {
    title: 'Jose Luis Ponton — AI & Computer Graphics Researcher',
    description: 'Research on generative AI, human motion, virtual reality, and robotics at the Max Planck Institute for Informatics.',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://joseluisponton.com/prof_pic.jpg',
        width: 800,
        height: 800,
        alt: 'Jose Luis Ponton',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jose Luis Ponton — AI & Computer Graphics Researcher',
    description: 'Research on generative AI, human motion, virtual reality, and robotics at the Max Planck Institute for Informatics.',
    images: ['https://joseluisponton.com/prof_pic.jpg'],
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
  const profile = getProfile();
  const social = profile.social || {};

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans bg-bg text-text min-h-screen flex flex-col antialiased">
        <Particles className="hidden md:block fixed inset-0 z-0 pointer-events-none opacity-40" />
        <Navigation />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
          {children}
        </main>
        <footer className="mt-12 text-sm text-text-muted">
          <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
          <div className="max-w-5xl mx-auto px-6 py-7 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© {new Date().getFullYear()} Jose Luis Ponton.</p>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
              {profile.email && <a href={`mailto:${profile.email}`} className="hover:text-accent transition-colors">Email</a>}
              {social.scholar && <a href={social.scholar} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Google Scholar</a>}
              {social.linkedin && <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">LinkedIn</a>}
            </div>
          </div>
        </footer>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        <ScrollToTop />
      </body>
    </html>
  );
}
