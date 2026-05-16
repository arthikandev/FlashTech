type Props = {
  label?: string;
  title: string;
  description?: string;
};

export function PageHeader({ label, title, description }: Props) {
  return (
    <header className="mb-8 md:mb-10">
      {label && (
        <p className="text-primary text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-3">
          {label}
        </p>
      )}
      <h1 className="font-serif text-3xl sm:text-4xl md:text-[2.75rem] font-medium text-foreground tracking-tight leading-[1.05]">
        {title}
      </h1>
      {description && (
        <p className="text-muted-foreground text-sm md:text-base mt-3 max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
    </header>
  );
}
