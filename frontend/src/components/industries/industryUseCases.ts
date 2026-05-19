import type { LucideIcon } from "lucide-react";
import { INDUSTRY_CATEGORIES } from "@/lib/categories/industryCategories";

export type IndustryUseCase = {
  id: string;
  name: string;
  badge: string;
  stat: string;
  description: string;
  icon: LucideIcon;
  samplePrompt: string;
  code: string;
};

export const INDUSTRY_USE_CASES: IndustryUseCase[] = INDUSTRY_CATEGORIES.map((c) => ({
  id: c.industryKey,
  code: c.code,
  name: c.name,
  badge: c.tag,
  stat: c.statHighlight,
  description: c.description,
  icon: c.icon,
  samplePrompt: c.samplePrompt,
}));
