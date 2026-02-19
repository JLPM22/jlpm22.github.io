'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Particles from '@/components/Particles';
import { parseMarkdown, isOverdue, triggerConfetti } from '@/lib/utils';

export default function DashboardPage() {
    const [globalTasks, setGlobalTasks] = useState([]);
    const [newGlobalTask, setNewGlobalTask] = useState('');
    const [projects, setProjects] = useState([]);
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/projects').then(r => r.json()),
            fetch('/api/papers').then(r => r.json()),
            fetch('/api/tasks').then(r => r.json())
        ]).then(([projectsData, papersData, tasksData]) => {
            setProjects(projectsData.projects || []);
            setPapers(papersData.papers || []);
            setGlobalTasks(tasksData || []);
        }).catch(e => console.error('Failed to load data:', e))
            .finally(() => setLoading(false));
    }, []);

    // Flatten all tasks from all projects
    const projectTasks = projects.flatMap(project =>
        (project.tasks || []).map(task => ({
            ...task,
            type: 'project',
            projectId: project.id,
            projectName: project.name,
            projectColor: project.color || '#10b981'
        }))
    );

    const allGlobalTasksFormatted = globalTasks.map(task => ({
        ...task,
        type: 'global',
        projectName: 'General',
        projectColor: '#6b7280'
    }));

    const allTasks = [...projectTasks, ...allGlobalTasksFormatted];

    // Notes logic removed
    const allNotes = [];

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

    const toggleTask = async (task, e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const willComplete = task.status !== 'done';

        if (willComplete) {
            triggerConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }

        if (task.type === 'project') {
            // Optimistic update for project tasks
            setProjects(prev => prev.map(p => {
                if (p.id === task.projectId) {
                    return {
                        ...p,
                        tasks: p.tasks.map(t =>
                            t.id === task.id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t
                        )
                    };
                }
                return p;
            }));

            try {
                await fetch(`/api/projects/${task.projectId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ toggleTask: task.id })
                });
            } catch (e) {
                console.error('Failed to update project task:', e);
            }
        } else {
            // Optimistic update for global tasks
            setGlobalTasks(prev => prev.map(t =>
                t.id === task.id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t
            ));

            try {
                await fetch('/api/tasks', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: task.id, status: willComplete ? 'done' : 'todo' })
                });
            } catch (e) {
                console.error('Failed to update global task:', e);
            }
        }
    };

    const addGlobalTask = async (e) => {
        e.preventDefault();
        if (!newGlobalTask.trim()) return;

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newGlobalTask })
            });
            const task = await res.json();
            setGlobalTasks(prev => [...prev, task]);
            setNewGlobalTask('');
        } catch (e) {
            console.error('Failed to create task:', e);
        }
    };

    const deleteGlobalTask = async (taskId) => {
        if (!confirm('Delete this task?')) return;

        setGlobalTasks(prev => prev.filter(t => t.id !== taskId));

        try {
            await fetch(`/api/tasks?id=${taskId}`, { method: 'DELETE' });
        } catch (e) {
            console.error('Failed to delete task:', e);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen relative bg-bg">
                <Particles />
                <Sidebar />
                <main className="ml-0 md:ml-64 flex-1 p-6 md:p-10 max-w-5xl relative z-1 flex items-center justify-center">
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
                    <div className="bg-bg-card border border-border rounded-xl p-5 transition-all duration-200 block no-underline cursor-default">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-3 bg-accent-glow">☐</div>
                        <div className="text-2xl font-bold text-text">{activeTasks.length}</div>
                        <div className="text-sm mt-1 text-text-muted">Active Tasks</div>
                    </div>
                    {overdueTasks.length > 0 && (
                        <div className="bg-bg-card border border-danger rounded-xl p-5 transition-all duration-200 block no-underline cursor-default">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-3 bg-accent-glow">⚠️</div>
                            <div className="text-2xl font-bold text-danger">{overdueTasks.length}</div>
                            <div className="text-sm mt-1 text-text-muted">Overdue</div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upcoming Tasks */}
                    <div className="bg-bg-card border border-border rounded-xl overflow-hidden shadow-card h-fit">
                        <div className="flex justify-between items-center px-5 py-4 border-b border-border">
                            <h3 className="text-base font-semibold text-text">
                                {overdueTasks.length > 0 ? '⚠️ Attention Needed' : 'Upcoming Tasks'}
                            </h3>
                        </div>
                        <div className="p-5">
                            {upcomingTasks.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    {upcomingTasks.map((task, i) => {
                                        const taskOverdue = isOverdue(task.due_date);
                                        return (
                                            <div
                                                key={i}
                                                className={`flex items-start gap-3 p-3 rounded-lg border border-transparent transition-all hover:bg-bg-subtle hover:border-border-glow ${taskOverdue ? 'bg-red-50 border-red-200' : ''}`}
                                            >
                                                <div
                                                    className={`w-5 h-5 rounded border-2 cursor-pointer flex-shrink-0 mt-0.5 transition-all flex items-center justify-center ${task.status === 'done'
                                                        ? 'border-transparent bg-gradient-primary'
                                                        : 'border-border hover:border-accent'
                                                        }`}
                                                    onClick={(e) => toggleTask(task, e)}
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
                                            </div>
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

                    {/* General Tasks */}
                    <div className="bg-bg-card border border-border rounded-xl overflow-hidden shadow-card h-fit">
                        <div className="flex justify-between items-center px-5 py-4 border-b border-border">
                            <h3 className="text-base font-semibold text-text">General Tasks</h3>
                        </div>
                        <div className="p-5">
                            <form onSubmit={addGlobalTask} className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    className="flex-1 px-4 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent-glow"
                                    placeholder="Add a new task..."
                                    value={newGlobalTask}
                                    onChange={e => setNewGlobalTask(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-gradient-primary text-white rounded-lg text-sm font-medium shadow-glow hover:-translate-y-0.5 transition-all border-none cursor-pointer"
                                >
                                    Add
                                </button>
                            </form>

                            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                                {globalTasks.length > 0 ? (
                                    globalTasks.map(task => (
                                        <div key={task.id} className={`flex items-center gap-3 p-3 rounded-lg border border-border bg-white transition-all hover:shadow-sm ${task.status === 'done' ? 'opacity-60' : ''}`}>
                                            <div
                                                className={`w-5 h-5 rounded border-2 cursor-pointer flex-shrink-0 transition-all flex items-center justify-center ${task.status === 'done'
                                                    ? 'border-transparent bg-gradient-primary'
                                                    : 'border-border hover:border-accent'
                                                    }`}
                                                onClick={(e) => toggleTask({ ...task, type: 'global' }, e)}
                                            >
                                                {task.status === 'done' && <span className="text-white text-xs">✓</span>}
                                            </div>
                                            <div className={`flex-1 text-sm text-text ${task.status === 'done' ? 'line-through text-text-muted' : ''}`}>
                                                {task.title}
                                            </div>
                                            <button
                                                className="text-text-muted hover:text-danger text-lg px-2 bg-transparent border-none cursor-pointer"
                                                onClick={() => deleteGlobalTask(task.id)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-text-muted text-sm">
                                        No general tasks yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
