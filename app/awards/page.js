import { getAwards } from '@/lib/content';
import PageHeader from '@/components/PageHeader';

export const metadata = {
  title: 'Awards',
  description: 'Research awards and distinctions received by Jose Luis Ponton.',
};

const sourceLabel = (link) => {
  if (link.label) return link.label;
  try {
    const host = new URL(link.url).hostname.replace(/^www\./, '');
    const labels = {
      'fbbva.es': 'Fundación BBVA',
      'mpi-inf.mpg.de': 'MPI-INF',
      'alumni.upc.edu': 'UPC Alumni',
      'fib.upc.edu': 'UPC–FIB',
      'doi.org': 'Publication',
    };
    return labels[host] || host;
  } catch {
    return 'Related link';
  }
};

export default function AwardsPage() {
  const awards = getAwards();

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="Awards" description="Research awards and academic distinctions." />

      {awards.length > 0 ? (
        <div className="space-y-4">
          {awards.map((award) => (
            <article key={`${award.name}-${award.date}`} className="rounded-xl border border-border bg-white/80 p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-accent/30">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-accent mb-1">{award.date}</p>
                  <h2 className="font-outfit font-bold text-xl leading-snug text-text">{award.name}</h2>
                  <p className="text-sm font-medium text-text-secondary mt-1">{award.entity}</p>
                  {award.description && <p className="text-sm text-text-secondary mt-2 leading-relaxed">{award.description}</p>}
                  {award.relatedLinks.length > 0 && (
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3" aria-label={`Related links for ${award.name}`}>
                      {award.relatedLinks.map((link, linkIdx) => (
                        <a key={`${link.url}-${linkIdx}`} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-dark transition-colors">
                          {sourceLabel(link)} <span aria-hidden="true">↗</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                {award.certificateUrl && (
                  <a href={award.certificateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 self-start whitespace-nowrap rounded-full border border-border bg-white px-3 py-1.5 text-sm font-medium text-text-secondary hover:border-accent/40 hover:text-accent transition-colors" aria-label={`View certificate for ${award.name}`}>
                    {award.certificateLabel}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7m0 0v7m0-7L10 14M5 5h5M5 5a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5" /></svg>
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-text-secondary">No awards have been added yet.</p>
      )}
    </div>
  );
}
