import { useEffect, useRef, useState } from "react";

type Item = {
  label: string;
  onClick?: () => void;
  href?: string;
  destructive?: boolean;
};

type Props = {
  trigger: React.ReactNode;
  items: Item[];
  align?: "left" | "right";
};

export function Dropdown({ trigger, items, align = "right" }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button type="button" className="contents" onClick={() => setOpen((o) => !o)}>
        {trigger}
      </button>
      {open && (
        <div
          className={`absolute top-full mt-2 min-w-[180px] rounded-xl glass-panel border border-[#212121] py-1 shadow-xl z-50 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {items.map((item) =>
            item.href ? (
              <a
                key={item.label}
                href={item.href}
                className="block px-4 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-[#E1E0CC]"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ) : (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 ${
                  item.destructive
                    ? "text-rose-400 hover:text-rose-300"
                    : "text-gray-400 hover:text-[#E1E0CC]"
                }`}
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
