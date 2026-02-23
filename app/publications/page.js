import { getPapers, getVenueColors, getCoauthors } from '@/lib/content';
import PublicationsClient from './PublicationsClient';

export const metadata = {
    title: 'Publications - Jose Luis Ponton',
    description: 'List of research publications',
};

export const dynamic = 'force-dynamic';

export default function PublicationsPage() {
    const papers = getPapers();
    const venueColors = getVenueColors();
    const coauthors = getCoauthors();

    // Collect all unique venue tags, journal names, and topic tags
    const allVenueTags = [...new Set(papers.map(p => p.venueTag).filter(Boolean))].sort();
    const allJournalNames = [...new Set(papers.filter(p => p.type === 'Journal' && p.venue).map(p => p.venue))].sort();
    const allTopicTags = [...new Set(papers.flatMap(p => p.topicTags))].sort();

    return <PublicationsClient
        initialPapers={papers}
        venueColors={venueColors}
        allVenueTags={allVenueTags}
        allJournalNames={allJournalNames}
        allTopicTags={allTopicTags}
        coauthors={coauthors}
    />;
}
