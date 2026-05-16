import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "@/landing/components/AnimatedCounter";

type Props = {
  value: string;
  label: string;
  trend?: string;
  icon?: LucideIcon;
  className?: string;
  animateValue?: boolean;
};

export function StatCard({
  value,
  label,
  trend,
  icon: Icon,
  className = "",
  animateValue = false,
}: Props) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 0 24px rgba(222,219,200,0.08)" }}
      className={`gradient-border rounded-xl p-4 hover-lift ${className}`}
    >
      <motion.div className="flex items-start justify-between gap-2">
        {Icon && (
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
        {trend && (
          <span className="text-xs font-medium text-emerald-400">{trend}</span>
        )}
      </motion.div>
      <p className="mt-3 text-2xl font-semibold text-primary font-serif">
        {animateValue ? (
          <AnimatedCounter value={value} />
        ) : (
          value
        )}
      </p>
      <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wide">{label}</p>
      <div className="mt-3 flex items-end gap-0.5 h-6">
        {[40, 55, 45, 70, 60, 85, 75].map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t bg-primary/30 min-w-[3px]"
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.05 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
