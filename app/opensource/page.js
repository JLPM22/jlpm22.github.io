import { getProjects, getProfile } from '@/lib/content';
import OpenSourceClient from './OpenSourceClient';

export const metadata = {
    title: 'Open Source - Jose Luis Ponton',
    description: 'Open source projects and contributions',
};

export default function OpenSourcePage() {
    const projects = getProjects();
    const profile = getProfile();
    return <OpenSourceClient projects={projects} githubUrl={profile.social?.github} />;
}
