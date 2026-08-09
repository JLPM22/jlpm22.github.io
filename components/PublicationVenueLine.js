'use client';

const DEFAULT_COLOR = '#64748b';

export default function PublicationVenueLine({ paper, venueColors = {}, onVenueClick, className = '' }) {
  const conference = paper.venueTag || paper.journalConference || (paper.type === 'Conference' ? paper.displayVenue || paper.venue : '');
  const journal = paper.type === 'Journal' ? paper.venue : '';
  const conferenceYear = paper.conferenceYear || paper.year;
  const conferenceColor = venueColors[paper.venueTag] || DEFAULT_COLOR;
  const journalColor = venueColors[journal] || conferenceColor;

  const activate = (event, value) => {
    event.preventDefault();
    event.stopPropagation();
    if (value && onVenueClick) onVenueClick(value);
  };

  return (
    <div className={`flex min-w-0 flex-col items-start gap-0.5 text-[11px] font-bold uppercase tracking-wider sm:flex-row sm:items-center sm:gap-1.5 ${className}`}>
      {conference && (
        <button type="button" className="truncate hover:underline underline-offset-2" style={{ color: conferenceColor }} onClick={(event) => activate(event, paper.venueTag || conference)} title={paper.journalConference || conference}>
          {conference}{conferenceYear ? ` · ${conferenceYear}` : ''}
        </button>
      )}
      {conference && journal && <span className="hidden text-border sm:inline">/</span>}
      {journal && (
        <button type="button" className="truncate hover:underline underline-offset-2" style={{ color: journalColor }} onClick={(event) => activate(event, journal)} title={journal}>
          {paper.publisher ? `${paper.publisher} · ` : ''}{journal}{!conference && paper.year ? ` · ${paper.year}` : ''}
        </button>
      )}
    </div>
  );
}
