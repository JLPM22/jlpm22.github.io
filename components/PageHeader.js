export default function PageHeader({ title, description, children, className = '', childrenClassName = '' }) {
  return (
    <header className={`page-header flex flex-col md:flex-row md:items-end justify-between gap-5 ${className}`}>
      <div>
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {children && <div className={`shrink-0 ${childrenClassName}`}>{children}</div>}
    </header>
  );
}
