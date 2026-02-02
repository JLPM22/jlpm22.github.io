'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Particles from '@/components/Particles';
import { parseMarkdown, normalizePriority, sortTasksByPriority, triggerConfetti } from '@/lib/utils';

const NOTE_TYPES = ['note', 'meeting', 'idea', 'todo', 'reference'];
const PRIORITY_LABELS = { critical: 'Critical', normal: 'Normal', backlog: 'Backlog' };

export default function ProjectDetailPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'tasks');
    const [editingSummary, setEditingSummary] = useState(false);
    const [summaryText, setSummaryText] = useState('');
    const [editingProject, setEditingProject] = useState(false);
    const [projectEdit, setProjectEdit] = useState({ name: '', emoji: '' });
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [newTask, setNewTask] = useState({ title: '', due_date: '', priority: 'normal' });
    const [newNote, setNewNote] = useState({ title: '', content: '', type: 'note' });

    const emojis = ['📁', '🎓', '📚', '🔬', '💻', '🎨', '🚀', '⚡', '🌟', '🎯', '📝', '🧪', '🤖', '🧠', '💡'];

    useEffect(() => {
        fetchProject();
    }, [id]);

    // Handle note param for auto-editing
    useEffect(() => {
        const noteId = searchParams.get('note');
        if (noteId && project?.notes) {
            const note = project.notes.find(n => n.id === noteId);
            if (note) {
                setActiveTab('notes');
                setEditingNote({ ...note });
            }
        }
    }, [searchParams, project]);

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/projects/${id}`);
            if (!res.ok) throw new Error('Not found');
            const data = await res.json();
            setProject(data);
            setSummaryText(data.summary || '');
            setProjectEdit({ name: data.name, emoji: data.emoji });
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
        await updateProject({ name: projectEdit.name, emoji: projectEdit.emoji });
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

    const addNote = async () => {
        if (!newNote.title.trim()) return;
        await updateProject({ addNote: newNote });
        setNewNote({ title: '', content: '', type: 'note' });
        setShowNoteForm(false);
    };

    const saveEditNote = async () => {
        await updateProject({ updateNote: editingNote });
        setEditingNote(null);
    };

    const deleteNote = async (noteId) => {
        if (!confirm('Delete this note?')) return;
        await updateProject({ deleteNote: noteId });
        setEditingNote(null);
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
    const notes = project.notes || [];
    const doneTasks = tasks.filter(t => t.status === 'done').length;

    return (
        <div className="flex min-h-screen relative bg-bg">
            <Particles />
            <Sidebar />
            <main className="ml-0 md:ml-64 flex-1 p-6 md:p-10 max-w-5xl relative z-1">
                <div className="flex items-center gap-5 mb-8">
                    {editingProject ? (
                        <>
                            <div className="flex flex-wrap gap-1 mb-3">
                                {emojis.map(emoji => (
                                    <button
                                        key={emoji}
                                        className={`w-8 h-8 text-base border-2 border-transparent rounded-lg cursor-pointer transition-all ${projectEdit.emoji === emoji ? 'border-accent bg-accent-glow' : 'bg-bg-subtle hover:bg-accent-glow'}`}
                                        onClick={() => setProjectEdit(prev => ({ ...prev, emoji }))}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="text"
                                className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-white transition-all focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent-glow text-2xl font-bold"
                                value={projectEdit.name}
                                onChange={e => setProjectEdit(prev => ({ ...prev, name: e.target.value }))}
                                style={{ flex: 1 }}
                            />
                            <button className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-medium text-xs cursor-pointer transition-all border-none text-white bg-gradient-primary shadow-glow hover:-translate-y-0.5" onClick={saveProjectEdit}>Save</button>
                            <button className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-medium text-xs cursor-pointer transition-all border border-border bg-bg-subtle text-text hover:bg-white hover:border-muted" onClick={() => setEditingProject(false)}>Cancel</button>
                        </>
                    ) : (
                        <>
                            <div className="text-5xl cursor-pointer" onClick={() => setEditingProject(true)}>{project.emoji}</div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold mb-1 text-text cursor-pointer" onClick={() => setEditingProject(true)}>{project.name}</h1>
                                <div className="flex gap-5 text-sm mt-1 text-text-muted">
                                    <span>☐ {doneTasks}/{tasks.length} tasks</span>
                                    <span>📝 {notes.length} notes</span>
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

                <div className="flex gap-2 mb-6 border-b border-border pb-2">
                    <button
                        className={`px-4 py-2 text-sm font-medium bg-transparent border-none cursor-pointer transition-all rounded-t-lg ${activeTab === 'tasks' ? 'text-accent bg-accent-glow' : 'text-text-secondary hover:text-text hover:bg-bg-subtle'}`}
                        onClick={() => setActiveTab('tasks')}
                    >
                        Tasks ({tasks.length})
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium bg-transparent border-none cursor-pointer transition-all rounded-t-lg ${activeTab === 'notes' ? 'text-accent bg-accent-glow' : 'text-text-secondary hover:text-text hover:bg-bg-subtle'}`}
                        onClick={() => setActiveTab('notes')}
                    >
                        Notes ({notes.length})
                    </button>
                </div>

                {activeTab === 'tasks' && (
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
                )}

                {activeTab === 'notes' && (
                    <div className="project-notes-section">
                        {!showNoteForm && (
                            <button
                                className="w-full flex flex-col items-center justify-center py-8 border-2 border-dashed border-border bg-transparent cursor-pointer rounded-xl transition-all hover:border-accent hover:bg-accent-glow group mb-6"
                                onClick={() => setShowNoteForm(true)}
                            >
                                <div className="text-3xl text-text-muted mb-2 transition-colors group-hover:text-accent">+</div>
                                <span className="text-sm font-medium text-text-muted group-hover:text-accent">Add New Note</span>
                            </button>
                        )}

                        {showNoteForm && (
                            <div className="mb-4 p-4 bg-white border border-border rounded-xl shadow-sm">
                                <div className="flex gap-3 mb-3">
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-white transition-all focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent-glow flex-1"
                                        placeholder="Note title"
                                        value={newNote.title}
                                        onChange={e => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                                        autoFocus
                                    />
                                    <select
                                        className="px-4 py-3 border border-border rounded-lg text-sm bg-white transition-all focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent-glow w-[140px]"
                                        value={newNote.type}
                                        onChange={e => setNewNote(prev => ({ ...prev, type: e.target.value }))}
                                    >
                                        {NOTE_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mt-3">
                                    <textarea
                                        className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-white transition-all resize-y min-h-[100px] focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent-glow"
                                        placeholder="Write your note here... (Markdown supported)"
                                        value={newNote.content}
                                        onChange={e => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                                        rows={5}
                                    />
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <button className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-medium text-xs cursor-pointer transition-all border-none text-white bg-gradient-primary shadow-glow hover:-translate-y-0.5" onClick={addNote}>Add Note</button>
                                    <button className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-medium text-xs cursor-pointer transition-all border border-border bg-bg-subtle text-text hover:bg-white hover:border-muted" onClick={() => setShowNoteForm(false)}>Cancel</button>
                                </div>
                            </div>
                        )}

                        {notes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {notes.map(note => (
                                    <div key={note.id} className="bg-white border border-border rounded-xl p-5 transition-all hover:shadow-md cursor-pointer" onClick={() => !editingNote && setEditingNote({ ...note })}>
                                        {editingNote?.id === note.id ? (
                                            <div className="note-edit-form" onClick={e => e.stopPropagation()}>
                                                <div className="flex gap-3 mb-3">
                                                    <input
                                                        type="text"
                                                        className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-white transition-all focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent-glow flex-1"
                                                        value={editingNote.title}
                                                        onChange={e => setEditingNote(prev => ({ ...prev, title: e.target.value }))}
                                                    />
                                                    <select
                                                        className="px-4 py-3 border border-border rounded-lg text-sm bg-white transition-all focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent-glow w-[120px]"
                                                        value={editingNote.type}
                                                        onChange={e => setEditingNote(prev => ({ ...prev, type: e.target.value }))}
                                                    >
                                                        {NOTE_TYPES.map(type => (
                                                            <option key={type} value={type}>{type}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <textarea
                                                    className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-white transition-all resize-y min-h-[100px] focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent-glow"
                                                    value={editingNote.content}
                                                    onChange={e => setEditingNote(prev => ({ ...prev, content: e.target.value }))}
                                                    rows={6}
                                                />
                                                <div className="flex gap-2 mt-3">
                                                    <button className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-medium text-xs cursor-pointer transition-all border-none text-white bg-gradient-primary shadow-glow hover:-translate-y-0.5" onClick={saveEditNote}>Save</button>
                                                    <button className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-medium text-xs cursor-pointer transition-all border border-border bg-bg-subtle text-text hover:bg-white hover:border-muted" onClick={() => setEditingNote(null)}>Cancel</button>
                                                    <button className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-medium text-xs cursor-pointer transition-all border border-danger text-danger bg-transparent hover:bg-danger hover:text-white ml-auto" onClick={() => deleteNote(note.id)}>Delete</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-start">
                                                    <div className={`px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wider mb-2 ${note.type === 'note' ? 'bg-blue-100 text-blue-700' :
                                                        note.type === 'idea' ? 'bg-yellow-100 text-yellow-700' :
                                                            note.type === 'todo' ? 'bg-green-100 text-green-700' :
                                                                'bg-gray-100 text-gray-700'
                                                        }`}>{note.type || 'note'}</div>
                                                </div>
                                                <h3 className="text-lg font-semibold mb-2">{note.title}</h3>
                                                <div
                                                    className="text-text-secondary text-sm line-clamp-3 mb-3 prose prose-sm"
                                                    dangerouslySetInnerHTML={{ __html: parseMarkdown(note.content) }}
                                                />
                                                <div className="text-xs text-text-muted">{note.date}</div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-text-muted">
                                <p>No notes yet</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
