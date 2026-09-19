import { getAboutContent, getSelectedPapers, getVenueColors, getCoauthors, getProfile, getNews } from '@/lib/content';
import SelectedPaperCard from '@/components/SelectedPaperCard';

import icons from '@/components/SocialIcons';

export default function HomePage() {
  const { htmlContent } = getAboutContent();
  const selectedPapers = getSelectedPapers();
  const venueColors = getVenueColors();
  const coauthors = getCoauthors();
  const profile = getProfile();
  const news = getNews();
  const social = profile.social || {};

  // Construct JSON-LD structured data for Google Rich Snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.title,
    url: 'https://joseluisponton.com',
    image: 'https://joseluisponton.com/prof_pic.jpg',
    sameAs: Object.values(social).filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="home-page">
        <section className="about-hero" aria-labelledby="profile-heading">
          <div className="hero-intro">
            <div className="hero-heading">
              <h1 id="profile-heading">{profile.name}</h1>
              <p className="hero-role">
                {profile.title}
                {profile.institution && <>{' @ '}<a href={profile.institution.url}>
                  <span className="hero-role-short">{profile.institution.short_name || profile.institution.name}</span>
                  <span className="hero-role-long">{profile.institution.name}</span>
                </a></>}
              </p>
            </div>
            <div className="about-copy" dangerouslySetInnerHTML={{ __html: htmlContent }} />
            <div className="hero-actions">
              <a href="/publications" className="primary-link">View publications <span aria-hidden="true">&#8599;</span></a>
              <a href="/cv_joseluis_ponton.pdf" target="_blank" rel="noopener noreferrer" className="secondary-link" aria-label="Curriculum vitae"><span className="hidden sm:inline">Curriculum vitae</span><span className="sm:hidden">CV</span> <span aria-hidden="true">&#8599;</span></a>
            </div>
          </div>
          <div className="profile-aside">
            <img src="/prof_pic_500.jpg" srcSet="/prof_pic_250.jpg 259w, /prof_pic_500.jpg 519w, /prof_pic_1200.jpg 1384w" sizes="(max-width: 639px) 172px, (max-width: 899px) 104px, (max-width: 1023px) 210px, 280px" alt={profile.name || 'Profile'} width="519" height="524" fetchPriority="high" className="profile-photo" />
            <div className="profile-socials" aria-label="Contact and research profiles">
              {profile.email && <a href={`mailto:${profile.email}`} aria-label="Email" title="Email">{icons.email}</a>}
              {Object.entries(social).map(([key, url]) => url && icons[key] && (
                <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={{ github: 'GitHub', linkedin: 'LinkedIn', orcid: 'ORCID', researchgate: 'ResearchGate', scholar: 'Google Scholar' }[key]} title={{ github: 'GitHub', linkedin: 'LinkedIn', orcid: 'ORCID', researchgate: 'ResearchGate', scholar: 'Google Scholar' }[key]}>{icons[key]}</a>
              ))}
            </div>
          </div>
        </section>

        {news.length > 0 && (
          <section className="news-section" aria-labelledby="news-heading">
            <h2 id="news-heading" className="section-label">News</h2>
            <div className="news-list">
              {news.map(item => {
                const external = item.url?.startsWith('http');
                return <article key={`${item.date}-${item.title}`} className="news-item">
                  <time>{item.date}</time>
                  <div className="news-content">
                    <h3>{item.title}</h3>
                    <div className="news-detail">
                      {item.description && <p>{item.description}</p>}
                      {item.url && <a href={item.url} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{item.link_label || 'Read more'} <span aria-hidden="true">&#8599;</span></a>}
                    </div>
                  </div>
                </article>;
              })}
            </div>
          </section>
        )}

        {selectedPapers.length > 0 && (
          <section className="selected-section" aria-labelledby="selected-heading">
            <div className="section-heading">
              <h2 id="selected-heading" className="section-label">Selected publications</h2>
              <a href="/publications" className="text-link">All publications <span aria-hidden="true">&#8599;</span></a>
            </div>
            <div className="selected-papers">{selectedPapers.map(paper => <SelectedPaperCard key={paper.title} paper={paper} venueColors={venueColors} coauthors={coauthors} />)}</div>
          </section>
        )}
      </div>
    </>
  );
}
