import { getService } from '@/lib/content';
import PageHeader from '@/components/PageHeader';

export const metadata = {
    title: 'Service - Jose Luis Ponton',
    description: 'Academic service and responsibilities',
};

function Organization({ item }) {
    return (
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {item.shortName ? (
                <abbr
                    title={item.organization}
                    className="inline-flex min-w-[108px] cursor-help items-center whitespace-nowrap rounded-md bg-accent/[0.07] px-2.5 py-0.5 text-[13px] font-semibold leading-5 tracking-wide text-accent-dark no-underline"
                >
                    {item.shortName}
                </abbr>
            ) : <span>{item.organization}</span>}
            {item.description && (
                <span className="inline-flex items-center gap-1.5 text-[13px] leading-5 text-text-muted">
                    <svg aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-text-muted/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" />
                        <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    {item.description}
                </span>
            )}
        </span>
    );
}

export default function ServicePage() {
    const groupedItems = getService().reduce((acc, item) => {
        const year = item.year || 'Ongoing';
        if (!acc[year]) acc[year] = { roles: [], reviews: new Map(), pcMembers: [] };

        if (item.role === 'Reviewer') {
            const reviews = acc[year].reviews;
            reviews.set(item.organization, (reviews.get(item.organization) || 0) + 1);
        } else if (['PC Member', 'IPC Member'].includes(item.role)) {
            acc[year].pcMembers.push(item);
        } else {
            acc[year].roles.push(item);
        }
        return acc;
    }, {});

    const sortedYears = Object.keys(groupedItems).sort((a, b) => {
        if (a === 'Ongoing') return -1;
        if (b === 'Ongoing') return 1;
        return parseInt(b) - parseInt(a);
    });

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader title="Academic Service" description="Program committees, paper awards, and peer review by year." />

            <div className="ml-1 border-l border-border">
                {sortedYears.map(year => {
                    const { roles, pcMembers, reviews } = groupedItems[year];

                    return (
                        <section key={year} aria-labelledby={`service-${year}`} className="relative grid gap-3 pb-5 pl-5 sm:grid-cols-[64px_minmax(0,1fr)] sm:gap-5 sm:pl-6">
                            <span aria-hidden="true" className="absolute -left-[4.5px] top-2 h-2 w-2 rounded-full border-2 border-accent bg-bg" />
                            <h2 id={`service-${year}`} className="text-lg font-semibold leading-6 text-accent-dark">{year}</h2>

                            <dl className="min-w-0 space-y-3 border-b border-border/70 pb-5 text-sm leading-6">
                                {roles.map((item, idx) => (
                                    <div key={idx} className="grid gap-x-5 sm:grid-cols-[150px_minmax(0,1fr)]">
                                        <dt className="font-semibold text-text">{item.role}</dt>
                                        <dd className="text-text-secondary">
                                            <Organization item={item} />
                                        </dd>
                                    </div>
                                ))}

                                {pcMembers.length > 0 && (
                                    <div className="grid gap-x-5 sm:grid-cols-[150px_minmax(0,1fr)]">
                                        <dt className="font-semibold text-text">Program committee</dt>
                                        <dd>
                                            <ul className="space-y-2 text-text-secondary">
                                                {pcMembers.map((item, idx) => (
                                                    <li key={idx}>
                                                        <Organization item={item} />
                                                    </li>
                                                ))}
                                            </ul>
                                        </dd>
                                    </div>
                                )}

                                {reviews.size > 0 && (
                                    <div className="grid gap-x-5 gap-y-1.5 sm:grid-cols-[150px_minmax(0,1fr)]">
                                        <dt className="font-medium text-text-muted">Peer review</dt>
                                        <dd>
                                            <ul className="flex flex-wrap gap-1.5 text-text-secondary">
                                                {Array.from(reviews, ([organization, count]) => (
                                                    <li key={organization} className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border/60 bg-bg-subtle/70 px-2 py-0.5 text-xs leading-5">
                                                        <span>{organization}</span>
                                                        {count > 1 && (
                                                            <span className="shrink-0 rounded bg-accent/10 px-1 text-[10px] font-semibold leading-4 text-accent-dark" title={`${count} reviews`}>
                                                                <span aria-hidden="true">×{count}</span>
                                                                <span className="sr-only">{count} reviews</span>
                                                            </span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
