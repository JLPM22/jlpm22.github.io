import { NextResponse } from 'next/server';
import { readYamlFile, writeYamlFile } from '@/lib/yaml';

// GET all global tasks
export async function GET() {
    try {
        const data = readYamlFile('tasks.yaml');
        return NextResponse.json(data?.tasks || []);
    } catch (error) {
        console.error('Failed to load tasks:', error);
        return NextResponse.json([], { status: 500 });
    }
}

// POST create task
export async function POST(request) {
    try {
        const newTask = await request.json();
        const data = readYamlFile('tasks.yaml') || { tasks: [] };

        const task = {
            id: `global-task-${Date.now()}`,
            ...newTask,
            status: 'todo',
            created_at: new Date().toISOString().split('T')[0]
        };

        data.tasks = data.tasks || [];
        data.tasks.push(task);
        writeYamlFile('tasks.yaml', data);

        return NextResponse.json(task);
    } catch (error) {
        console.error('Failed to create task:', error);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}

// PUT update task
export async function PUT(request) {
    try {
        const updates = await request.json();
        const data = readYamlFile('tasks.yaml');

        const taskIndex = data.tasks?.findIndex(t => t.id === updates.id);
        if (taskIndex === -1) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        data.tasks[taskIndex] = { ...data.tasks[taskIndex], ...updates };
        writeYamlFile('tasks.yaml', data);

        return NextResponse.json(data.tasks[taskIndex]);
    } catch (error) {
        console.error('Failed to update task:', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}

// DELETE task
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        const data = readYamlFile('tasks.yaml');
        data.tasks = data.tasks.filter(t => t.id !== id);
        writeYamlFile('tasks.yaml', data);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete task:', error);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}
