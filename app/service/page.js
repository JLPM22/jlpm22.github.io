import { getService } from '@/lib/content';
import PageHeader from '@/components/PageHeader';
import styles from './service.module.css';

export const metadata = {
    title: 'Service - Jose Luis Ponton',
    description: 'Academic service and responsibilities',
};

function Location({ children }) {
    if (!children) return null;

    return (
        <span className={styles.location}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
            </svg>
            {children}
        </span>
    );
}

function ServiceEdition({ item }) {
    const year = item.year || 'Ongoing';
    const label = <span className={styles.year}>{year}</span>;

    return (
        <li className={styles.edition}>
            {item.url ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer" title={item.organization}
                    aria-label={`${item.shortName || item.organization}, ${year}${item.description ? `, ${item.description}` : ''}`}
                    className={styles.editionLink}>
                    {label}
                </a>
            ) : <span title={item.organization} className={styles.editionLink}>{label}</span>}
            <Location>{item.description}</Location>
        </li>
    );
}

function categoryFor(role) {
    if (['PC Member', 'IPC Member'].includes(role)) return 'Program committees';
    if (role.toLowerCase() === 'evaluator') return 'Evaluator';
    if (role === 'Paper Awards Committee') return 'Paper awards committee';
    return role;
}

function categoryOrder(category) {
    if (category === 'Program committees') return 0;
    if (category === 'Paper awards committee') return 1;
    if (category === 'Evaluator') return 3;
    return 2;
}

function sortVenuesByPriority(venues) {
    // Repeated editions stay together; their lowest assigned priority ranks the venue.
    return [...venues].sort(([, a], [, b]) => {
        const priorityA = Math.min(...a.map(item => item.priority ?? Infinity));
        const priorityB = Math.min(...b.map(item => item.priority ?? Infinity));
        return priorityA === priorityB ? 0 : priorityA - priorityB;
    });
}

// Keep each venue in one subject group; uncategorized additions appear in Others.
const reviewSubjects = {
    'Computer Vision': ['CVPR', 'ICCV', 'ECCV', 'IEEE TPAMI', 'IJCV'],
    'Computer Graphics': [
        'SIGGRAPH', 'SIGGRAPH Asia', 'MIG', 'Computers & Graphics', 'IEEE TVCG',
        'SCA', 'Eurographics', 'Computer Graphics Forum', 'Computer Graphics International',
        'CEIG', 'Pacific Graphics', 'Visual Computer',
    ],
    'AI': ['ICLR', 'NeurIPS', 'ICML', 'AAAI', 'IJCAI'],
    'HCI / VR': [
        'CHI', 'Behaviour & Information Technology', 'Springer Virtual Reality',
        'International Journal of Human-Computer Interaction', 'IEEE VR',
    ],
    'Others': [],
};

export default function ServicePage() {
    const categories = new Map();
    const reviewVenues = new Map();

    for (const item of getService()) {
        if (item.role === 'Reviewer') {
            const venue = item.organization.trim();
            reviewVenues.set(venue, (reviewVenues.get(venue) || 0) + 1);
            continue;
        }

        const category = categoryFor(item.role);
        if (!categories.has(category)) categories.set(category, new Map());
        const venues = categories.get(category);
        const name = item.shortName || item.organization;
        if (!venues.has(name)) venues.set(name, []);
        venues.get(name).push(item);
    }

    const sortedCategories = [...categories].sort(([a], [b]) => categoryOrder(a) - categoryOrder(b));
    const reviewGroups = Object.keys(reviewSubjects).map(subject => ({
        subject,
        venues: [...reviewVenues]
            .filter(([venue]) => (Object.keys(reviewSubjects).find(key => reviewSubjects[key].includes(venue)) || 'Others') === subject)
            .sort(([nameA, countA], [nameB, countB]) => countB - countA || nameA.localeCompare(nameB, 'en')),
    })).filter(group => group.venues.length > 0);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader title="Academic Service" description="Committee service, academic evaluation, and peer review." />

            <div className={styles.categories}>
                {sortedCategories.map(([category, venues], index) => (
                    <section key={category} aria-labelledby={`service-category-${index}`} className={styles.category}>
                        <h2 id={`service-category-${index}`} className="section-label mb-4">{category}</h2>
                        <ul className={styles.venueList}>
                            {sortVenuesByPriority(venues).map(([name, editions]) => (
                                <li key={name} className={styles.venue}>
                                    <abbr title={editions[0].organization} className={styles.venueName}>{name}</abbr>
                                    <ul className={styles.editions} aria-label={name}>
                                        {editions.map((item, editionIndex) => <ServiceEdition key={editionIndex} item={item} />)}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}

                {reviewGroups.length > 0 && (
                    <section aria-labelledby="service-peer-review">
                        <h2 id="service-peer-review" className="section-label mb-4">Peer review</h2>
                        <div className={styles.reviewGroups}>
                            {reviewGroups.map(({ subject, venues }, index) => (
                                <section key={subject} aria-labelledby={`review-subject-${index}`} className={styles.reviewGroup}>
                                    <h3 id={`review-subject-${index}`} className={styles.reviewSubject}>{subject}</h3>
                                    <ul className={styles.reviewList}>
                                        {venues.map(([organization, count]) => (
                                            <li key={organization} className={styles.reviewVenue}>
                                                <span>{organization}</span>
                                                {count > 1 && (
                                                    <span className={styles.reviewCount} title={`${count} reviews across all years`}>
                                                        <span aria-hidden="true">×{count}</span>
                                                        <span className="sr-only">{count} reviews across all years</span>
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
