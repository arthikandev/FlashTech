type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  compact?: boolean;
  badge?: string;
  /** Use on brand-theme light canvas/dashboard shells */
  variant?: "marketing" | "product";
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  compact = false,
  badge,
  variant = "marketing",
}: Props) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";
  const spacing = compact ? "mb-4" : "mb-12 md:mb-16 lg:mb-20";
  const subtitleAlign = align === "center" ? "mx-auto" : "";
  const isProduct = variant === "product";

  return (
    <div className={`max-w-4xl ${spacing} ${alignClass}`}>
      {badge && (
        <span className="inline-block mb-4 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-primary">
          {badge}
        </span>
      )}
      {eyebrow && (
        <p className="mb-3 text-[10px] sm:text-xs uppercase tracking-[0.2em] bg-gradient-to-r from-primary via-primary/80 to-primary/40 bg-clip-text text-transparent">
          {eyebrow}
        </p>
      )}
      <h2
        className={
          isProduct
            ? "text-2xl sm:text-3xl font-serif text-foreground leading-tight tracking-tight"
            : "text-3xl sm:text-4xl md:text-5xl font-serif text-[#E1E0CC] leading-[1.1] tracking-tight"
        }
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 md:mt-6 text-sm sm:text-base leading-relaxed max-w-2xl ${subtitleAlign} ${
            isProduct ? "text-muted-foreground" : "text-gray-500"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
