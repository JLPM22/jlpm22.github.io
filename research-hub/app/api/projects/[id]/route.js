import { NextResponse } from 'next/server';
import { readYamlFile, writeYamlFile } from '@/lib/yaml';

// GET single project
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const data = readYamlFile('projects.yaml');
        const project = data?.projects?.find(p => p.id === id);

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json(project);
    } catch (error) {
        console.error('Failed to load project:', error);
        return NextResponse.json({ error: 'Failed to load project' }, { status: 500 });
    }
}

// PUT update project (summary, tasks, notes)
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const updates = await request.json();
        const data = readYamlFile('projects.yaml');
        const projectIndex = data?.projects?.findIndex(p => p.id === id);

        if (projectIndex === -1) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const project = data.projects[projectIndex];

        // Update summary
        if (updates.summary !== undefined) {
            project.summary = updates.summary;
        }

        // Update name/emoji
        if (updates.name !== undefined) {
            project.name = updates.name;
        }
        if (updates.emoji !== undefined) {
            project.emoji = updates.emoji;
        }

        // Add task
        if (updates.addTask) {
            const newTask = {
                id: `task-${Date.now()}`,
                title: updates.addTask.title,
                status: 'todo',
                due_date: updates.addTask.due_date || null,
                priority: updates.addTask.priority || 'medium'
            };
            project.tasks = project.tasks || [];
            project.tasks.push(newTask);
        }

        // Toggle task status
        if (updates.toggleTask) {
            const task = project.tasks?.find(t => t.id === updates.toggleTask);
            if (task) {
                task.status = task.status === 'done' ? 'todo' : 'done';
            }
        }

        // Delete task
        if (updates.deleteTask) {
            project.tasks = project.tasks?.filter(t => t.id !== updates.deleteTask) || [];
        }

        // Update external links
        if (updates.notebook_lm !== undefined) {
            project.notebook_lm = updates.notebook_lm;
        }
        if (updates.google_drive !== undefined) {
            project.google_drive = updates.google_drive;
        }

        data.projects[projectIndex] = project;
        writeYamlFile('projects.yaml', data);

        return NextResponse.json(project);
    } catch (error) {
        console.error('Failed to update project:', error);
        return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }
}

// DELETE project
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const data = readYamlFile('projects.yaml');

        data.projects = data.projects?.filter(p => p.id !== id) || [];
        writeYamlFile('projects.yaml', data);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete project:', error);
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }
}
