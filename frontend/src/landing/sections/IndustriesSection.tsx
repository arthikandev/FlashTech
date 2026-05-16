import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Code,
  Heart,
  Hotel,
  ShoppingBag,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLandingLocale } from "../i18n/LandingLocaleProvider";

const INDUSTRIES: Array<{
  name: string;
  badge: string;
  stat: string;
  desc: string;
  icon: LucideIcon;
  demoTo: string;
}> = [
  {
    name: "Banks & Fintechs",
    badge: "Highest value",
    stat: "2.1× qualified leads",
    desc: "Avatar greets returning customers by name, detects churn risk or upsell opportunity, and routes them perfectly.",
    icon: Building2,
    demoTo: "/demos/seylan",
  },
  {
    name: "SaaS Companies",
    badge: "Largest market",
    stat: "3× trial conversion",
    desc: "Trial user on day 6 visits pricing — avatar knows usage data and converts with a targeted offer.",
    icon: Code,
    demoTo: "/demos/cloudmetrics",
  },
  {
    name: "Hotels & Tourism",
    badge: "Strong for demo",
    stat: "40% faster booking",
    desc: "Returning guest greeted by name with room preferences and last-stay feedback. Upsells before they ask.",
    icon: Hotel,
    demoTo: "/demos/seylan",
  },
  {
    name: "Hospitals & Healthcare",
    badge: "Local relevance",
    stat: "Multilingual intake",
    desc: "Patient avatar knows appointment type and preferred language. Care team gets a pre-brief via n8n.",
    icon: Heart,
    demoTo: "/demos/coral",
  },
  {
    name: "E-commerce & Retail",
    badge: "High volume",
    stat: "28% cart recovery",
    desc: "Avatar knows cart history and browse behaviour. Greets with relevant suggestions and time-sensitive offers.",
    icon: ShoppingBag,
    demoTo: "/demos/coral",
  },
  {
    name: "HR & Recruitment",
    badge: "Strong story",
    stat: "50% faster screen",
    desc: "Interview avatar knows the CV and role before the call. Opens with a personalised question.",
    icon: Users,
    demoTo: "/demos/cloudmetrics",
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function IndustriesSection() {
  const { t } = useLandingLocale();

  return (
    <section id="industries" className="section-pad bg-[#101010] px-4">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          eyebrow={t("industries.eyebrow")}
          title={t("industries.title")}
          subtitle={t("industries.subtitle")}
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INDUSTRIES.map((ind, i) => {
            const Icon = ind.icon;
            return (
              <motion.article
                key={ind.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.06, duration: 0.5, ease }}
                className="rounded-2xl border border-[#212121] bg-black p-5 flex flex-col gap-3 hover-lift gradient-mesh"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-primary">
                    {ind.badge}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-[#E1E0CC]">{ind.name}</h3>
                <p className="text-sm font-serif text-primary/90">{ind.stat}</p>
                <p className="text-sm text-gray-500 leading-relaxed flex-1">{ind.desc}</p>
                <Link
                  to={ind.demoTo}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:opacity-80 mt-1"
                >
                  View demo
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
