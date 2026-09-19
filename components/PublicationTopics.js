export default function PublicationTopics({ topics = [], onSelect }) {
    if (!topics.length) return null;

    return (
        <div className="paper-topics" aria-label="Publication topics">
            <svg className="h-3 w-3 shrink-0 text-accent/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M20 13l-7 7-9-9V4h7l9 9zM8 8h.01" />
            </svg>
            {topics.map((topic, index) => (
                <span key={topic} className="inline-flex items-center gap-1.5">
                    {index > 0 && <span className="text-border" aria-hidden="true">·</span>}
                    {onSelect ? (
                        <button type="button" className="transition-colors hover:text-accent" onClick={() => onSelect(topic)}>{topic}</button>
                    ) : <span>{topic}</span>}
                </span>
            ))}
        </div>
    );
}
