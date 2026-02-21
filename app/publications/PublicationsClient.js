'use client';

import { useState, useRef } from 'react';

const DEFAULT_VENUE_COLOR = '#94a3b8';

// Parse author string and create linked spans
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
                        <a href={coauthor.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline" onClick={(e) => e.stopPropagation()}>{author}</a>{sep}
                    </span>
                );
            }
        }

        return <span key={i}>{author}{sep}</span>;
    });
}

function VenueTagPill({ tag, color, venue, year, onClick }) {
    const bgColor = color || DEFAULT_VENUE_COLOR;
    const tooltipText = venue || tag;
    return (
        <span
            className="relative inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold text-white cursor-pointer group/pill hover:scale-110 transition-all z-40"
            style={{ backgroundColor: bgColor }}
            title={tooltipText}
            onClick={onClick}
        >
            {tag}
            {year != null && <span className="ml-1 opacity-80">'{String(year).slice(-2)}</span>}
            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gray-900/95 backdrop-blur-sm whitespace-nowrap opacity-0 group-hover/pill:opacity-100 transition-opacity duration-200 shadow-lg z-[100]">
                {tooltipText}
                <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-900/95"></span>
            </span>
        </span>
    );
}

function BibTeXModal({ bibtex, onClose }) {
    const [copied, setCopied] = useState(false);
    const [confetti, setConfetti] = useState([]);
    const btnRef = useRef(null);

    const handleCopy = () => {
        navigator.clipboard.writeText(bibtex);
        setCopied(true);

        const btn = btnRef.current;
        const rect = btn ? btn.getBoundingClientRect() : null;
        const btnCenterX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
        const btnCenterY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

        const particles = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: btnCenterX,
            y: btnCenterY,
            angle: (Math.random() * 360) * (Math.PI / 180),
            velocity: 3 + Math.random() * 6,
            color: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'][Math.floor(Math.random() * 8)],
            size: 4 + Math.random() * 6,
            rotation: Math.random() * 360,
        }));
        setConfetti(particles);
        setTimeout(() => setCopied(false), 2500);
        setTimeout(() => setConfetti([]), 1500);
    };

    const formatBibtex = (bib) => {
        if (!bib) return '';
        return bib
            .replace(/@(\w+)\{/g, '<span class="text-accent font-bold">@$1</span>{')
            .replace(/(\w+)\s*=\s*\{/g, '  <span class="text-blue-600">$1</span> = {')
            .replace(/\{([^}]*)\}/g, '{<span class="text-emerald-700">$1</span>}');
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col relative border border-border mx-4 sm:mx-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-border">
                    <h3 className="text-lg font-bold text-text">BibTeX Citation</h3>
                    <button onClick={onClose} className="text-text-muted hover:text-text transition-colors p-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-4 sm:p-5 overflow-auto flex-1">
                    <pre
                        className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 text-xs sm:text-sm font-mono text-text whitespace-pre-wrap break-all sm:break-words leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatBibtex(bibtex) }}
                    />
                </div>
                <div className="px-4 sm:px-5 py-3 sm:py-4 border-t border-border flex justify-end relative">
                    <button
                        ref={btnRef}
                        onClick={handleCopy}
                        className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${copied
                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                            : 'bg-accent text-white hover:bg-emerald-400 shadow-md hover:shadow-lg'
                            }`}
                    >
                        {copied ? '✓ Copied!' : 'Copy to Clipboard'}
                    </button>
                </div>
            </div>

            {confetti.length > 0 && (
                <div className="fixed inset-0 pointer-events-none z-[200]">
                    {confetti.map(p => (
                        <div
                            key={p.id}
                            className="absolute rounded-sm"
                            style={{
                                left: p.x,
                                top: p.y,
                                width: p.size,
                                height: p.size,
                                backgroundColor: p.color,
                                transform: `rotate(${p.rotation}deg)`,
                                animation: `confetti-burst 1s ease-out forwards`,
                                '--dx': `${Math.cos(p.angle) * p.velocity * 40}px`,
                                '--dy': `${Math.sin(p.angle) * p.velocity * 40 - 80}px`,
                            }}
                        />
                    ))}
                </div>
            )}

            <style jsx>{`
                @keyframes confetti-burst {
                    0% {
                        transform: translate(0, 0) rotate(0deg) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(var(--dx), var(--dy)) rotate(720deg) scale(0);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
}

export default function PublicationsClient({ initialPapers, venueColors = {}, allVenueTags = [], allJournalNames = [], allTopicTags = [], coauthors = {} }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [selectedVenues, setSelectedVenues] = useState([]);
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [showVenueFilter, setShowVenueFilter] = useState(false);
    const [showTopicFilter, setShowTopicFilter] = useState(false);
    const [bibtexModal, setBibtexModal] = useState(null);

    const allVenueOptions = [...new Set([...allVenueTags, ...allJournalNames])].sort();

    const toggleVenue = (venue) => {
        setSelectedVenues(prev =>
            prev.includes(venue) ? prev.filter(v => v !== venue) : [...prev, venue]
        );
    };

    const toggleTopic = (topic) => {
        setSelectedTopics(prev =>
            prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
        );
    };

    const venueMap = {};
    initialPapers.forEach(paper => {
        if (paper.venueTag) venueMap[paper.venueTag] = paper.venueTag;
        if (paper.type === 'Journal' && paper.venue) {
            venueMap[paper.venue] = paper.publisher ? `${paper.publisher} · ${paper.venue}` : paper.venue;
        }
    });

    const isTopicMatch = (paper, topics) => topics.length === 0 || topics.some(t => paper.topicTags.includes(t));
    const isVenueMatch = (paper, venues) => venues.length === 0 || venues.some(v => paper.venueTag === v || paper.venue === v);
    const isSearchMatch = (paper, search) => paper.title.toLowerCase().includes(search.toLowerCase()) || paper.authors.toLowerCase().includes(search.toLowerCase());
    const isTypeMatch = (paper, type) => type === 'All' || paper.type === type;

    const filteredPapers = initialPapers.filter(paper => {
        return isSearchMatch(paper, searchTerm) &&
            isTypeMatch(paper, filterType) &&
            isVenueMatch(paper, selectedVenues) &&
            isTopicMatch(paper, selectedTopics);
    });

    const venueCounts = {};
    allVenueOptions.forEach(v => venueCounts[v] = 0);
    initialPapers.filter(paper => isSearchMatch(paper, searchTerm) && isTypeMatch(paper, filterType) && isTopicMatch(paper, selectedTopics))
        .forEach(paper => {
            if (paper.venueTag && venueCounts[paper.venueTag] !== undefined) venueCounts[paper.venueTag]++;
            if (paper.type === 'Journal' && paper.venue && venueCounts[paper.venue] !== undefined) venueCounts[paper.venue]++;
        });

    const topicCounts = {};
    allTopicTags.forEach(t => topicCounts[t] = 0);
    initialPapers.filter(paper => isSearchMatch(paper, searchTerm) && isTypeMatch(paper, filterType) && isVenueMatch(paper, selectedVenues))
        .forEach(paper => {
            paper.topicTags.forEach(t => { if (topicCounts[t] !== undefined) topicCounts[t]++ });
        });

    const groupedPapers = filteredPapers.reduce((acc, paper) => {
        const year = paper.year === 9999 ? 'Pre-print' : paper.year;
        if (!acc[year]) acc[year] = [];
        acc[year].push(paper);
        return acc;
    }, {});

    const sortedYears = Object.keys(groupedPapers).sort((a, b) => {
        if (a === 'Pre-print') return -1;
        if (b === 'Pre-print') return 1;
        return b - a;
    });

    const hasActiveFilters = selectedVenues.length > 0 || selectedTopics.length > 0;

    const btnBase = "inline-flex items-center justify-center px-3 py-1 text-xs font-bold rounded-md transition-colors border";
    const btnNormal = `${btnBase} bg-bg-subtle text-text border-border hover:bg-accent hover:text-white hover:border-accent`;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header + Search row */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <h1 className="text-4xl font-outfit font-bold text-text relative inline-block self-start">
                    Publications
                    <div className="absolute -bottom-2 left-0 w-1/3 h-1 bg-accent rounded-full"></div>
                </h1>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search papers..."
                        className="px-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-accent/50 w-full sm:w-56 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="px-3 py-2.5 pr-8 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer text-sm text-text-secondary font-medium appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat w-full sm:w-auto"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="All">All Types</option>
                        <option value="Conference">Conference</option>
                        <option value="Journal">Journal</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-4 flex-wrap bg-white/50 p-2 rounded-xl border border-border/50">
                <button
                    onClick={() => setShowVenueFilter(!showVenueFilter)}
                    className={`text-sm font-medium transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg ${showVenueFilter ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-accent hover:bg-black/5'}`}
                >
                    <svg className={`w-4 h-4 transition-transform ${showVenueFilter ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Filter by Venue
                </button>

                <button
                    onClick={() => setShowTopicFilter(!showTopicFilter)}
                    className={`text-sm font-medium transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg ${showTopicFilter ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-accent hover:bg-black/5'}`}
                >
                    <svg className={`w-4 h-4 transition-transform ${showTopicFilter ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Filter by Topic
                </button>
            </div>



            {/* Venue Filter chips */}
            {showVenueFilter && (
                <div className="flex flex-wrap gap-2 mb-4 p-4 bg-white rounded-xl border border-border shadow-sm">
                    {allVenueOptions.map(venue => {
                        const isActive = selectedVenues.includes(venue);
                        const count = venueCounts[venue] || 0;
                        const isDisabled = count === 0 && !isActive;
                        const color = venueColors[venue];
                        const displayName = venueMap[venue] || venue;
                        return (
                            <button
                                key={venue}
                                onClick={() => !isDisabled && toggleVenue(venue)}
                                disabled={isDisabled}
                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 ${isActive
                                    ? 'text-white border-transparent shadow-sm'
                                    : isDisabled
                                        ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                                        : 'bg-bg-subtle text-text-secondary border-border hover:border-accent/40 hover:text-accent'
                                    }`}
                                style={isActive && color ? { backgroundColor: color } : isActive ? { backgroundColor: '#10b981' } : {}}
                            >
                                {displayName} <span className={`text-[10px] ${isActive ? 'text-white/80' : isDisabled ? 'text-gray-400' : 'text-text-muted/60'}`}>({count})</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Topic Filter chips */}
            {showTopicFilter && (
                <div className="flex flex-wrap gap-2 mb-4 p-4 bg-white rounded-xl border border-border shadow-sm">
                    {allTopicTags.map(topic => {
                        const isActive = selectedTopics.includes(topic);
                        const count = topicCounts[topic] || 0;
                        const isDisabled = count === 0 && !isActive;
                        return (
                            <button
                                key={topic}
                                onClick={() => !isDisabled && toggleTopic(topic)}
                                disabled={isDisabled}
                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 ${isActive
                                    ? 'bg-accent text-white border-accent shadow-sm'
                                    : isDisabled
                                        ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                                        : 'bg-bg-subtle text-text-secondary border-border hover:border-accent/40 hover:text-accent'
                                    }`}
                            >
                                {topic} <span className={`text-[10px] ${isActive ? 'text-white/80' : isDisabled ? 'text-gray-400' : 'text-text-muted/60'}`}>({count})</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mb-4 bg-accent/5 p-3 rounded-xl border border-accent/20 shadow-inner">
                    <span className="text-xs font-bold text-accent uppercase tracking-wider mr-1 sm:mr-3">Active Filters:</span>

                    {selectedVenues.map(v => (
                        <span key={v} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg text-xs font-medium text-white shadow-sm" style={{ backgroundColor: venueColors[v] || '#10b981' }}>
                            {venueMap[v] || v}
                            <button onClick={() => toggleVenue(v)} className="p-0.5 hover:bg-black/20 rounded-md transition-colors ml-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </span>
                    ))}

                    {selectedTopics.map(t => (
                        <span key={t} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg text-xs font-medium bg-gray-700 text-white shadow-sm">
                            {t}
                            <button onClick={() => toggleTopic(t)} className="p-0.5 hover:bg-black/20 rounded-md transition-colors ml-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </span>
                    ))}

                    <button
                        onClick={() => { setSelectedVenues([]); setSelectedTopics([]); }}
                        className="text-xs font-bold text-red-500 hover:text-white hover:bg-red-500 rounded-lg px-2 py-1 transition-colors ml-auto flex items-center gap-1 border border-red-500/30"
                    >
                        Clear All
                    </button>
                </div>
            )}

            {/* Papers */}
            <div className="space-y-12 mt-8">
                {sortedYears.length === 0 ? (
                    <div className="text-center py-12 text-text-muted bg-white rounded-2xl border border-border border-dashed">
                        No publications matched your search criteria.
                    </div>
                ) : (
                    sortedYears.map(year => (
                        <div key={year} className="space-y-6">
                            <h2 className="text-2xl font-bold text-text border-b border-border pb-2">{year}</h2>
                            <div className="space-y-5">
                                {groupedPapers[year].map((paper) => {
                                    const doiUrl = paper.doi ? `https://${paper.doi}` : '';
                                    const paperLink = paper.pdf_url || doiUrl || '#';
                                    const hasVenueTag = !!paper.venueTag;
                                    const isJournalNoConf = paper.type === 'Journal' && !paper.journalConference;

                                    // Use a unique key based on the title and year to ensure proper React reconciliation when filtering
                                    const uniqueKey = `${paper.title}-${year}`;

                                    return (
                                        <div key={uniqueKey} className="bg-white rounded-xl shadow-sm border border-border hover:shadow-lg hover:border-accent/40 transition-all duration-300 relative">
                                            {/* Main card */}
                                            <div onClick={() => window.open(paperLink, '_blank')} className="group flex flex-col md:flex-row gap-5 p-4 relative cursor-pointer">
                                                <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-t-xl"></div>

                                                <div className="w-full md:w-48 shrink-0 bg-transparent rounded-xl flex items-center justify-center relative overflow-visible shadow-md hover:!shadow-2xl hover:scale-[1.5] hover:!z-50 transition-all duration-300 z-20 self-center cursor-zoom-in" onClick={(e) => e.stopPropagation()}>
                                                    {paper.video_url ? (
                                                        paper.video_url.endsWith('.mp4') || paper.video_url.endsWith('.webm') ? (
                                                            <video autoPlay loop muted playsInline preload="none" className="w-full h-auto object-contain rounded-xl">
                                                                <source src={paper.video_url} type={`video/${paper.video_url.split('.').pop()}`} />
                                                            </video>
                                                        ) : (
                                                            <img src={paper.video_url} alt={`Preview for ${paper.title}`} loading="lazy" className="w-full h-auto object-contain rounded-xl" />
                                                        )
                                                    ) : (
                                                        <div className="text-center text-text-muted text-xs font-medium py-8">No preview</div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0 z-30 flex flex-col justify-center">
                                                    <h3 className="text-lg font-bold text-text group-hover:text-accent transition-colors leading-snug">
                                                        {paper.title}
                                                    </h3>
                                                    <p className="text-text-secondary text-sm font-medium mt-1" onClick={(e) => e.stopPropagation()}>
                                                        {renderAuthors(paper.authors, coauthors)}
                                                    </p>

                                                    {/* Venue/Journal tags — clickable */}
                                                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                                        {hasVenueTag ? (
                                                            <VenueTagPill
                                                                tag={paper.venueTag}
                                                                color={venueColors[paper.venueTag]}
                                                                venue={paper.journalConference || paper.venue}
                                                                year={paper.year}
                                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleVenue(paper.venueTag); }}
                                                            />
                                                        ) : isJournalNoConf ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: DEFAULT_VENUE_COLOR }}>
                                                                {paper.year}
                                                            </span>
                                                        ) : (
                                                            <VenueTagPill
                                                                tag={paper.type}
                                                                color={DEFAULT_VENUE_COLOR}
                                                                venue={paper.venue}
                                                                year={paper.year}
                                                            />
                                                        )}
                                                        {/* Journal name — clickable */}
                                                        {paper.type === 'Journal' && paper.venue && (
                                                            <span
                                                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold text-white cursor-pointer hover:scale-110 transition-all z-40"
                                                                style={{ backgroundColor: venueColors[paper.venue] || '#6b7280' }}
                                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleVenue(paper.venue); }}
                                                            >
                                                                {paper.publisher ? `${paper.publisher} · ${paper.venue}` : paper.venue}
                                                            </span>
                                                        )}
                                                        {/* Topic tags — clickable */}
                                                        {paper.topicTags.length > 0 && (
                                                            <>
                                                                <span className="text-text-muted text-[9px] mx-0.5">·</span>
                                                                {paper.topicTags.map((topic, tIdx) => (
                                                                    <span
                                                                        key={tIdx}
                                                                        className="inline-flex items-center px-1 py-px rounded text-[9px] font-medium bg-gray-100 text-text-muted border border-gray-200 whitespace-nowrap cursor-pointer hover:bg-accent hover:text-white hover:border-accent transition-colors"
                                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleTopic(topic); }}
                                                                    >
                                                                        {topic}
                                                                    </span>
                                                                ))}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action buttons — below the card */}
                                            <div className="flex flex-wrap gap-1.5 px-4 py-2.5 border-t border-border/50 bg-gray-50/50 rounded-b-xl">
                                                {paper.pdf_url && (
                                                    <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer" className={btnNormal}>PDF</a>
                                                )}
                                                {doiUrl && (
                                                    <a href={doiUrl} target="_blank" rel="noopener noreferrer" className={btnNormal}>DOI</a>
                                                )}
                                                {paper.video_ext_url && (
                                                    <a href={paper.video_ext_url} target="_blank" rel="noopener noreferrer" className={btnNormal}>Video</a>
                                                )}
                                                {paper.code_url && (
                                                    <a href={paper.code_url} target="_blank" rel="noopener noreferrer" className={btnNormal}>Code</a>
                                                )}
                                                {paper.website_url && (
                                                    <a href={paper.website_url} target="_blank" rel="noopener noreferrer" className={btnNormal}>Website</a>
                                                )}
                                                {paper.bibtex && (
                                                    <button
                                                        className={btnNormal}
                                                        onClick={() => setBibtexModal(paper.bibtex)}
                                                    >BibTeX</button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {bibtexModal && (
                <BibTeXModal bibtex={bibtexModal} onClose={() => setBibtexModal(null)} />
            )}
        </div>
    );
}
