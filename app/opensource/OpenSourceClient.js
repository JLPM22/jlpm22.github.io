'use client';

import { useState, useEffect } from 'react';

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

export default function OpenSourceClient({ projects = [] }) {
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
            <h1 className="text-4xl font-outfit font-bold mb-10 text-text relative inline-block">
                Open Source
                <div className="absolute -bottom-2 left-0 w-1/3 h-1 bg-accent rounded-full"></div>
            </h1>

            <div className="grid gap-6 md:grid-cols-2">
                {projects.map((project, idx) => {
                    const stats = repoStats[project.repo] || {};
                    const langColor = langColors[project.language] || '#6b7280';

                    return (
                        <a
                            key={idx}
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group bg-white rounded-xl shadow-sm border border-border hover:shadow-lg hover:border-accent/40 transition-all duration-300 p-6 flex flex-col"
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
                                    <span className="ml-auto text-accent text-xs font-medium">
                                        Docs →
                                    </span>
                                )}
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
}
