'use client';

// Simple markdown parser - shared utility
export function parseMarkdown(text) {
    if (!text) return '';
    return text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br/>');
}

// Normalize priority to critical/normal/backlog
export function normalizePriority(priority) {
    if (!priority) return 'normal';
    const p = priority.toLowerCase();
    if (p === 'high' || p === 'critical') return 'critical';
    if (p === 'low' || p === 'backlog') return 'backlog';
    return 'normal';
}

// Sort tasks: active first (with due before without), then completed
export function sortTasksByPriority(tasks, priority) {
    return tasks
        .filter(t => normalizePriority(t.priority) === priority)
        .sort((a, b) => {
            // Done tasks at the end
            if (a.status === 'done' && b.status !== 'done') return 1;
            if (a.status !== 'done' && b.status === 'done') return -1;
            // Tasks with due dates before those without
            if (a.due_date && !b.due_date) return -1;
            if (!a.due_date && b.due_date) return 1;
            // Sort by due date
            if (a.due_date && b.due_date) {
                return new Date(a.due_date) - new Date(b.due_date);
            }
            return 0;
        });
}

// Check if a task is overdue
export function isOverdue(dateStr) {
    if (!dateStr) return false;
    const dueDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
}

// Trigger confetti effect at position
export function triggerConfetti(x, y) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;overflow:hidden;';
    document.body.appendChild(overlay);

    const colors = ['#10b981', '#34d399', '#059669', '#f59e0b', '#fbbf24'];

    for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `position:absolute;width:8px;height:8px;background:${colors[Math.floor(Math.random() * colors.length)]};left:${x}px;top:${y}px;border-radius:50%;`;

        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 80;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance - 30;

        particle.animate([
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
            { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
        ], {
            duration: 1200 + Math.random() * 800, // Slower duration (1.2s - 2.0s)
            easing: 'cubic-bezier(0, .9, .57, 1)',
            fill: 'forwards'
        });

        overlay.appendChild(particle);
    }

    setTimeout(() => overlay.remove(), 2500);
}
