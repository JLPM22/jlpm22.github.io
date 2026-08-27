'use client';

import { useState } from 'react';
import BibTeXModal from '@/components/BibTeXModal';
import PublicationVenueLine from '@/components/PublicationVenueLine';
import NewPublicationBadge from '@/components/NewPublicationBadge';

const DEFAULT_VENUE_COLOR = '#94a3b8';

function renderAuthors(authorStr, coauthors) {
    if (!authorStr) return null;
    const parts = authorStr.split(',').map(a => a.trim());

    return parts.map((author, i) => {
        const prefix = i > 0 ? ' ' : '';
        const sep = i < parts.length - 1 ? ',' : '';

        if (author.toLowerCase().includes('jose luis ponton')) {
            return <span key={i}>{prefix}<strong className="text-text">{author}</strong>{sep}</span>;
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
                    <span key={i}>{prefix}
                        <a href={coauthor.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{author}</a>{sep}
                    </span>
                );
            }
        }

        return <span key={i}>{prefix}{author}{sep}</span>;
    });
}

export default function SelectedPaperCard({ paper, venueColors, coauthors }) {
    const [showBibtex, setShowBibtex] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const doiUrl = paper.doi ? `https://${paper.doi}` : '';
    const paperLink = paper.pdf_url || doiUrl || '#';
    const hasVenueTag = !!paper.venueTag;
    const isJournalNoConf = paper.type === 'Journal' && !paper.journalConference;
    const btnCls = "inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-full bg-white text-text-secondary hover:bg-accent hover:text-white hover:border-accent transition-colors border border-border";
    const summaryBtnCls = "inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-full border border-accent/30 bg-accent/[0.07] text-accent shadow-sm transition-colors hover:border-accent hover:bg-accent hover:text-white sm:hidden";

    return (
        <article className="group bg-white rounded-2xl shadow-sm border border-border hover:shadow-card hover:border-accent/40 transition-all duration-300 overflow-visible relative">
            <NewPublicationBadge year={paper.year} month={paper.month} className="absolute right-3 top-3 z-40 sm:hidden" />
            <div onClick={() => window.open(paperLink, '_blank')} className="flex flex-col sm:flex-row gap-4 p-4 relative cursor-pointer rounded-t-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"></div>

                <div className="w-full sm:w-36 shrink-0 bg-bg-subtle rounded-xl flex items-center justify-center overflow-hidden shadow-sm ring-1 ring-black/5 md:hover:shadow-lg md:hover:scale-[1.04] transition-all duration-500 ease-out relative z-20 self-center" onClick={(e) => e.stopPropagation()}>
                    {paper.video_url ? (
                        paper.video_url.endsWith('.mp4') || paper.video_url.endsWith('.webm') ? (
                            <video autoPlay loop muted playsInline preload="metadata" className="w-full h-auto object-contain rounded-xl">
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
                    <div className="mb-1 flex min-w-0 items-start justify-between gap-3">
                        <PublicationVenueLine paper={paper} venueColors={venueColors} />
                        <NewPublicationBadge year={paper.year} month={paper.month} className="hidden sm:inline-flex" />
                    </div>
                    <h3 className={`${paper.title.length > 95 ? 'text-[15px]' : paper.title.length > 64 ? 'text-base' : 'text-lg'} font-outfit font-bold text-text group-hover:text-accent transition-colors leading-snug`}>
                        {paper.title}
                    </h3>
                    <p className={`${paper.authors.length > 145 ? 'text-[10px]' : paper.authors.length > 105 ? 'text-xs' : 'text-sm'} text-text-secondary mt-0.5 leading-snug [text-wrap:pretty]`} onClick={(e) => e.stopPropagation()}>
                        {renderAuthors(paper.authors, coauthors)}
                    </p>

                    {paper.summary && (
                        <>
                            {showSummary && (
                                <div className="mt-2 rounded-r-lg border-l-2 border-accent/30 bg-accent/[0.035] px-3 py-2 sm:hidden" onClick={(e) => e.stopPropagation()}>
                                    <p className="text-[11px] leading-relaxed text-text-secondary/75">
                                        {paper.summary}
                                    </p>
                                </div>
                            )}
                            <div className="mt-1.5 hidden min-w-0 items-start gap-1.5 opacity-75 sm:flex md:mt-0 md:max-h-0 md:overflow-hidden md:opacity-0 md:transition-all md:duration-300 md:group-hover:mt-1.5 md:group-hover:max-h-40 md:group-hover:opacity-100">
                                <span className="mt-0.5 shrink-0 text-accent/60" title="TL;DR">
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeWidth="1.7" d="M5 6h14M5 10h10M5 14h13M5 18h8" />
                                    </svg>
                                    <span className="sr-only">TL;DR</span>
                                </span>
                                <p className="min-w-0 text-[11px] leading-relaxed text-text-muted/70">
                                    {paper.summary}
                                </p>
                            </div>
                        </>
                    )}

                    {paper.awards?.length > 0 && <div className="flex flex-wrap gap-2 mt-2">{paper.awards.map(award => <a key={award.name} href={award.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 21h8m-4-4v4M7 4h10v4a5 5 0 01-10 0V4zm0 2H4v1a4 4 0 004 4m9-5h3v1a4 4 0 01-4 4" /></svg>{award.name}{award.entity ? ` · ${award.entity}` : ''}<span aria-hidden="true">↗</span></a>)}</div>}

                </div>
            </div>

            {/* Buttons — always open on mobile, slide down on hover on desktop */}
            <div className="overflow-hidden transition-all duration-300 ease-in-out max-h-20 md:max-h-0 md:group-hover:max-h-20">
                <div className="flex flex-wrap gap-1 px-3 py-2 border-t border-border/40 bg-gray-50/50 rounded-b-xl">
                    {paper.pdf_url && <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer" className={btnCls}>PDF</a>}
                    {doiUrl && <a href={doiUrl} target="_blank" rel="noopener noreferrer" className={btnCls}>DOI</a>}
                    {paper.video_ext_url && <a href={paper.video_ext_url} target="_blank" rel="noopener noreferrer" className={btnCls}>Video</a>}
                    {paper.code_url && <a href={paper.code_url} target="_blank" rel="noopener noreferrer" className={btnCls}>Code</a>}
                    {paper.website_url && <a href={paper.website_url} target="_blank" rel="noopener noreferrer" className={btnCls}>Website</a>}
                    {paper.bibtex && (
                        <button
                            className={btnCls}
                            onClick={(e) => { e.stopPropagation(); setShowBibtex(true); }}
                        >
                            BibTeX
                        </button>
                    )}
                    {paper.summary && (
                        <button
                            type="button"
                            className={summaryBtnCls}
                            aria-expanded={showSummary}
                            onClick={(e) => { e.stopPropagation(); setShowSummary(value => !value); }}
                        >
                            TL;DR
                        </button>
                    )}
                </div>
            </div>

            {showBibtex && (
                <BibTeXModal
                    bibtex={paper.bibtex}
                    onClose={() => setShowBibtex(false)}
                />
            )}
        </article>
    );
}
