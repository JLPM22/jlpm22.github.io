import Image from 'next/image';
import { getAboutContent, getSelectedPapers, getVenueColors, getCoauthors, getProfile } from '@/lib/content';
import SelectedPaperCard from '@/components/SelectedPaperCard';

// Social icon components
const icons = {
  email: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
  ),
  github: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
  ),
  linkedin: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
  ),
  orcid: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 01-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.025-5.325 5.025h-3.919V7.416zm1.444 1.303v7.444h2.297c3.272 0 4.022-2.484 4.022-3.722 0-1.847-1.238-3.722-3.966-3.722h-2.353z" /></svg>
  ),
  researchgate: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><text x="3" y="18" fontSize="14" fontWeight="bold" fontFamily="Arial, sans-serif">RG</text></svg>
  ),
  scholar: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 100 14 7 7 0 000-14z" /></svg>
  ),
};

export default function HomePage() {
  const { htmlContent } = getAboutContent();
  const selectedPapers = getSelectedPapers();
  const venueColors = getVenueColors();
  const coauthors = getCoauthors();
  const profile = getProfile();
  const social = profile.social || {};

  return (
    <>
      <div className="flex flex-col md:flex-row gap-12 items-start mt-8">

        {/* Profile Section */}
        <div className="md:w-1/3 flex flex-col items-center md:items-start space-y-6 md:sticky md:top-24 text-center md:text-left">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56">
            <div className="absolute inset-0 bg-accent rounded-full blur-xl opacity-20 animate-pulse"></div>
            <Image
              src="/prof_pic.jpg"
              alt={profile.name || 'Profile'}
              fill
              className="rounded-full border-4 border-white/50 shadow-2xl object-cover relative z-10"
              priority
            />
          </div>
          <div>
            <h1 className="font-outfit text-4xl font-bold tracking-tight text-text mb-2">{profile.name}</h1>
            <p className="text-xl text-accent font-medium mb-4">{profile.title}</p>
            <div className="flex gap-3 justify-center md:justify-start flex-wrap">
              <a href="/cv_joseluis_ponton.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-text-secondary hover:text-accent transition-colors px-3 py-2 bg-white rounded-full shadow-sm border border-border hover:shadow-md hover:-translate-y-1 transform text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                CV
              </a>
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="text-text-secondary hover:text-accent transition-colors p-2 bg-white rounded-full shadow-sm border border-border hover:shadow-md hover:-translate-y-1 transform">
                  {icons.email}
                </a>
              )}
              {social.github && (
                <a href={social.github} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors p-2 bg-white rounded-full shadow-sm border border-border hover:shadow-md hover:-translate-y-1 transform">
                  {icons.github}
                </a>
              )}
              {social.linkedin && (
                <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors p-2 bg-white rounded-full shadow-sm border border-border hover:shadow-md hover:-translate-y-1 transform">
                  {icons.linkedin}
                </a>
              )}
              {social.orcid && (
                <a href={social.orcid} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors p-2 bg-white rounded-full shadow-sm border border-border hover:shadow-md hover:-translate-y-1 transform">
                  {icons.orcid}
                </a>
              )}
              {social.researchgate && (
                <a href={social.researchgate} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors p-2 bg-white rounded-full shadow-sm border border-border hover:shadow-md hover:-translate-y-1 transform">
                  {icons.researchgate}
                </a>
              )}
              {social.scholar && (
                <a href={social.scholar} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors p-2 bg-white rounded-full shadow-sm border border-border hover:shadow-md hover:-translate-y-1 transform">
                  {icons.scholar}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* About Content Section */}
        <div className="md:w-2/3 space-y-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/40 prose prose-base prose-headings:font-outfit prose-headings:text-text prose-p:text-text-secondary prose-a:text-accent hover:prose-a:text-accent-dark text-justify">
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>

          {selectedPapers.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              <h2 className="text-2xl font-outfit font-bold mb-6 text-text relative inline-block">
                Selected Publications
                <div className="absolute -bottom-1 left-0 w-1/2 h-1 bg-accent/40 rounded-full"></div>
              </h2>
              <div className="space-y-4">
                {selectedPapers.map((paper, idx) => (
                  <SelectedPaperCard
                    key={idx}
                    paper={paper}
                    venueColors={venueColors}
                    coauthors={coauthors}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
