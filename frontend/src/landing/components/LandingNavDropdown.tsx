import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLandingLocale } from "../i18n/LandingLocaleProvider";
import type { MessageKey } from "../i18n/messages";
import type { NavDropdownChild, NavDropdownItem } from "../nav";

type Props = {
  item: NavDropdownItem;
  variant?: "desktop" | "mobile";
  /** Use `div` when not inside a `<ul>` (e.g. hero overlay nav). */
  wrapper?: "li" | "div";
  onNavigate?: () => void;
  linkClassName?: string;
};

function childLabel(child: NavDropdownChild, t: (key: MessageKey) => string): string {
  return child.label ?? t(child.key);
}

export function LandingNavDropdown({
  item,
  variant = "desktop",
  wrapper = "li",
  onNavigate,
  linkClassName,
}: Props) {
  const { t } = useLandingLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLLIElement & HTMLDivElement>(null);
  const Wrapper = wrapper === "li" ? "li" : "div";
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const triggerClass = cn(
    "inline-flex items-center gap-1 rounded-sm transition-colors whitespace-nowrap",
    linkClassName,
    item.emphasize && "font-semibold text-primary hover:text-primary/90"
  );

  const close = () => {
    setOpen(false);
    onNavigate?.();
  };

  if (variant === "mobile") {
    return (
      <li ref={rootRef} className="border-b border-border/60 last:border-0">
        <button
          type="button"
          className="flex w-full items-center justify-between py-3.5 text-base font-medium text-foreground"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((o) => !o)}
        >
          {t(item.key)}
          <ChevronDown
            className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")}
          />
        </button>
        {open ? (
          <ul id={menuId} className="pb-3 pl-3 space-y-1">
            {item.children.map((child) => (
              <li key={child.key}>
                <DropdownChildLink
                  child={child}
                  t={t}
                  className="block py-2.5 text-sm text-muted-foreground hover:text-foreground"
                  onNavigate={close}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </li>
    );
  }

  return (
    <Wrapper
      ref={rootRef as never}
      className="relative shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={triggerClass}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
      >
        {t(item.key)}
        <ChevronDown
          className={cn("size-3.5 opacity-70 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open ? (
        <NavDropdownPanel id={menuId}>
          {item.children.map((child) => (
            <DropdownChildLink
              key={child.key}
              child={child}
              t={t}
              className="block rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-white/8 hover:text-foreground transition-colors"
              onNavigate={close}
            />
          ))}
        </NavDropdownPanel>
      ) : null}
    </Wrapper>
  );
}

function NavDropdownPanel({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div
      id={id}
      role="menu"
      className="absolute left-1/2 top-[calc(100%+0.5rem)] z-50 min-w-[13rem] -translate-x-1/2 rounded-xl border border-white/12 bg-[#141414]/95 py-1.5 px-1 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.85)] backdrop-blur-xl"
    >
      {children}
    </div>
  );
}

function DropdownChildLink({
  child,
  t,
  className,
  onNavigate,
}: {
  child: NavDropdownChild;
  t: (key: MessageKey) => string;
  className: string;
  onNavigate: () => void;
}) {
  const label = childLabel(child, t);
  const desc = child.description ? t(child.description) : null;

  const inner = (
    <>
      <span className="font-medium">{label}</span>
      {desc ? <span className="mt-0.5 block text-xs text-foreground/55">{desc}</span> : null}
    </>
  );

  if (child.to) {
    return (
      <Link to={child.to} className={className} onClick={onNavigate}>
        {inner}
      </Link>
    );
  }

  return (
    <a href={child.href ?? "#"} className={className} onClick={onNavigate}>
      {inner}
    </a>
  );
}
