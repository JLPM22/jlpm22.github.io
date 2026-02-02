import { NextResponse } from 'next/server';
import { readYamlFile, writeYamlFile } from '@/lib/yaml';

// GET all projects
export async function GET() {
    try {
        const data = readYamlFile('projects.yaml');
        return NextResponse.json(data || { projects: [] });
    } catch (error) {
        console.error('Failed to load projects:', error);
        return NextResponse.json({ projects: [] });
    }
}

// POST create new project
export async function POST(request) {
    try {
        const { name, emoji } = await request.json();

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const data = readYamlFile('projects.yaml') || { projects: [] };

        const newProject = {
            id: `proj-${Date.now()}`,
            name,
            emoji: emoji || '📁',
            summary: '',
            color: '#10b981',
            tasks: [],
            notes: []
        };

        data.projects.push(newProject);
        writeYamlFile('projects.yaml', data);

        return NextResponse.json(newProject);
    } catch (error) {
        console.error('Failed to create project:', error);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}
