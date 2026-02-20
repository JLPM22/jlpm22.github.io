import './globals.css';
import Particles from '@/components/Particles';

export const metadata = {
  title: 'Research Hub',
  description: 'Personal research productivity hub',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-bg text-text min-h-screen flex flex-col antialiased">
        <Particles className="fixed inset-0 z-0 pointer-events-none opacity-40" />
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-border/60 shadow-sm">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <a href="/" className="font-outfit font-bold text-xl tracking-tight text-text hover:text-accent transition-colors">
              Jose Luis Ponton
            </a>
            <div className="flex gap-1 font-medium text-sm">
              <a href="/" className="px-3 py-1.5 rounded-lg text-text-secondary hover:text-accent hover:bg-accent/5 transition-all">About</a>
              <a href="/publications" className="px-3 py-1.5 rounded-lg text-text-secondary hover:text-accent hover:bg-accent/5 transition-all">Publications</a>
              <a href="/opensource" className="px-3 py-1.5 rounded-lg text-text-secondary hover:text-accent hover:bg-accent/5 transition-all">Open Source</a>
              <a href="/teaching" className="px-3 py-1.5 rounded-lg text-text-secondary hover:text-accent hover:bg-accent/5 transition-all">Teaching</a>
              <a href="/service" className="px-3 py-1.5 rounded-lg text-text-secondary hover:text-accent hover:bg-accent/5 transition-all">Service</a>
              <a href="/cv_joseluis_ponton.pdf" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg text-text-secondary hover:text-accent hover:bg-accent/5 transition-all">CV</a>
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
      </body>
    </html>
  );
}
