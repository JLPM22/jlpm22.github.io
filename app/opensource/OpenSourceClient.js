'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';

const langColors = {
    'C#': '#178600',
    'Python': '#3572A5',
    'JavaScript': '#f1e05a',
    'TypeScript': '#3178c6',
    'C++': '#f34b7d',
    'Java': '#b07219',
    'Rust': '#dea584',
    'Go': '#00ADD8',
};

export default function OpenSourceClient({ projects = [], githubUrl }) {
    const [repoStats, setRepoStats] = useState({});

    useEffect(() => {
        // Fetch live stats from GitHub API
        projects.forEach(project => {
            if (!project.repo) return;
            fetch(`https://api.github.com/repos/${project.repo}`)
                .then(res => res.json())
                .then(data => {
                    if (data.stargazers_count !== undefined) {
                        setRepoStats(prev => ({
                            ...prev,
                            [project.repo]: {
                                stars: data.stargazers_count,
                                forks: data.forks_count,
                                watchers: data.subscribers_count,
                                issues: data.open_issues_count,
                                description: data.description,
                            }
                        }));
                    }
                })
                .catch(() => { });
        });
    }, [projects]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            <PageHeader title="Open Source" description="Tools and research software I build and maintain.">
                {githubUrl && (
                    <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-text px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent transition-colors shadow-sm">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                        View GitHub profile
                    </a>
                )}
            </PageHeader>

            <div className="grid gap-6 md:grid-cols-2">
                {projects.map((project, idx) => {
                    const stats = repoStats[project.repo] || {};
                    const langColor = langColors[project.language] || '#6b7280';

                    return (
                        <div
                            key={idx}
                            onClick={() => window.open(project.url, '_blank')}
                            className="group bg-white rounded-xl shadow-sm border border-border hover:shadow-lg hover:border-accent/40 transition-all duration-300 p-6 flex flex-col cursor-pointer"
                        >
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex items-center gap-2 min-w-0">
                                    <svg className="w-5 h-5 text-text-muted shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M3 2.75A2.75 2.75 0 015.75 0h14.5a.75.75 0 01.75.75v20.5a.75.75 0 01-.75.75h-6.07a1.5 1.5 0 01-1.085-.466L10 18.44l-3.09 3.094A1.5 1.5 0 015.825 22H3.75A.75.75 0 013 21.25V2.75z" clipRule="evenodd" />
                                    </svg>
                                    <h2 className="text-lg font-bold text-text group-hover:text-accent transition-colors truncate">
                                        {project.name}
                                    </h2>
                                </div>
                            </div>

                            <p className="text-sm text-text-secondary mb-4 flex-1">
                                {stats.description || project.description}
                            </p>

                            {/* Topics */}
                            {project.topics && project.topics.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {project.topics.map((topic, tIdx) => (
                                        <span key={tIdx} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent/10 text-accent border border-accent/20">
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Stats bar */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted pt-3 border-t border-border/50">
                                {/* Language */}
                                <span className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: langColor }}></span>
                                    {project.language}
                                </span>

                                {/* Stars */}
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                    <span className="font-medium">{stats.stars ?? '—'}</span>
                                </span>

                                {/* Forks */}
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    <span className="font-medium">{stats.forks ?? '—'}</span>
                                </span>


                                {/* Docs link if available */}
                                {project.docs && (
                                    <a
                                        href={project.docs}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="ml-auto text-accent text-xs font-medium hover:text-emerald-500 hover:underline transition-colors"
                                    >
                                        Docs →
                                    </a>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
