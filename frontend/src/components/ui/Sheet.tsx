import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "right" | "left";
};

export function Sheet({
  open,
  onClose,
  title,
  children,
  side = "right",
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const slideFrom = side === "right" ? { x: "100%" } : { x: "-100%" };
  const position = side === "right" ? "right-0" : "left-0";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-modal
            aria-label={title}
            className={`fixed top-0 ${position} z-50 h-full w-full max-w-md glass-panel border-[#212121] flex flex-col shadow-2xl`}
            initial={slideFrom}
            animate={{ x: 0 }}
            exit={slideFrom}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="flex items-center justify-between border-b border-[#212121] px-5 py-4">
              {title && (
                <h2 className="text-sm font-medium text-[#E1E0CC]">{title}</h2>
              )}
              <button
                type="button"
                onClick={onClose}
                className="ml-auto rounded-lg p-2 text-gray-500 hover:bg-white/5 hover:text-[#E1E0CC]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
