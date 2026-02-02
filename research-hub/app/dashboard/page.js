'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Particles from '@/components/Particles';
import { parseMarkdown, isOverdue, triggerConfetti } from '@/lib/utils';

export default function DashboardPage() {
    const [projects, setProjects] = useState([]);
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/projects').then(r => r.json()),
            fetch('/api/papers').then(r => r.json())
        ]).then(([projectsData, papersData]) => {
            setProjects(projectsData.projects || []);
            setPapers(papersData.papers || []);
        }).catch(e => console.error('Failed to load data:', e))
            .finally(() => setLoading(false));
    }, []);

    // Flatten all tasks from all projects
    const allTasks = projects.flatMap(project =>
        (project.tasks || []).map(task => ({
            ...task,
            projectId: project.id,
            projectName: project.name,
            projectColor: project.color || '#10b981'
        }))
    );

    // Flatten all notes from all projects
    const allNotes = projects.flatMap(project =>
        (project.notes || []).map(note => ({
            ...note,
            projectId: project.id,
            projectName: project.name,
            projectEmoji: project.emoji
        }))
    ).sort((a, b) => new Date(b.date) - new Date(a.date));

    const activeTasks = allTasks.filter(t => t.status !== 'done');
    const overdueTasks = activeTasks.filter(t => isOverdue(t.due_date));
    const upcomingTasks = activeTasks
        .sort((a, b) => {
            const aOverdue = isOverdue(a.due_date);
            const bOverdue = isOverdue(b.due_date);
            if (aOverdue && !bOverdue) return -1;
            if (!aOverdue && bOverdue) return 1;
            if (a.due_date && !b.due_date) return -1;
            if (!a.due_date && b.due_date) return 1;
            if (!a.due_date && !b.due_date) return 0;
            return new Date(a.due_date) - new Date(b.due_date);
        })
        .slice(0, 5);

    const publishedPapers = papers.filter(p => p.status === 'published').length;

    const toggleTask = async (projectId, taskId, e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const project = projects.find(p => p.id === projectId);
        const task = project?.tasks?.find(t => t.id === taskId);
        const willComplete = task?.status !== 'done';

        // Optimistic update
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                return {
                    ...p,
                    tasks: p.tasks.map(t =>
                        t.id === taskId ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t
                    )
                };
            }
            return p;
        }));

        if (willComplete) {
            triggerConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }

        try {
            await fetch(`/api/projects/${projectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ toggleTask: taskId })
            });
        } catch (e) {
            console.error('Failed to update task:', e);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen relative bg-bg">
                <Particles />
                <Sidebar />
                <main className="ml-64 flex-1 p-10 max-w-5xl">
                    <p className="text-text-muted">Loading...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen relative bg-bg">
            <Particles />
            <Sidebar />
            <main className="ml-0 md:ml-64 flex-1 p-6 md:p-10 max-w-5xl relative z-1">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-1 text-text">Dashboard</h1>
                    <p className="text-text-secondary">Welcome back! Here&apos;s your research overview.</p>
                </div>

                <div className="grid gap-4 mb-10 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
                    <Link href="/manage-papers" className="bg-bg-card border border-border rounded-xl p-5 transition-all duration-200 block no-underline hover:-translate-y-0.5 hover:shadow-glow hover:border-border-glow cursor-pointer">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-3 bg-accent-glow">📄</div>
                        <div className="text-2xl font-bold text-text">{publishedPapers}</div>
                        <div className="text-sm mt-1 text-text-muted">Published Papers</div>
                    </Link>
                    <Link href="/projects" className="bg-bg-card border border-border rounded-xl p-5 transition-all duration-200 block no-underline hover:-translate-y-0.5 hover:shadow-glow hover:border-border-glow cursor-pointer">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-3 bg-accent-glow">📁</div>
                        <div className="text-2xl font-bold text-text">{projects.length}</div>
                        <div className="text-sm mt-1 text-text-muted">Projects</div>
                    </Link>
                    <Link href="/projects" className="bg-bg-card border border-border rounded-xl p-5 transition-all duration-200 block no-underline hover:-translate-y-0.5 hover:shadow-glow hover:border-border-glow cursor-pointer">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-3 bg-accent-glow">☐</div>
                        <div className="text-2xl font-bold text-text">{activeTasks.length}</div>
                        <div className="text-sm mt-1 text-text-muted">Active Tasks</div>
                    </Link>
                    {overdueTasks.length > 0 && (
                        <Link href="/projects" className="bg-bg-card border border-danger rounded-xl p-5 transition-all duration-200 block no-underline hover:-translate-y-0.5 hover:shadow-glow hover:border-border-glow cursor-pointer">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-3 bg-accent-glow">⚠️</div>
                            <div className="text-2xl font-bold text-danger">{overdueTasks.length}</div>
                            <div className="text-sm mt-1 text-text-muted">Overdue</div>
                        </Link>
                    )}
                </div>

                <div className="bg-bg-card border border-border rounded-xl overflow-hidden shadow-card mb-8">
                    <div className="flex justify-between items-center px-5 py-4 border-b border-border">
                        <h3 className="text-base font-semibold text-text">
                            {overdueTasks.length > 0 ? '⚠️ Attention Needed' : 'Upcoming Tasks'}
                        </h3>
                        <Link href="/projects" className="text-sm text-accent hover:text-accent-dark no-underline">
                            View projects →
                        </Link>
                    </div>
                    <div>
                        {upcomingTasks.length > 0 ? (
                            <div className="flex flex-col gap-2 p-5">
                                {upcomingTasks.map((task, i) => {
                                    const taskOverdue = isOverdue(task.due_date);
                                    return (
                                        <Link
                                            key={i}
                                            href={`/projects/${task.projectId}?tab=tasks&task=${task.id}`}
                                            className={`flex items-start gap-3 p-3 rounded-lg border border-transparent transition-all hover:bg-bg-subtle hover:border-border-glow no-underline cursor-pointer ${taskOverdue ? 'bg-red-50 border-red-200' : ''}`}
                                        >
                                            <div
                                                className={`w-5 h-5 rounded border-2 cursor-pointer flex-shrink-0 mt-0.5 transition-all flex items-center justify-center ${task.status === 'done'
                                                    ? 'border-transparent bg-gradient-primary'
                                                    : 'border-border hover:border-accent'
                                                    }`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    toggleTask(task.projectId, task.id, e);
                                                }}
                                            >
                                                {task.status === 'done' && <span className="text-white text-xs">✓</span>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-text">{task.title}</div>
                                                <div className="flex gap-3 mt-1 text-xs text-text-muted">
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="w-2 h-2 rounded-full" style={{ background: task.projectColor }} />
                                                        {task.projectName}
                                                    </span>
                                                    {task.due_date && (
                                                        <span className={taskOverdue ? 'text-danger font-medium' : ''}>
                                                            {taskOverdue ? '⚠️ Overdue: ' : 'Due: '}{task.due_date}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-text-muted">
                                <p>All caught up! 🎉</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-bg-card border border-border rounded-xl overflow-hidden shadow-card">
                    <div className="flex justify-between items-center px-5 py-4 border-b border-border">
                        <h3 className="text-base font-semibold text-text">Recent Notes</h3>
                        <Link href="/projects" className="text-sm text-accent hover:text-accent-dark no-underline">
                            View projects →
                        </Link>
                    </div>
                    <div className="p-5">
                        {allNotes.length > 0 ? (
                            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
                                {allNotes.slice(0, 3).map((note, i) => (
                                    <Link
                                        key={i}
                                        href={`/projects/${note.projectId}?tab=notes&note=${note.id}`}
                                        className="bg-bg-card border border-border rounded-xl p-4 transition-all duration-200 block no-underline hover:-translate-y-0.5 hover:shadow-glow hover:border-border-glow cursor-pointer"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <div className={`text-xs font-medium px-2 py-1 rounded-full ${note.type === 'meeting' ? 'bg-blue-100 text-blue-600' :
                                                note.type === 'idea' ? 'bg-yellow-100 text-yellow-700' :
                                                    note.type === 'todo' ? 'bg-purple-100 text-purple-600' :
                                                        note.type === 'reference' ? 'bg-gray-100 text-gray-600' :
                                                            'bg-accent-glow text-accent'
                                                }`}>
                                                {note.type || 'note'}
                                            </div>
                                            <span className="text-xs text-text-muted">
                                                {note.projectEmoji} {note.projectName}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-semibold mt-3 mb-2 text-text">{note.title}</h3>
                                        <div
                                            className="text-sm leading-relaxed max-h-32 overflow-hidden text-text-secondary"
                                            dangerouslySetInnerHTML={{ __html: parseMarkdown(note.content?.slice(0, 150)) }}
                                        />
                                        <div className="text-xs mt-3 text-text-muted">{note.date}</div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-text-muted">
                                <p>No notes yet. Add notes to your projects!</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
