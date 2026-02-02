'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Particles from '@/components/Particles';

export default function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', emoji: '📁' });

    const emojis = ['📁', '🎓', '📚', '🔬', '💻', '🎨', '🚀', '⚡', '🌟', '🎯', '📝', '🧪', '🤖', '🧠', '💡'];

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            const data = await res.json();
            setProjects(data.projects || []);
        } catch (e) {
            console.error('Failed to fetch projects:', e);
        } finally {
            setLoading(false);
        }
    };

    const createProject = async () => {
        if (!newProject.name.trim()) return;

        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProject)
            });
            const project = await res.json();
            setProjects(prev => [...prev, project]);
            setShowModal(false);
            setNewProject({ name: '', emoji: '📁' });
        } catch (e) {
            console.error('Failed to create project:', e);
        }
    };

    const getTaskStats = (project) => {
        const tasks = project.tasks || [];
        const done = tasks.filter(t => t.status === 'done').length;
        return { total: tasks.length, done };
    };

    return (
        <div className="flex min-h-screen relative bg-bg">
            <Particles />
            <Sidebar />
            <main className="ml-0 md:ml-64 flex-1 p-6 md:p-10 max-w-5xl relative z-1">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-1 text-text">Projects</h1>
                    <p className="text-text-secondary">{projects.length} projects</p>
                </div>

                {loading ? (
                    <p className="text-text-muted">Loading projects...</p>
                ) : (
                    <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
                        <button
                            className="flex flex-col items-center justify-center min-h-[180px] border-2 border-dashed border-border bg-transparent cursor-pointer rounded-xl transition-all hover:border-accent hover:bg-accent-glow group"
                            onClick={() => setShowModal(true)}
                        >
                            <div className="text-4xl text-text-muted mb-2 transition-colors group-hover:text-accent">+</div>
                            <span className="text-sm font-medium text-text-muted group-hover:text-accent">New Project</span>
                        </button>
                        {projects.map(project => {
                            const stats = getTaskStats(project);
                            return (
                                <Link
                                    key={project.id}
                                    href={`/projects/${project.id}`}
                                    className="bg-bg-card border border-border rounded-xl p-5 transition-all duration-200 no-underline block hover:-translate-y-0.5 hover:shadow-glow hover:border-border-glow"
                                >
                                    <div className="text-3xl mb-3">{project.emoji}</div>
                                    <h3 className="text-lg font-semibold mb-2 text-text">{project.name}</h3>
                                    {project.summary && (
                                        <p className="text-sm text-text-secondary leading-relaxed mb-4 line-clamp-2">{project.summary}</p>
                                    )}
                                    <div className="flex gap-4 text-xs text-text-muted">
                                        <span>☐ {stats.done}/{stats.total} tasks</span>
                                        <span>📝 {(project.notes || []).length} notes</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="bg-bg-card rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center px-6 py-4 border-b border-border">
                            <h3 className="text-lg font-semibold text-text">New Project</h3>
                            <button className="bg-transparent border-none text-2xl text-text-muted cursor-pointer transition-colors hover:text-text" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2 text-text-secondary">Project Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-bg-card text-text transition-all focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent-glow"
                                    placeholder="e.g., PhD Research"
                                    value={newProject.name}
                                    onChange={e => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                                    autoFocus
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2 text-text-secondary">Emoji</label>
                                <div className="flex flex-wrap gap-2">
                                    {emojis.map(emoji => (
                                        <button
                                            key={emoji}
                                            className={`w-10 h-10 text-xl border-2 border-transparent rounded-lg cursor-pointer transition-all hover:bg-accent-glow ${newProject.emoji === emoji ? 'border-accent bg-accent-glow' : 'bg-bg-subtle'
                                                }`}
                                            onClick={() => setNewProject(prev => ({ ...prev, emoji }))}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                className="w-full mt-4 flex items-center justify-center px-4 py-2.5 rounded-lg font-medium text-sm text-white transition-all shadow-glow hover:-translate-y-0.5 hover:shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-primary"
                                onClick={createProject}
                                disabled={!newProject.name.trim()}
                            >
                                Create Project
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
