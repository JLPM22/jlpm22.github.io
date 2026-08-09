export default function PageHeader({ title, description, children, className = '' }) {
  return (
    <header className={`flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10 ${className}`}>
      <div>
        <h1 className="text-4xl font-outfit font-bold text-text relative inline-block">
          {title}
          <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-accent/60 rounded-full" aria-hidden="true"></span>
        </h1>
        {description && <p className="mt-5 text-text-secondary max-w-2xl">{description}</p>}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </header>
  );
}
