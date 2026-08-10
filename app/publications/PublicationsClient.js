'use client';

import { useEffect, useState } from 'react';
import BibTeXModal from '@/components/BibTeXModal';
import PageHeader from '@/components/PageHeader';
import PublicationTopicMap from '@/components/PublicationTopicMap';
import PublicationVenueLine from '@/components/PublicationVenueLine';
import NewPublicationBadge from '@/components/NewPublicationBadge';

const DEFAULT_VENUE_COLOR = '#94a3b8';

// Parse author string and create linked spans
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
                        <a href={coauthor.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline" onClick={(e) => e.stopPropagation()}>{author}</a>{sep}
                    </span>
                );
            }
        }

        return <span key={i}>{prefix}{author}{sep}</span>;
    });
}

function VenueTagPill({ tag, color, venue, year, onClick }) {
    const bgColor = color || DEFAULT_VENUE_COLOR;
    const tooltipText = venue || tag;
    return (
        <span
            className="relative inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide text-text-secondary bg-white border border-border border-l-[3px] cursor-pointer group/pill hover:text-text transition-colors z-40"
            style={{ borderLeftColor: bgColor }}
            title={tooltipText}
            onClick={onClick}
        >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: bgColor }} aria-hidden="true"></span>
            {tag}
            {year != null && <span className="ml-1 opacity-80">'{String(year).slice(-2)}</span>}
            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gray-900/95 backdrop-blur-sm whitespace-nowrap opacity-0 group-hover/pill:opacity-100 transition-opacity duration-200 shadow-lg z-[100]">
                {tooltipText}
                <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-900/95"></span>
            </span>
        </span>
    );
}



