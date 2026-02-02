import { NextResponse } from 'next/server';
import { readYamlFile } from '@/lib/yaml';

export async function GET() {
    try {
        const data = readYamlFile('profile.yaml');
        return NextResponse.json(data || {});
    } catch (error) {
        console.error('Failed to load profile:', error);
        return NextResponse.json({});
    }
}
