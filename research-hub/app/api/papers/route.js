import { NextResponse } from 'next/server';
import { readYamlFile } from '@/lib/yaml';

export async function GET() {
    try {
        const data = readYamlFile('papers.yaml');
        return NextResponse.json(data || { papers: [] });
    } catch (error) {
        console.error('Failed to load papers:', error);
        return NextResponse.json({ papers: [] });
    }
}
