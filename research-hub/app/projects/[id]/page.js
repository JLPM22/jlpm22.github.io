'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Particles from '@/components/Particles';
import { sortTasksByPriority, triggerConfetti } from '@/lib/utils';

const PRIORITY_LABELS = { critical: 'Critical', normal: 'Normal', backlog: 'Backlog' };

export default function ProjectDetailPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingSummary, setEditingSummary] = useState(false);
    const [summaryText, setSummaryText] = useState('');
    const [editingProject, setEditingProject] = useState(false);
    const [projectEdit, setProjectEdit] = useState({ name: '', emoji: '', notebook_lm: '', google_drive: '' });
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', due_date: '', priority: 'normal' });

    const emojis = ['📁', '🎓', '📚', '🔬', '💻', '🎨', '🚀', '⚡', '🌟', '🎯', '📝', '🧪', '🤖', '🧠', '💡'];

    useEffect(() => {
        fetchProject();
    }, [id]);

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/projects/${id}`);
            if (!res.ok) throw new Error('Not found');
            const data = await res.json();
            setProject(data);
            setSummaryText(data.summary || '');
            setProjectEdit({
                name: data.name,
                emoji: data.emoji,
                notebook_lm: data.notebook_lm || '',
                google_drive: data.google_drive || ''
            });
        } catch (e) {
            console.error('Failed to fetch project:', e);
        } finally {
            setLoading(false);
        }
    };

    const updateProject = async (updates) => {
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            const updated = await res.json();
            setProject(updated);
            return updated;
        } catch (e) {
            console.error('Failed to update project:', e);
        }
    };

    const saveSummary = async () => {
        await updateProject({ summary: summaryText });
        setEditingSummary(false);
    };

    const saveProjectEdit = async () => {
        await updateProject({
            name: projectEdit.name,
            emoji: projectEdit.emoji,
            notebook_lm: projectEdit.notebook_lm,
            google_drive: projectEdit.google_drive
        });
        setEditingProject(false);
    };

    const addTask = async () => {
        if (!newTask.title.trim()) return;
        await updateProject({ addTask: { ...newTask, due_date: newTask.due_date || null } });
        setNewTask({ title: '', due_date: '', priority: 'normal' });
        setShowTaskForm(false);
    };

    const toggleTask = async (taskId, e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const task = project.tasks?.find(t => t.id === taskId);
        const willComplete = task?.status !== 'done';

        // Optimistic update
        setProject(prev => ({
            ...prev,
            tasks: prev.tasks.map(t =>
                t.id === taskId ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t
            )
        }));

        if (willComplete) {
            triggerConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }

        await updateProject({ toggleTask: taskId });
    };

    const deleteTask = async (taskId) => {
        if (!confirm('Delete this task?')) return;
        await updateProject({ deleteTask: taskId });
    };



    const deleteProject = async () => {
        if (!confirm('Delete this entire project? This cannot be undone.')) return;
        try {
            await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            router.push('/projects');
        } catch (e) {
            console.error('Failed to delete project:', e);
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

    if (!project) {
        return (
            <div className="flex min-h-screen relative bg-bg">
                <Particles />
                <Sidebar />
                <main className="ml-0 md:ml-64 flex-1 p-6 md:p-10 max-w-5xl relative z-1 flex items-center justify-center">
                    <p>Project not found</p>
                </main>
            </div>
        );
    }

    const tasks = project.tasks || [];

    const doneTasks = tasks.filter(t => t.status === 'done').length;

    return (
        <div className="flex min-h-screen relative bg-bg">
            <Particles />
            <Sidebar />
            <main className="ml-0 md:ml-64 flex-1 p-6 md:p-10 max-w-5xl relative z-1">
                <div className="flex items-center gap-5 mb-8">
                    {editingProject ? (
                        <div className="w-full">
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Icon</label>
                                <div className="flex flex-wrap gap-2">
                                    {emojis.map(emoji => (
                                        <button
                                            key={emoji}
                                            className={`w-10 h-10 text-xl border-2 rounded-xl cursor-pointer transition-all flex items-center justify-center ${projectEdit.emoji === emoji ? 'border-accent bg-accent-glow' : 'border-transparent bg-bg-subtle hover:bg-white hover:shadow-sm'}`}
                                            onClick={() => setProjectEdit(prev => ({ ...prev, emoji }))}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Project Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-border rounded-lg text-base bg-white focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent-glow"
                                        value={projectEdit.name}
                                        onChange={e => setProjectEdit(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Project Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">NotebookLM Link</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent-glow"
                                        value={projectEdit.notebook_lm}
                                        onChange={e => setProjectEdit(prev => ({ ...prev, notebook_lm: e.target.value }))}
                                        placeholder="https://notebooklm.google.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Google Drive Link</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent-glow"
                                        value={projectEdit.google_drive}
                                        onChange={e => setProjectEdit(prev => ({ ...prev, google_drive: e.target.value }))}
                                        placeholder="https://drive.google.com/..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm cursor-pointer transition-all border-none text-white bg-gradient-primary shadow-glow hover:-translate-y-0.5" onClick={saveProjectEdit}>Save Changes</button>
                                <button className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm cursor-pointer transition-all border border-border bg-white text-text hover:bg-bg-subtle" onClick={() => setEditingProject(false)}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="text-5xl cursor-pointer" onClick={() => setEditingProject(true)}>{project.emoji}</div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold mb-1 text-text cursor-pointer" onClick={() => setEditingProject(true)}>{project.name}</h1>
                                <div className="flex gap-5 text-sm mt-1 text-text-muted">
                                    <span>☐ {doneTasks}/{tasks.length} tasks</span>
                                </div>
                            </div>
                            <button
                                className="bg-transparent border border-danger text-danger px-4 py-2 rounded-lg text-sm cursor-pointer transition-all hover:text-white hover:bg-danger ml-auto"
                                onClick={deleteProject}
                            >
                                Delete
                            </button>
                        </>
                    )}
                </div>

                <div className="bg-white border border-border rounded-xl p-5 mb-8">
                    <h3 className="text-sm text-text-muted mb-2">Summary</h3>
                    {editingSummary ? (
                        <div>
                            <textarea
                                className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-white transition-all resize-y min-h-[100px] focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent-glow"
                                value={summaryText}
                                onChange={e => setSummaryText(e.target.value)}
                                placeholder="Add a summary for this project..."
                                rows={3}
                            />
                            <div className="flex gap-2 mt-2">
                                <button className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-medium text-xs cursor-pointer transition-all border-none text-white bg-gradient-primary shadow-glow hover:-translate-y-0.5" onClick={saveSummary}>Save</button>
                                <button className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-medium text-xs cursor-pointer transition-all border border-border bg-bg-subtle text-text hover:bg-white hover:border-muted" onClick={() => setEditingSummary(false)}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <p
                            className="cursor-pointer transition-colors text-text-secondary hover:text-text"
                            onClick={() => setEditingSummary(true)}
                        >
                            {project.summary || 'Click to add a summary...'}
                        </p>
                    )}
                </div>

                {/* Resources Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {/* NotebookLM */}
                    <div className="bg-white border border-border rounded-xl p-5 hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-xl">🤖</div>
                            <div>
                                <h3 className="font-semibold text-text">NotebookLM</h3>
                                <p className="text-xs text-text-muted">AI Research Assistant</p>
                            </div>
                        </div>
                        {project.notebook_lm ? (
                            <a
                                href={project.notebook_lm}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full text-center py-2 rounded-lg bg-bg-subtle text-text font-medium hover:bg-accent hover:text-white transition-colors no-underline"
                            >
                                Open Notebook →
                            </a>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <a
                                    href="https://notebooklm.google.com/?icid=home_maincta"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center py-2 rounded-lg bg-bg-subtle text-text font-medium hover:bg-accent hover:text-white transition-colors no-underline text-sm border border-transparent"
                                >
                                    Create New Notebook ↗
                                </a>
                                <button
                                    className="text-xs text-text-muted hover:text-accent underline cursor-pointer bg-transparent border-none"
                                    onClick={() => setEditingProject(true)}
                                >
                                    Link existing notebook
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Google Drive */}
                    <div className="bg-white border border-border rounded-xl p-5 hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-xl">📁</div>
                            <div>
                                <h3 className="font-semibold text-text">Google Drive</h3>
                                <p className="text-xs text-text-muted">Project Files & Docs</p>
                            </div>
                        </div>
                        {project.google_drive ? (
                            <a
                                href={project.google_drive}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full text-center py-2 rounded-lg bg-bg-subtle text-text font-medium hover:bg-accent hover:text-white transition-colors no-underline"
                            >
                                Open Drive Folder →
                            </a>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <a
                                    href="https://drive.google.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center py-2 rounded-lg bg-bg-subtle text-text font-medium hover:bg-accent hover:text-white transition-colors no-underline text-sm border border-transparent"
                                >
                                    Go to Drive ↗
                                </a>
                                <button
                                    className="text-xs text-text-muted hover:text-accent underline cursor-pointer bg-transparent border-none"
                                    onClick={() => setEditingProject(true)}
                                >
                                    Link Drive folder
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-xl font-bold text-text">Tasks</h2>
                </div>

                <div className="project-tasks-section">
                    {!showTaskForm && (
                        <button
                            className="w-full flex flex-col items-center justify-center py-8 border-2 border-dashed border-border bg-transparent cursor-pointer rounded-xl transition-all hover:border-accent hover:bg-accent-glow group mb-6"
                            onClick={() => setShowTaskForm(true)}
                        >
                            <div className="text-3xl text-text-muted mb-2 transition-colors group-hover:text-accent">+</div>
                            <span className="text-sm font-medium text-text-muted group-hover:text-accent">Add New Task</span>
                        </button>
                    )}

                    {showTaskForm && (
                        <div className="mb-4 p-4 bg-white border border-border rounded-xl shadow-sm">
                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-white transition-all focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent-glow"
                                    placeholder="Task title"
                                    value={newTask.title}
                                    onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-3 mt-3">
                                <input
                                    type="date"
                                    className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-white transition-all focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent-glow flex-1"
                                    value={newTask.due_date}
                                    onChange={e => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                                    placeholder="Optional"
                                />
                                <select
                                    className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-white transition-all focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent-glow flex-1"
                                    value={newTask.priority}
                                    onChange={e => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                                >
                                    <option value="critical">Critical</option>
                                    <option value="normal">Normal</option>
                                    <option value="backlog">Backlog</option>
                                </select>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <button className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-medium text-xs cursor-pointer transition-all border-none text-white bg-gradient-primary shadow-glow hover:-translate-y-0.5" onClick={addTask}>Add Task</button>
                                <button className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-medium text-xs cursor-pointer transition-all border border-border bg-bg-subtle text-text hover:bg-white hover:border-muted" onClick={() => setShowTaskForm(false)}>Cancel</button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {['critical', 'normal', 'backlog'].map(priority => {
                            const priorityTasks = sortTasksByPriority(tasks, priority);
                            return (
                                <div key={priority} className="rounded-xl overflow-hidden bg-bg-subtle">
                                    <div className={`px-4 py-3 font-semibold text-sm uppercase tracking-wider text-white ${priority === 'critical' ? 'bg-gradient-critical' :
                                        priority === 'normal' ? 'bg-gradient-primary' :
                                            'bg-gradient-backlog'
                                        }`}>
                                        {PRIORITY_LABELS[priority]} ({priorityTasks.length})
                                    </div>
                                    <div className="p-3 min-h-[100px] flex flex-col gap-2">
                                        {priorityTasks.map(task => (
                                            <div key={task.id} className={`bg-white border border-border rounded-lg p-3 flex items-start gap-2.5 transition-all hover:shadow-md ${task.status === 'done' ? 'opacity-60' : ''}`}>
                                                <div
                                                    className={`w-5 h-5 rounded border-2 cursor-pointer flex-shrink-0 mt-0.5 transition-all flex items-center justify-center ${task.status === 'done' ? 'bg-accent border-transparent' : 'border-border hover:border-accent'}`}
                                                    onClick={(e) => toggleTask(task.id, e)}
                                                >
                                                    {task.status === 'done' && <span className="text-white text-xs">✓</span>}
                                                </div>
                                                <div className="flex-1">
                                                    <div className={`text-sm text-text ${task.status === 'done' ? 'line-through' : ''}`}>{task.title}</div>
                                                    {task.due_date && (
                                                        <div className="text-xs text-text-muted mt-1">Due: {task.due_date}</div>
                                                    )}
                                                </div>
                                                <button
                                                    className="bg-transparent border-none text-xl cursor-pointer p-1 transition-colors text-text-muted hover:text-danger"
                                                    onClick={() => deleteTask(task.id)}
                                                    title="Delete task"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                        {priorityTasks.length === 0 && (
                                            <div className="text-sm text-center py-6 text-text-muted">No tasks</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}