export default function PublicationsClient({ initialPapers, venueColors = {}, allVenueTags = [], allJournalNames = [], allTopicTags = [], coauthors = {}, selectedPaperTitles = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVenues, setSelectedVenues] = useState([]);
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [showVenueFilter, setShowVenueFilter] = useState(false);
    const [showTopicFilter, setShowTopicFilter] = useState(false);
    const [showMetrics, setShowMetrics] = useState(false);
    const [metricsNotice, setMetricsNotice] = useState(null);
    const [expandedSummaries, setExpandedSummaries] = useState([]);
    const [bibtexModal, setBibtexModal] = useState(null);
    const [viewMode, setViewMode] = useState('all');

    useEffect(() => {
        if (window.location.hash === '#topic-map') setViewMode('topics');
        if (window.location.hash === '#selected') setViewMode('selected');
    }, []);

    useEffect(() => {
        if (!metricsNotice) return;
        const timeout = window.setTimeout(() => setMetricsNotice(null), 1300);
        return () => window.clearTimeout(timeout);
    }, [metricsNotice]);

    const selectView = (view) => {
        setViewMode(view);
        const hash = view === 'topics' ? '#topic-map' : view === 'selected' ? '#selected' : window.location.pathname;
        window.history.replaceState(null, '', hash);
    };

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

    const toggleMetrics = () => {
        const nextValue = !showMetrics;
        setShowMetrics(nextValue);
        setMetricsNotice({ id: Date.now(), enabled: nextValue, label: `Metrics ${nextValue ? 'on' : 'off'}` });
    };

    const toggleSummary = (title) => {
        setExpandedSummaries(prev => prev.includes(title) ? prev.filter(item => item !== title) : [...prev, title]);
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

    const selectedPaperSet = new Set(selectedPaperTitles);
    const filteredPapers = initialPapers.filter(paper => {
        if (viewMode === 'selected' && !selectedPaperSet.has(paper.title)) return false;
        return isSearchMatch(paper, searchTerm) &&
            isVenueMatch(paper, selectedVenues) &&
            isTopicMatch(paper, selectedTopics);
    });

    const venueCounts = {};
    allVenueOptions.forEach(v => venueCounts[v] = 0);
    initialPapers.filter(paper => isSearchMatch(paper, searchTerm) && isTopicMatch(paper, selectedTopics))
        .forEach(paper => {
            if (paper.venueTag && venueCounts[paper.venueTag] !== undefined) venueCounts[paper.venueTag]++;
            if (paper.type === 'Journal' && paper.venue && venueCounts[paper.venue] !== undefined) venueCounts[paper.venue]++;
        });

    const topicCounts = {};
    allTopicTags.forEach(t => topicCounts[t] = 0);
    initialPapers.filter(paper => isSearchMatch(paper, searchTerm) && isVenueMatch(paper, selectedVenues))
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

    const btnBase = "inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-full transition-colors border";
    const btnNormal = `${btnBase} bg-white text-text-secondary border-border hover:bg-accent hover:text-white hover:border-accent`;
    const btnSummary = `${btnBase} border-accent/30 bg-accent/[0.07] text-accent shadow-sm hover:border-accent hover:bg-accent hover:text-white sm:hidden`;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader title="Publications" description="Peer-reviewed research papers and accompanying resources." className="!mb-3 sm:!mb-10 lg:!mb-4" childrenClassName="hidden lg:block">
                <div data-particle-exclusion className="relative">
                    <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="11" cy="11" r="7" strokeWidth="1.8" />
                        <path strokeLinecap="round" strokeWidth="1.8" d="M16.5 16.5L21 21" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search papers..."
                        aria-label="Search publications"
                        className="w-64 rounded-full border border-border bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm transition-colors focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </PageHeader>

            <div data-particle-exclusion className="mb-3 rounded-2xl border border-border bg-white/70 shadow-sm sm:mb-4 lg:flex lg:items-center lg:gap-3 lg:p-2.5">
                <div className="flex flex-col gap-2 p-2 sm:gap-3 sm:p-2.5 lg:contents">
                    <div className="grid grid-cols-3 self-stretch rounded-xl bg-bg-subtle p-1 sm:inline-flex sm:self-start lg:justify-self-start" role="tablist" aria-label="Publication views">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'selected', label: 'Selected' },
                        { id: 'topics', label: 'Topic Map' },
                    ].map(view => (
                        <button key={view.id} role="tab" aria-selected={viewMode === view.id} onClick={() => selectView(view.id)} className={`rounded-lg px-2 py-1.5 text-xs font-semibold transition-all sm:px-3.5 sm:py-2 sm:text-sm ${viewMode === view.id ? 'bg-white text-accent shadow-sm' : 'text-text-secondary hover:text-text'}`}>
                            {view.id === 'topics' && <svg className="mr-1 inline-block h-3.5 w-3.5 -mt-0.5 sm:mr-1.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M7 11l9-4M7 13l9 4"/></svg>}
                            {view.label}
                        </button>
                    ))}
                    </div>

                    <div className="w-full lg:hidden">
                        <input
                            type="text"
                            placeholder="Search papers..."
                            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 sm:rounded-xl sm:px-4 sm:py-2.5 lg:w-56"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-0.5 border-t border-border/50 p-0.5 sm:gap-4 sm:p-2 lg:ml-auto lg:gap-1 lg:border-0 lg:p-0">
                <button
                    onClick={() => setShowVenueFilter(!showVenueFilter)}
                    className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-1.5 py-1 text-[11px] font-medium transition-colors sm:flex-none sm:justify-start sm:gap-1.5 sm:px-3 sm:py-2 sm:text-sm ${showVenueFilter ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-accent hover:bg-black/5'}`}
                >
                    <svg className={`h-3.5 w-3.5 transition-transform sm:h-4 sm:w-4 ${showVenueFilter ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="sm:hidden">Venue</span><span className="hidden sm:inline">Filter by Venue</span>
                </button>

                <button
                    onClick={() => setShowTopicFilter(!showTopicFilter)}
                    className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-1.5 py-1 text-[11px] font-medium transition-colors sm:flex-none sm:justify-start sm:gap-1.5 sm:px-3 sm:py-2 sm:text-sm ${showTopicFilter ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-accent hover:bg-black/5'}`}
                >
                    <svg className={`h-3.5 w-3.5 transition-transform sm:h-4 sm:w-4 ${showTopicFilter ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="sm:hidden">Topics</span><span className="hidden sm:inline">Filter by Topic</span>
                </button>
                {viewMode !== 'topics' && (
                    <button
                        type="button"
                        aria-label={showMetrics ? 'Hide academic metrics' : 'Show academic metrics'}
                        aria-pressed={showMetrics}
                        title={showMetrics ? 'Hide academic metrics' : 'Show academic metrics'}
                        onClick={toggleMetrics}
                        className={`relative ml-auto flex h-7 w-7 shrink-0 items-center justify-center overflow-visible rounded-lg transition-colors sm:h-8 sm:w-8 ${showMetrics ? 'bg-accent/10 text-accent' : 'text-text-muted/60 hover:bg-black/5 hover:text-text-secondary'}`}
                    >
                        {metricsNotice && (
                            <span key={metricsNotice.id} className={`metrics-particle pointer-events-none absolute bottom-full right-0 z-20 mb-0.5 whitespace-nowrap text-[9px] font-semibold tracking-wide ${metricsNotice.enabled ? 'text-accent' : 'text-text-muted'}`} aria-hidden="true">
                                {metricsNotice.label}
                            </span>
                        )}
                        {showMetrics ? (
                            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        ) : (
                            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                )}
                </div>
            </div>



            {/* Venue Filter chips */}
            {showVenueFilter && (
                <div data-particle-exclusion className="mb-3 flex max-h-44 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-border bg-white p-2.5 shadow-sm sm:mb-4 sm:max-h-none sm:gap-2 sm:overflow-visible sm:p-4">
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
                                style={isActive ? { backgroundColor: color || DEFAULT_VENUE_COLOR } : {}}
                            >
                                <span
                                    className={`mr-0.5 h-1.5 w-1.5 shrink-0 rounded-full ring-1 ${isActive ? 'ring-white/80' : 'ring-black/10'}`}
                                    style={{ backgroundColor: color || DEFAULT_VENUE_COLOR }}
                                    aria-hidden="true"
                                />
                                {displayName} <span className={`text-[10px] ${isActive ? 'text-white/80' : isDisabled ? 'text-gray-400' : 'text-text-muted/60'}`}>({count})</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Topic Filter chips */}
            {showTopicFilter && (
                <div data-particle-exclusion className="mb-3 flex max-h-44 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-border bg-white p-2.5 shadow-sm sm:mb-4 sm:max-h-none sm:gap-2 sm:overflow-visible sm:p-4">
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
                <div data-particle-exclusion className="mb-3 flex flex-wrap items-center gap-1.5 rounded-xl border border-accent/20 bg-accent/5 p-2 shadow-inner sm:mb-4 sm:gap-2 sm:p-3">
                    <span className="mr-1 text-xs font-bold uppercase tracking-wider text-accent sm:mr-3"><span className="sm:hidden">Active:</span><span className="hidden sm:inline">Active Filters:</span></span>

                    {selectedVenues.map(v => (
                        <span key={v} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg text-xs font-medium text-white shadow-sm" style={{ backgroundColor: venueColors[v] || DEFAULT_VENUE_COLOR }}>
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

            {viewMode === 'topics' ? (
                <PublicationTopicMap papers={initialPapers} activePapers={filteredPapers} venueColors={venueColors} />
            ) : <div className="space-y-12 mt-8">
                {sortedYears.length === 0 ? (
                    <div className="text-center py-12 text-text-muted bg-white rounded-2xl border border-border border-dashed">
                        No publications matched your search criteria.
                    </div>
                ) : (
                    sortedYears.map(year => (
                        <div key={year} className="space-y-6">
                            <h2 className="flex items-center border-b border-border pb-2 text-2xl font-bold leading-none text-text">
                                <span className="leading-none">{year}</span>
                                {viewMode === 'selected' && (
                                    <span className="ml-auto inline-flex items-center gap-1 text-[8px] font-bold uppercase leading-none tracking-[0.16em] text-text-muted sm:text-[9px]">
                                        <svg className="h-3 w-3 text-text-muted/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M6.75 4.75A1.75 1.75 0 018.5 3h7a1.75 1.75 0 011.75 1.75V21L12 17.75 6.75 21V4.75z" />
                                        </svg>
                                        Selected
                                    </span>
                                )}
                            </h2>
                            <div className="space-y-5">
                                {groupedPapers[year].map((paper) => {
                                    const doiUrl = paper.doi ? `https://${paper.doi}` : '';
                                    const paperLink = paper.pdf_url || doiUrl || '#';
                                    const hasVenueTag = !!paper.venueTag;
                                    const isJournalNoConf = paper.type === 'Journal' && !paper.journalConference;

                                    // Use a unique key based on the title and year to ensure proper React reconciliation when filtering
                                    const uniqueKey = `${paper.title}-${year}`;
                                    const titleSize = paper.title.length > 95 ? 'text-[15px]' : paper.title.length > 64 ? 'text-base' : 'text-lg';
                                    const topicLength = paper.topicTags.join(' · ').length;
                                    const topicSize = topicLength > 52 ? 'text-[9px]' : topicLength > 36 ? 'text-[10px]' : 'text-[11px]';
                                    const authorSize = paper.authors.length > 145 ? 'text-[10px]' : paper.authors.length > 105 ? 'text-xs' : 'text-sm';

                                    return (
                                        <article key={uniqueKey} className="bg-white rounded-2xl shadow-sm border border-border hover:shadow-card hover:border-accent/40 transition-all duration-300 relative overflow-visible">
                                            <NewPublicationBadge year={paper.year} month={paper.month} className="absolute right-3 top-3 z-40 md:hidden" />
                                            {/* Main card */}
                                            <div onClick={() => window.open(paperLink, '_blank')} className="group flex flex-col md:flex-row gap-4 p-4 relative cursor-pointer rounded-t-2xl">
                                                <div className="absolute inset-0 bg-gradient-to-r from-accent/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-t-2xl"></div>

                                                <div className="w-full md:w-44 shrink-0 bg-bg-subtle rounded-xl flex items-center justify-center relative overflow-hidden shadow-sm ring-1 ring-black/5 md:hover:shadow-lg md:hover:scale-[1.04] transition-all duration-500 ease-out z-20 self-center" onClick={(e) => e.stopPropagation()}>
                                                    {paper.video_url ? (
                                                        paper.video_url.endsWith('.mp4') || paper.video_url.endsWith('.webm') ? (
                                                            <video autoPlay loop muted playsInline preload="metadata" className="w-full h-auto object-contain rounded-xl">
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
                                                    <div className="mb-1.5 flex min-w-0 items-start justify-between gap-3">
                                                        <PublicationVenueLine paper={paper} venueColors={venueColors} onVenueClick={toggleVenue} />
                                                        <NewPublicationBadge year={paper.year} month={paper.month} className="hidden md:inline-flex" />
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <h3 className={`${titleSize} font-outfit font-bold text-text group-hover:text-accent transition-colors leading-snug flex-1`}>
                                                            {paper.title}
                                                        </h3>
                                                    </div>
                                                    <p className={`text-text-secondary ${authorSize} mt-1.5 leading-snug [text-wrap:pretty]`} onClick={(e) => e.stopPropagation()}>
                                                        {renderAuthors(paper.authors, coauthors)}
                                                    </p>
                                                    {paper.summary && (
                                                        <>
                                                            {expandedSummaries.includes(paper.title) && (
                                                                <div className="mt-2 rounded-r-lg border-l-2 border-accent/30 bg-accent/[0.035] px-3 py-2 sm:hidden" onClick={(e) => e.stopPropagation()}>
                                                                    <p className="text-[11px] leading-relaxed text-text-secondary/75">
                                                                        {paper.summary}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            <div className="mt-1.5 hidden min-w-0 items-start gap-1.5 opacity-75 transition-opacity group-hover:opacity-100 sm:flex">
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

                                                    {paper.awards?.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                                                            {paper.awards.map(award => (
                                                                <a key={award.name} href={award.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors" title={award.name}>
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 21h8m-4-4v4M7 4h10v4a5 5 0 01-10 0V4zm0 2H4v1a4 4 0 004 4m9-5h3v1a4 4 0 01-4 4" /></svg>
                                                                    {award.name}{award.entity ? ` · ${award.entity}` : ''}<span aria-hidden="true">↗</span>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Conditional Metrics Display */}
                                                    {showMetrics && paper.metrics && (paper.metrics.jcrQuartile || paper.metrics.sjrQuartile || paper.metrics.ggsRating || paper.metrics.coreRating) && (
                                                        <div className="flex flex-wrap items-center gap-1.5 mt-2" onClick={(e) => e.stopPropagation()}>
                                                            {paper.metrics.jcrQuartile && (
                                                                <span className="inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded bg-black/5 text-text-secondary border border-black/10 transition-colors hover:bg-black/10 hover:text-text">
                                                                    JCR <span className="font-bold">{paper.metrics.jcrQuartile}</span>
                                                                    {paper.metrics.jcrIf && <span className="opacity-70 mx-0.5">• IF {paper.metrics.jcrIf}</span>}
                                                                    {paper.metrics.jcrRank && <span className="opacity-60">{paper.metrics.jcrRank}</span>}
                                                                </span>
                                                            )}
                                                            {paper.metrics.sjrQuartile && (
                                                                <span className="inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded bg-black/5 text-text-secondary border border-black/10 transition-colors hover:bg-black/10 hover:text-text">
                                                                    SJR <span className="font-bold">{paper.metrics.sjrQuartile}</span>
                                                                    {paper.metrics.sjrIf && <span className="opacity-70 mx-0.5">• IF {paper.metrics.sjrIf}</span>}
                                                                </span>
                                                            )}
                                                            {paper.metrics.ggsRating && (
                                                                <span className="inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded bg-black/5 text-text-secondary border border-black/10 transition-colors hover:bg-black/10 hover:text-text">
                                                                    GGS <span className="font-bold">{paper.metrics.ggsRating}</span>
                                                                </span>
                                                            )}
                                                            {paper.metrics.coreRating && (
                                                                <span className="inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded bg-black/5 text-text-secondary border border-black/10 transition-colors hover:bg-black/10 hover:text-text">
                                                                    CORE <span className="font-bold">{paper.metrics.coreRating}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action buttons — below the card */}
                                            <div className="flex flex-wrap items-center justify-center gap-2 px-5 py-3 border-t border-border/60 bg-bg-subtle/50 rounded-b-2xl sm:justify-start">
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
                                                {paper.summary && (
                                                    <button
                                                        type="button"
                                                        className={btnSummary}
                                                        aria-expanded={expandedSummaries.includes(paper.title)}
                                                        onClick={() => toggleSummary(paper.title)}
                                                    >TL;DR</button>
                                                )}
                                                {paper.topicTags.length > 0 && (
                                                    <div className={`no-scrollbar mt-1 flex min-w-0 w-full basis-full flex-wrap items-center justify-center gap-1.5 border-t border-border/60 pt-2.5 whitespace-normal text-center font-medium normal-case tracking-normal text-text-muted sm:ml-auto sm:mt-0 sm:w-auto sm:max-w-[60%] sm:basis-auto sm:flex-nowrap sm:justify-end sm:overflow-x-auto sm:border-0 sm:pt-0 sm:whitespace-nowrap sm:text-right sm:font-semibold sm:uppercase sm:tracking-wide ${topicSize}`} onClick={(e) => e.stopPropagation()}>
                                                        <svg className="h-3 w-3 shrink-0 text-accent/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M20 13l-7 7-9-9V4h7l9 9zM8 8h.01" />
                                                        </svg>
                                                        {paper.topicTags.map((topic, index) => (
                                                            <span key={topic} className="inline-flex items-center">
                                                                <button type="button" className="transition-colors hover:text-accent" onClick={() => toggleTopic(topic)}>{topic}</button>
                                                                {index < paper.topicTags.length - 1 && <span className="ml-1.5 text-border">·</span>}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </article>
                                    )
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>}

            {bibtexModal && (
                <BibTeXModal bibtex={bibtexModal} onClose={() => setBibtexModal(null)} />
            )}
        </div>
    );
}
