'use client';

import Link from 'next/link';
import Image from 'next/image';
import Particles from '@/components/Particles';

export default function HomePage() {
  return (
    <>
      <Particles />
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-bg to-accent-glow relative overflow-hidden">
        <header className="bg-white rounded-2xl p-10 shadow-2xl w-full max-w-2xl text-center relative z-10 border border-border">
          <div className="mb-8 relative w-40 h-40 mx-auto">
            <Image
              src="/prof_pic.jpg"
              alt="Jose Luis Ponton"
              fill
              className="rounded-full border-4 border-accent object-cover shadow-glow"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-text">Jose Luis Ponton</h1>
          <p className="text-lg text-text-secondary mb-8 font-medium">
            Generative AI · Deep Learning · Character Animation · Computer Graphics · XR/VR
          </p>
          <div className="space-y-4 max-w-prose mx-auto text-text-secondary leading-relaxed">
            <p>
              Hello! I am a Computer Graphics researcher and recent Ph.D. graduate from UPC Barcelona,
              specializing in Generative AI and character animation. Currently, I am a Research Scientist
              Intern at Meta Reality Labs in Zurich, working on scalable AI-based motion stylization.
            </p>
            <p>
              My background bridges academia and startups; I have conducted research on Generative AI at
              the Max Planck Institute and developed motion capture pipelines for a Y Combinator startup.
            </p>
            <p>
              My research focuses on applying AI to character animation, with a growing interest in the
              intersection of virtual motion control and robotics.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-10">
            <Link
              href="/manage-papers"
              className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all no-underline bg-bg-subtle text-text-secondary hover:-translate-y-0.5 hover:bg-accent-glow hover:text-accent font-medium hover:shadow-lg border border-transparent hover:border-accent/20"
            >
              📄 Publications
            </Link>
            <a
              href="mailto:your@email.com"
              className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all no-underline bg-bg-subtle text-text-secondary hover:-translate-y-0.5 hover:bg-accent-glow hover:text-accent font-medium hover:shadow-lg border border-transparent hover:border-accent/20"
            >
              ✉️ Contact
            </a>
            <Link
              href="/login"
              className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all no-underline bg-gradient-primary text-white shadow-glow hover:-translate-y-0.5 hover:shadow-glow-lg font-medium"
            >
              Dashboard →
            </Link>
          </div>
        </header>
      </div>
    </>
  );
}
