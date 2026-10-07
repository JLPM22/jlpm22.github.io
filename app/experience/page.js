import { getExperience, getProfile } from '@/lib/content';
import PageHeader from '@/components/PageHeader';
import icons from '@/components/SocialIcons';
import styles from './experience.module.css';

export const metadata = {
  title: 'Experience & Education',
  description: 'Research and industry experience, and academic education of Jose Luis Ponton.',
};

function formatDate(value) {
  if (/^(now|present)$/i.test(value)) return 'Present';
  return value.replace(/^([a-z]{3})[a-z]*,?\s+/i, '$1 ');
}

function Description({ text }) {
  const formattedText = text.replace(/\.\s+(?=\S)/g, (match, offset) => {
    const precedingText = text.slice(0, offset);
    const abbreviation = /\b(?:Dr|Prof|Mr|Mrs|Ms|Sr|Jr|St|Ph\.D|M\.Sc|B\.Sc|e\.g|i\.e)$/i.test(precedingText);
    const initial = /(?:^|\s)[A-Z]$/.test(precedingText);
    return abbreviation || initial ? match : '.\n';
  });
  return formattedText.split(/(https?:\/\/[^\s]+)/g).map((part, index) => {
    if (!/^https?:\/\//.test(part)) return part;
    const url = part.replace(/[.,;]+$/, '');
    return <span key={index}><a href={url} target="_blank" rel="noopener noreferrer">{url}</a>{part.slice(url.length)}</span>;
  });
}

function CompanyLogo({ group }) {
  const image = (
    <span className={styles.logoArtwork}>
      <img src={group.logoUrl} alt="" loading="lazy" />
    </span>
  );
  return group.url ? (
    <a href={group.url} target="_blank" rel="noopener noreferrer" className={styles.logo} aria-label={`Visit ${group.company} website`}>
      {image}
    </a>
  ) : <div className={styles.logo}>{image}</div>;
}

function ExperienceSection({ id, title, groups }) {
  return (
    <section className={styles.section} aria-labelledby={id}>
      <h2 id={id} className="section-label">{title}</h2>
      {groups.length > 0 ? groups.map(group => (
        <article key={group.company} className={styles.company}>
          <header className={styles.companyHeading}>
            {group.logoUrl && <CompanyLogo group={group} />}
            <h3 className={group.logoUrl ? 'sr-only' : undefined}>{group.company}</h3>
          </header>
          <ol className={styles.roles}>
            {group.roles.map(role => (
              <li key={[role.title, role.startDate, role.endDate].join('-')} className={styles.role}>
                <p className={styles.dates}>
                  {formatDate(role.startDate)}
                  {role.startDate && role.endDate && ' – '}
                  {formatDate(role.endDate)}
                </p>
                <h4>{role.title}</h4>
                {role.description && <p className={styles.description}><Description text={role.description} /></p>}
              </li>
            ))}
          </ol>
        </article>
      )) : <p className={styles.empty}>No entries have been added yet.</p>}
    </section>
  );
}

export default function ExperiencePage() {
  const { work, education } = getExperience();
  const linkedinUrl = getProfile().social?.linkedin;

  return (
    <div className={styles.page}>
      <PageHeader title="Experience & Education" description="Research, industry experience, and academia.">
        {linkedinUrl && (
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className={styles.linkedinLink}>
            <span aria-hidden="true">{icons.linkedin}</span>
            View LinkedIn profile
          </a>
        )}
      </PageHeader>
      <ExperienceSection id="work-experience" title="Work experience" groups={work} />
      <ExperienceSection id="education" title="Education" groups={education} />
    </div>
  );
}
