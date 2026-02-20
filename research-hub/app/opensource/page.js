import { getProjects } from '@/lib/content';
import OpenSourceClient from './OpenSourceClient';

export const metadata = {
    title: 'Open Source - Jose Luis Ponton',
    description: 'Open source projects and contributions',
};

export default function OpenSourcePage() {
    const projects = getProjects();
    return <OpenSourceClient projects={projects} />;
}
