'use client';

export default function TaskItem({ task, onToggle }) {
    const isDone = task.status === 'done';

    const handleToggle = async (e) => {
        // Get checkbox position for confetti
        const rect = e.currentTarget.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        await onToggle(task.id, !isDone, { x, y });
    };

    // Check if task is overdue
    const isOverdue = task.due_date && !isDone && new Date(task.due_date) < new Date();

    return (
        <div className={`task-item ${isDone ? 'done' : ''} ${isOverdue ? 'overdue' : ''}`}>
            <div
                className={`task-checkbox ${isDone ? 'checked' : ''}`}
                onClick={handleToggle}
                role="checkbox"
                aria-checked={isDone}
                tabIndex={0}
            />
            <div className="task-content">
                <div className="task-title">{task.title}</div>
                <div className="task-meta">
                    <span className="task-project">
                        <span
                            className="project-dot"
                            style={{ background: task.projectColor || '#10b981' }}
                        />
                        {task.projectName}
                    </span>
                    {task.due_date && (
                        <span className={isOverdue ? 'text-danger' : ''}>
                            {isOverdue ? '⚠️ Overdue: ' : 'Due: '}{task.due_date}
                        </span>
                    )}
                    {task.priority && (
                        <span className={`priority-badge priority-${task.priority}`}>
                            {task.priority}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
