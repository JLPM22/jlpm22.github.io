import Link from 'next/link';
import { readYamlFile } from '@/lib/yaml';
import Particles from '@/components/Particles';

export default async function PapersPage() {
    let papers = [];

    try {
        const papersData = readYamlFile('papers.yaml');
        papers = (papersData?.papers || [])
            .filter(p => p.status === 'published')
            .sort((a, b) => b.year - a.year);
    } catch (e) {
        console.error('Failed to load papers:', e);
    }

    return (
        <>
            <Particles />
            <div className="public-layout">
                <div style={{ marginBottom: '24px' }}>
                    <Link href="/" style={{ fontSize: '0.875rem', color: 'var(--accent)' }}>
                        ← Back
                    </Link>
                </div>

                <header className="public-header" style={{ marginBottom: '48px' }}>
                    <h1 className="public-name">Publications</h1>
                    <p className="public-title">{papers.length} published papers</p>
                </header>

                <div className="papers-list">
                    {papers.map((paper, i) => (
                        <div key={i} className={`paper-card-full type-${paper.type}`}>
                            <div className="paper-card-header">
                                <div className="paper-badges">
                                    <span className={`paper-type-badge type-${paper.type}`}>
                                        {paper.type === 'journal' ? 'Journal' : 'Conference'}
                                    </span>
                                </div>
                                <span className="paper-year">{paper.year}</span>
                            </div>
                            <h3 className="paper-card-title">{paper.title}</h3>
                            <p className="paper-authors">{(paper.authors || []).join(', ')}</p>
                            <p className="paper-venue-row">
                                <span>📰</span>
                                <span>{paper.venue}</span>
                            </p>
                            {paper.doi && (
                                <a
                                    href={paper.doi}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="paper-doi-link"
                                >
                                    View paper →
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
