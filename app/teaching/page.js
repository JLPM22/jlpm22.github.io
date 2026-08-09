import { getTeaching } from '@/lib/content';
import PageHeader from '@/components/PageHeader';

export const metadata = {
    title: 'Teaching - Jose Luis Ponton',
    description: 'Teaching experience and courses',
};

export default function TeachingPage() {
    const teachingItems = getTeaching();

    // Group by course name
    const grouped = teachingItems.reduce((acc, item) => {
        if (!acc[item.name]) acc[item.name] = { info: item, dates: [] };
        acc[item.name].dates.push(item.date);
        return acc;
    }, {});

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            <PageHeader title="Teaching" description="Courses and educational activities." />

            <div className="space-y-4">
                {Object.entries(grouped).map(([courseName, { info, dates }]) => (
                    <div key={courseName} className="bg-white rounded-xl shadow-sm border border-border px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-base font-bold text-text">
                                {info.link ? <a href={info.link} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">{courseName} <span className="text-xs text-accent" aria-hidden="true">↗</span></a> : courseName}
                            </h2>
                            <p className="text-xs text-text-muted">{info.type} · {info.where}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {dates.map((date, idx) => (
                                <span key={idx} className="inline-flex items-center px-2.5 py-1 bg-bg-subtle rounded-lg text-xs font-medium text-accent border border-border/50">
                                    {date}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
