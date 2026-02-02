'use client';

import { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import Particles from '@/components/Particles';

export default function ManagePapersPage() {
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ type: 'all', year: 'all', search: '' });

    useEffect(() => {
        fetchPapers();
    }, []);

    const fetchPapers = async () => {
        try {
            const res = await fetch('/api/papers');
            const data = await res.json();
            setPapers(data.papers || []);
        } catch (e) {
            console.error('Failed to fetch papers:', e);
        } finally {
            setLoading(false);
        }
    };

    const years = useMemo(() => {
        const uniqueYears = [...new Set(papers.map(p => p.year))].sort((a, b) => b - a);
        return uniqueYears;
    }, [papers]);

    const filteredPapers = useMemo(() => {
        let result = [...papers];

        // Type filter
        if (filter.type !== 'all') {
            result = result.filter(p => p.type === filter.type);
        }

        // Year filter
        if (filter.year !== 'all') {
            result = result.filter(p => p.year === parseInt(filter.year));
        }

        // Search filter
        if (filter.search) {
            const search = filter.search.toLowerCase();
            result = result.filter(p =>
                p.title?.toLowerCase().includes(search) ||
                p.authors?.join(' ').toLowerCase().includes(search) ||
                p.venue?.toLowerCase().includes(search)
            );
        }

        // Sort by year (newest first)
        result.sort((a, b) => b.year - a.year);

        return result;
    }, [papers, filter]);

    const journalCount = papers.filter(p => p.type === 'journal').length;
    const conferenceCount = papers.filter(p => p.type === 'conference').length;

    return (
        <div className="flex min-h-screen relative bg-bg">
            <Particles />
            <Sidebar />
            <main className="ml-0 md:ml-64 flex-1 p-6 md:p-10 max-w-5xl relative z-1">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-1 text-text">Papers</h1>
                    <p className="text-text-secondary">
                        {papers.length} papers · {journalCount} journals · {conferenceCount} conferences
                    </p>
                </div>

                <div className="bg-bg-card border border-border rounded-xl p-5 mb-8 shadow-sm">
                    <div className="relative mb-5">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">🔍</span>
                        <input
                            type="text"
                            placeholder="Search papers by title, author, venue..."
                            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm bg-bg-subtle text-text transition-all focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent-glow"
                            value={filter.search}
                            onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                        />
                    </div>

                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div className="flex gap-2 flex-wrap">
                            <button
                                className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all border ${filter.type === 'all'
                                    ? 'border-transparent bg-gradient-primary text-white shadow-glow'
                                    : 'border-border bg-white text-text-secondary hover:border-accent hover:text-text'
                                    }`}
                                onClick={() => setFilter(prev => ({ ...prev, type: 'all' }))}
                            >
                                All ({papers.length})
                            </button>
                            <button
                                className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all border ${filter.type === 'journal'
                                    ? 'border-transparent bg-gradient-primary text-white shadow-glow'
                                    : 'border-border bg-white text-text-secondary hover:border-accent hover:text-text'
                                    }`}
                                onClick={() => setFilter(prev => ({ ...prev, type: 'journal' }))}
                            >
                                Journal ({journalCount})
                            </button>
                            <button
                                className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all border ${filter.type === 'conference'
                                    ? 'border-transparent bg-gradient-primary text-white shadow-glow'
                                    : 'border-border bg-white text-text-secondary hover:border-accent hover:text-text'
                                    }`}
                                onClick={() => setFilter(prev => ({ ...prev, type: 'conference' }))}
                            >
                                Conference ({conferenceCount})
                            </button>
                        </div>

                        <select
                            className="px-4 py-2 border border-border rounded-lg text-sm bg-white text-text-secondary cursor-pointer hover:border-accent focus:outline-none focus:border-accent"
                            value={filter.year}
                            onChange={(e) => setFilter(prev => ({ ...prev, year: e.target.value }))}
                        >
                            <option value="all">All Years</option>
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <p className="text-text-muted">Loading papers...</p>
                ) : filteredPapers.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {filteredPapers.map((paper, i) => (
                            <PaperCard key={i} paper={paper} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-text-muted">
                        <p>No papers found</p>
                    </div>
                )}
            </main>
        </div>
    );
}

function PaperCard({ paper }) {
    const isJournal = paper.type === 'journal';
    const isPublished = paper.status === 'published';

    // Build venue info
    let venueInfo = paper.venue || '';
    if (paper.publisher) venueInfo += venueInfo ? ` (${paper.publisher})` : paper.publisher;

    // Build metrics for journals
    const metrics = [];
    if (paper.quartile) {
        let qColor = 'bg-gray-100 text-gray-700';
        if (paper.quartile === 'Q1') qColor = 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (paper.quartile === 'Q2') qColor = 'bg-blue-100 text-blue-700 border-blue-200';
        if (paper.quartile === 'Q3') qColor = 'bg-yellow-100 text-yellow-700 border-yellow-200';
        if (paper.quartile === 'Q4') qColor = 'bg-orange-100 text-orange-700 border-orange-200';

        metrics.push(
            <span key="q" className={`text-xs font-bold px-2 py-0.5 rounded border ${qColor}`}>
                {paper.quartile}
            </span>
        );
    }
    if (paper.impact_factor) {
        metrics.push(<span key="if" className="text-xs text-text-secondary bg-bg-subtle px-2 py-0.5 rounded border border-border">IF: {paper.impact_factor}</span>);
    }
    if (paper.ranking) {
        metrics.push(<span key="rank" className="text-xs text-text-secondary bg-bg-subtle px-2 py-0.5 rounded border border-border">Rank: {paper.ranking}</span>);
    }
    if (paper.category) {
        metrics.push(<span key="cat" className="text-xs text-text-secondary bg-bg-subtle px-2 py-0.5 rounded border border-border">{paper.category}</span>);
    }

    // Build ratings for conferences
    const ratings = [];
    if (paper.ggs_rating) {
        let ggsColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (paper.ggs_rating.includes('A')) ggsColor = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
        ratings.push(<span key="ggs" className={`text-xs px-2 py-0.5 rounded border ${ggsColor}`}>GGS: {paper.ggs_rating}</span>);
    }
    if (paper.core_rating) {
        let coreColor = 'bg-blue-50 text-blue-700 border-blue-200';
        if (paper.core_rating.includes('A')) coreColor = 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
        ratings.push(<span key="core" className={`text-xs px-2 py-0.5 rounded border ${coreColor}`}>CORE: {paper.core_rating}</span>);
    }
    if (paper.location) {
        ratings.push(<span key="loc" className="text-xs text-text-secondary">📍 {paper.location}</span>);
    }

    return (
        <div className={`bg-white border rounded-xl p-6 transition-all hover:shadow-card hover:border-accent/30 relative overflow-hidden group ${isJournal ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-purple-500' // Visual distinction
            }`} style={{ borderRightColor: '#e2ebe6', borderTopColor: '#e2ebe6', borderBottomColor: '#e2ebe6' }}>

            <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2 items-center">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md ${isJournal ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                        }`}>
                        {isJournal ? 'Journal' : 'Conference'}
                    </span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md ${isPublished ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                        {isPublished ? '✓ Published' : '⏳ In Progress'}
                    </span>
                </div>
                <span className="text-sm font-bold text-text-muted bg-bg-subtle px-2 py-1 rounded">{paper.year}</span>
            </div>

            <h4 className="text-lg font-bold text-text mb-2 group-hover:text-accent transition-colors">{paper.title}</h4>
            <p className="text-sm text-text-secondary mb-3 leading-relaxed">{(paper.authors || []).join(', ')}</p>

            <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                <span>📰</span>
                <span className="font-medium">{venueInfo || 'Venue TBD'}</span>
            </div>

            {paper.conference && (
                <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
                    <span>🎤</span>
                    <span>{paper.conference}</span>
                </div>
            )}

            {(metrics.length > 0 || ratings.length > 0) && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
                    {metrics}
                    {ratings}
                </div>
            )}

            {paper.doi && (
                <a
                    href={paper.doi}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg hover:-translate-y-0.5"
                >
                    View Paper →
                </a>
            )}
        </div>
    );
}
