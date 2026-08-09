'use client';

import { useEffect, useState } from 'react';

const MONTHS = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

function publishedWithinFiveMonths(year, month) {
  const publicationYear = Number(year);
  const publicationMonth = MONTHS[String(month || '').trim().toLowerCase()];
  if (!Number.isFinite(publicationYear) || publicationMonth == null) return false;

  const now = new Date();
  const ageInMonths = (now.getFullYear() - publicationYear) * 12 + now.getMonth() - publicationMonth;
  return ageInMonths >= 0 && ageInMonths < 5;
}

export default function NewPublicationBadge({ year, month, className = '' }) {
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    setIsNew(publishedWithinFiveMonths(year, month));
  }, [year, month]);

  if (!isNew) return null;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-300/80 bg-gradient-to-r from-amber-50 to-yellow-100 px-2 py-1 text-[9px] font-bold uppercase leading-none tracking-[0.12em] text-amber-800 shadow-sm ${className}`}
      title="Published within the last five months"
      aria-label="New publication"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
      New
    </span>
  );
}
