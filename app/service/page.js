import { getService } from '@/lib/content';

export const metadata = {
    title: 'Service - Jose Luis Ponton',
    description: 'Academic service and responsibilities',
};

export default function ServicePage() {
    const serviceItems = getService();

    // Group items by year
    const groupedItems = serviceItems.reduce((acc, item) => {
        const year = item.year || 'Ongoing';
        if (!acc[year]) acc[year] = { roles: [], reviews: [], pcMembers: [] };

        if (item.role === 'Reviewer') {
            acc[year].reviews.push(item.organization);
        } else if (item.role === 'PC Member') {
            acc[year].pcMembers.push(item.organization);
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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            <h1 className="text-4xl font-outfit font-bold mb-10 text-text relative inline-block">
                Academic Service
                <div className="absolute -bottom-2 left-0 w-1/3 h-1 bg-accent rounded-full"></div>
            </h1>

            <div className="space-y-10">
                {sortedYears.map(year => (
                    <div key={year} className="relative pl-6 sm:pl-8 border-l-2 border-border/60 group">
                        {/* Timeline marker */}
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-bg border-2 border-accent group-hover:bg-accent transition-colors shadow-sm"></div>

                        <h2 className="text-2xl font-bold text-text mb-4 leading-none">{year}</h2>

                        <div className="bg-white rounded-xl shadow-sm border border-border p-5 space-y-6">

                            {/* Organizational Roles */}
                            {groupedItems[year].roles.length > 0 && (
                                <div className="space-y-3">
                                    {groupedItems[year].roles.map((role, idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                                            <span className="font-semibold text-text whitespace-nowrap">{role.role}:</span>
                                            <span className="text-text-secondary">{role.organization} {role.description && <span className="text-text-muted text-sm ml-1">({role.description})</span>}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Aggregated PC Members */}
                            {groupedItems[year].pcMembers.length > 0 && (
                                <div className={groupedItems[year].roles.length > 0 ? "pt-4 border-t border-border/50" : ""}>
                                    <span className="font-semibold text-text block mb-3">Program Committee</span>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.from(new Set(groupedItems[year].pcMembers)).map((org, idx) => {
                                            const count = groupedItems[year].pcMembers.filter(r => r === org).length;
                                            return (
                                                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-bg-subtle rounded-md text-xs text-text border border-border/80">
                                                    {org}
                                                    {count > 1 && (
                                                        <span className="text-[9px] font-bold text-accent bg-accent/10 px-1 py-px rounded-full">×{count}</span>
                                                    )}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Aggregated Reviews — each venue as a chip */}
                            {groupedItems[year].reviews.length > 0 && (
                                <div className={(groupedItems[year].roles.length > 0 || groupedItems[year].pcMembers.length > 0) ? "pt-4 border-t border-border/50" : ""}>
                                    <span className="font-semibold text-text block mb-3">Reviewer</span>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.from(new Set(groupedItems[year].reviews)).map((org, idx) => {
                                            const count = groupedItems[year].reviews.filter(r => r === org).length;
                                            return (
                                                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-bg-subtle rounded-md text-xs text-text border border-border/80">
                                                    {org}
                                                    {count > 1 && (
                                                        <span className="text-[9px] font-bold text-accent bg-accent/10 px-1 py-px rounded-full">×{count}</span>
                                                    )}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
