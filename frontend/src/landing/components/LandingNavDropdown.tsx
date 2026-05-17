import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLandingLocale } from "../i18n/LandingLocaleProvider";
import type { MessageKey } from "../i18n/messages";
import { NAV_LINK_CLASS } from "../nav";
import type { NavDropdownChild, NavDropdownItem } from "../nav";

type Props = {
  item: NavDropdownItem;
  variant?: "desktop" | "mobile";
  /** Use `motion.div` when not inside a `<ul>` (e.g. hero overlay nav). */
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

  const triggerClass = cn(NAV_LINK_CLASS, linkClassName);

  const close = () => {
    setOpen(false);
    onNavigate?.();
  };

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (variant === "mobile") {
    return (
      <div ref={rootRef as never} className="border-b border-white/10 last:border-0">
        <button
          type="button"
          className="flex w-full items-center justify-between py-3.5 text-base font-medium text-[#E1E0CC]"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((o) => !o)}
        >
          {t(item.key)}
          <ChevronDown
            className={cn("size-4 text-[#E1E0CC]/60 transition-transform", open && "rotate-180")}
          />
        </button>
        {open ? (
          <ul id={menuId} className="space-y-0.5 pb-3 pl-2">
            {item.children.map((child) => (
              <li key={child.key}>
                <DropdownChildLink
                  child={child}
                  t={t}
                  className="block rounded-lg py-2.5 pl-2 pr-3 text-sm text-[#E1E0CC]/75 hover:bg-white/5 hover:text-[#fdfcf8]"
                  onNavigate={close}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
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
          className={cn(
            "size-3.5 shrink-0 text-[#E1E0CC]/55 transition-transform",
            open && "rotate-180"
          )}
          strokeWidth={2}
          aria-hidden
        />
      </button>
      {open ? (
        <div className="absolute left-1/2 top-full z-[80] -translate-x-1/2 pt-1.5">
          <NavDropdownPanel id={menuId}>
            {item.children.map((child) => (
              <DropdownChildLink
                key={child.key}
                child={child}
                t={t}
                className="block rounded-lg px-3 py-2 text-sm text-[#E1E0CC]/85 hover:bg-white/8 hover:text-[#fdfcf8] transition-colors"
                onNavigate={close}
              />
            ))}
          </NavDropdownPanel>
        </div>
      ) : null}
    </Wrapper>
  );
}

function NavDropdownPanel({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div
      id={id}
      role="menu"
      className="max-h-[min(70vh,22rem)] min-w-[13.5rem] overflow-y-auto rounded-xl border border-white/12 bg-[#141414]/96 py-1.5 px-1 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.85)] backdrop-blur-xl scrollbar-thin"
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
      {desc ? <span className="mt-0.5 block text-xs text-[#E1E0CC]/50">{desc}</span> : null}
    </>
  );

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onNavigate();
    if (child.href?.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(child.href);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (child.to) {
    return (
      <Link to={child.to} className={className} role="menuitem" onClick={onNavigate}>
        {inner}
      </Link>
    );
  }

  return (
    <a
      href={child.href ?? "#"}
      className={className}
      role="menuitem"
      onClick={handleAnchorClick}
    >
      {inner}
    </a>
  );
}
