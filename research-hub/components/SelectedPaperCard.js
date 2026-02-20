'use client';

const DEFAULT_VENUE_COLOR = '#94a3b8';

function renderAuthors(authorStr, coauthors) {
    if (!authorStr) return null;
    const parts = authorStr.split(',').map(a => a.trim());

    return parts.map((author, i) => {
        const sep = i < parts.length - 1 ? ', ' : '';

        if (author.toLowerCase().includes('jose luis ponton')) {
            return <span key={i}><strong className="text-text">{author}</strong>{sep}</span>;
        }

        const nameParts = author.split(' ');
        const lastName = nameParts[nameParts.length - 1].toLowerCase();
        const coauthor = coauthors[lastName];
        if (coauthor) {
            const firstNames = coauthor.firstname || [];
            const firstName = nameParts.slice(0, -1).join(' ');
            const matches = firstNames.some(fn =>
                firstName.toLowerCase().startsWith(fn.toLowerCase().replace('.', ''))
            );
            if (matches && coauthor.url) {
                return (
                    <span key={i}>
                        <a href={coauthor.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{author}</a>{sep}
                    </span>
                );
            }
        }

        return <span key={i}>{author}{sep}</span>;
    });
}

export default function SelectedPaperCard({ paper, venueColors, coauthors }) {
    const doiUrl = paper.doi ? `https://${paper.doi}` : '';
    const paperLink = paper.pdf_url || doiUrl || '#';
    const hasVenueTag = !!paper.venueTag;
    const isJournalNoConf = paper.type === 'Journal' && !paper.journalConference;
    const btnCls = "inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-bold rounded bg-bg-subtle text-text hover:bg-accent hover:text-white hover:border-accent transition-colors border border-border";

    return (
        <div className="group bg-white rounded-xl shadow-sm border border-border hover:shadow-md hover:border-accent/30 transition-all duration-300 overflow-visible relative">
            <div onClick={() => window.open(paperLink, '_blank')} className="flex flex-col sm:flex-row gap-4 p-3 relative cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"></div>

                <div className="sm:w-32 shrink-0 bg-transparent rounded-md flex items-center justify-center overflow-visible shadow-md group-hover:shadow-glow hover:!shadow-2xl hover:scale-[1.5] hover:!z-50 transition-all duration-300 relative z-20 self-center cursor-zoom-in" onClick={(e) => e.stopPropagation()}>
                    {paper.video_url ? (
                        paper.video_url.endsWith('.mp4') || paper.video_url.endsWith('.webm') ? (
                            <video autoPlay loop muted playsInline preload="none" className="w-full h-auto object-contain rounded-md">
                                <source src={paper.video_url} type={`video/${paper.video_url.split('.').pop()}`} />
                            </video>
                        ) : (
                            <img src={paper.video_url} alt="Preview" loading="lazy" className="w-full h-auto object-contain rounded-md" />
                        )
                    ) : (
                        <span className="text-xs text-text-muted py-6">No Media</span>
                    )}
                </div>

                <div className="flex-1 min-w-0 z-30 flex flex-col justify-center">
                    <h3 className="font-bold text-text group-hover:text-accent transition-colors leading-snug">
                        {paper.title}
                    </h3>
                    <p className="text-sm text-text-secondary mt-0.5" onClick={(e) => e.stopPropagation()}>
                        {renderAuthors(paper.authors, coauthors)}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {hasVenueTag ? (
                            <span
                                className="relative inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold text-white cursor-default group/pill z-40"
                                style={{ backgroundColor: venueColors[paper.venueTag] || DEFAULT_VENUE_COLOR }}
                                title={paper.journalConference || paper.venue}
                            >
                                {paper.venueTag}
                                <span className="ml-1 opacity-80">'{String(paper.year).slice(-2)}</span>
                                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gray-900/95 backdrop-blur-sm whitespace-nowrap opacity-0 group-hover/pill:opacity-100 transition-opacity duration-200 shadow-lg z-[100]">
                                    {paper.journalConference || paper.venue}
                                    <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-900/95"></span>
                                </span>
                            </span>
                        ) : isJournalNoConf ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: DEFAULT_VENUE_COLOR }}>
                                {paper.year}
                            </span>
                        ) : (
                            <span
                                className="relative inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold text-white cursor-default group/pill z-40"
                                style={{ backgroundColor: DEFAULT_VENUE_COLOR }}
                                title={paper.venue}
                            >
                                {paper.type}
                                <span className="ml-1 opacity-80">'{String(paper.year).slice(-2)}</span>
                                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gray-900/95 backdrop-blur-sm whitespace-nowrap opacity-0 group-hover/pill:opacity-100 transition-opacity duration-200 shadow-lg z-[100]">
                                    {paper.venue}
                                    <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-900/95"></span>
                                </span>
                            </span>
                        )}
                        {paper.type === 'Journal' && paper.venue && (
                            <span
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold text-white z-30"
                                style={{ backgroundColor: venueColors[paper.venue] || '#6b7280' }}
                            >
                                {paper.publisher ? `${paper.publisher} · ${paper.venue}` : paper.venue}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Buttons — slide down on hover */}
            <div className="max-h-0 group-hover:max-h-16 overflow-hidden transition-all duration-300 ease-in-out">
                <div className="flex flex-wrap gap-1 px-3 py-2 border-t border-border/40 bg-gray-50/50 rounded-b-xl">
                    {paper.pdf_url && <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer" className={btnCls}>PDF</a>}
                    {doiUrl && <a href={doiUrl} target="_blank" rel="noopener noreferrer" className={btnCls}>DOI</a>}
                    {paper.video_ext_url && <a href={paper.video_ext_url} target="_blank" rel="noopener noreferrer" className={btnCls}>Video</a>}
                    {paper.code_url && <a href={paper.code_url} target="_blank" rel="noopener noreferrer" className={btnCls}>Code</a>}
                    {paper.website_url && <a href={paper.website_url} target="_blank" rel="noopener noreferrer" className={btnCls}>Website</a>}
                </div>
            </div>
        </div>
    );
}
