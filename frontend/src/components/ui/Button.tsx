import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-black hover:bg-primary/90 font-medium",
  secondary:
    "bg-[#212121] text-[#E1E0CC] border border-[#212121] hover:border-primary/30",
  ghost: "text-gray-400 hover:text-[#E1E0CC] hover:bg-white/5",
  outline:
    "border border-primary/40 text-primary hover:bg-primary/10",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: Props) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
