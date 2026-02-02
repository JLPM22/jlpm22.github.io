import { NextResponse } from 'next/server';
import { readProjectFiles, writeProjectFile } from '@/lib/yaml';

export async function GET() {
    try {
        const projects = readProjectFiles();
        const tasks = [];

        for (const project of projects) {
            if (project.tasks) {
                for (const task of project.tasks) {
                    const taskId = `${project.project.name}-${task.title}`.replace(/\s+/g, '-').toLowerCase();
                    const isOverdue = task.due_date && new Date(task.due_date) < new Date();

                    tasks.push({
                        ...task,
                        id: taskId,
                        projectName: project.project.name,
                        projectColor: project.project.color || '#0a0a0a',
                        _filename: project._filename,
                        isOverdue
                    });
                }
            }
        }

        // Sort: active first (by due date), then done
        tasks.sort((a, b) => {
            if (a.status !== b.status) {
                return a.status === 'done' ? 1 : -1;
            }
            if (!a.due_date) return 1;
            if (!b.due_date) return -1;
            return new Date(a.due_date) - new Date(b.due_date);
        });

        return NextResponse.json({ tasks });
    } catch (error) {
        console.error('Failed to load tasks:', error);
        return NextResponse.json({ error: 'Failed to load tasks' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const { taskId, done } = await request.json();
        const projects = readProjectFiles();

        for (const project of projects) {
            if (project.tasks) {
                const taskIndex = project.tasks.findIndex(t => {
                    const id = `${project.project.name}-${t.title}`.replace(/\s+/g, '-').toLowerCase();
                    return id === taskId;
                });

                if (taskIndex !== -1) {
                    project.tasks[taskIndex].status = done ? 'done' : 'todo';

                    // Remove internal fields before writing
                    const { _filename, ...dataToWrite } = project;
                    writeProjectFile(_filename, dataToWrite);

                    return NextResponse.json({ success: true });
                }
            }
        }

        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    } catch (error) {
        console.error('Failed to update task:', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}
