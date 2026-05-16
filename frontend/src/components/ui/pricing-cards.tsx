import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { cn } from "@/lib/utils";

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  annualPrice?: string;
  description: string;
  features: string[];
  cta: string;
  ctaTo: string;
  highlighted?: boolean;
}

export interface PricingCardsProps {
  heading?: string;
  description?: string;
  plans?: PricingPlan[];
}

function useParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const setSize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect?.width ?? window.innerWidth));
      const h = Math.max(1, Math.floor(rect?.height ?? 600));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize();

    type P = { x: number; y: number; v: number; o: number };
    let parts: P[] = [];
    let raf = 0;

    const init = () => {
      parts = [];
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      const count = Math.floor((w * h) / 10000);
      for (let i = 0; i < count; i++) {
        parts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          v: Math.random() * 0.25 + 0.05,
          o: Math.random() * 0.25 + 0.1,
        });
      }
    };

    const draw = () => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);
      parts.forEach((p) => {
        p.y -= p.v;
        if (p.y < 0) {
          p.x = Math.random() * w;
          p.y = h + 20;
        }
        ctx.fillStyle = `rgba(120, 120, 128, ${p.o})`;
        ctx.fillRect(p.x, p.y, 0.7, 2.2);
      });
      raf = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(() => {
      setSize();
      init();
    });
    ro.observe(canvas.parentElement || document.body);
    init();
    raf = requestAnimationFrame(draw);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return canvasRef;
}

export function PricingCards({
  heading = "Plans & Pricing",
  description = "Choose the plan that matches your embed footprint and demo scale.",
  plans = [],
}: PricingCardsProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const canvasRef = useParticleCanvas();

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section
      id="pricing"
      className={cn(
        "pricing-section relative w-full overflow-hidden isolate py-24 md:py-32 bg-background text-foreground",
        ready && "is-ready"
      )}
    >
      <style>{`
        .pricing-section .accent-lines{position:absolute;inset:0;pointer-events:none;opacity:.5}
        .pricing-section .hline,.pricing-section .vline{position:absolute;background:var(--border)}
        .pricing-section .hline{left:0;right:0;height:1px;transform:scaleX(0)}
        .pricing-section .vline{top:0;bottom:0;width:1px;transform:scaleY(0)}
        .pricing-section.is-ready .hline:nth-of-type(1){top:18%;animation:pricingDrawX .6s ease .08s forwards}
        .pricing-section.is-ready .hline:nth-of-type(2){top:50%;animation:pricingDrawX .6s ease .16s forwards}
        .pricing-section.is-ready .hline:nth-of-type(3){top:82%;animation:pricingDrawX .6s ease .24s forwards}
        .pricing-section.is-ready .vline:nth-of-type(1){left:18%;animation:pricingDrawY .7s ease .20s forwards}
        .pricing-section.is-ready .vline:nth-of-type(2){left:50%;animation:pricingDrawY .7s ease .28s forwards}
        .pricing-section.is-ready .vline:nth-of-type(3){left:82%;animation:pricingDrawY .7s ease .36s forwards}
        @keyframes pricingDrawX{to{transform:scaleX(1)}}
        @keyframes pricingDrawY{to{transform:scaleY(1)}}
        .pricing-section .kicker,.pricing-section .title,.pricing-section .subtitle{opacity:0;transform:translateY(8px)}
        .pricing-section.is-ready .kicker{animation:pricingKIn .5s ease .08s forwards}
        .pricing-section.is-ready .title{animation:pricingTIn .6s cubic-bezier(.22,1,.36,1) .16s forwards}
        .pricing-section.is-ready .subtitle{animation:pricingSIn .6s ease .26s forwards}
        @keyframes pricingKIn{to{opacity:.9;transform:none}}
        @keyframes pricingTIn{to{opacity:1;transform:none}}
        @keyframes pricingSIn{to{opacity:1;transform:none}}
        .pricing-section .card-animate{opacity:0;transform:translateY(12px)}
        .pricing-section.is-ready .card-animate{animation:pricingFadeUp .6s ease forwards}
        @keyframes pricingFadeUp{to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_12%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_60%)]" />

      <div aria-hidden className="accent-lines">
        <div className="hline" />
        <div className="hline" />
        <div className="hline" />
        <div className="vline" />
        <div className="vline" />
        <div className="vline" />
      </div>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-40 pointer-events-none"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mx-auto mb-12 max-w-3xl">
          <p className="kicker mb-2 text-xs uppercase tracking-[0.2em] text-primary">Pricing</p>
          <h2 className="title mb-4 font-serif text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground">
            {heading}
          </h2>
          <p className="subtitle text-lg text-muted-foreground">{description}</p>

          <div className="subtitle mt-8 inline-flex items-center border border-border bg-card/80 p-1 backdrop-blur">
            <button
              type="button"
              aria-pressed={!isAnnual}
              onClick={() => setIsAnnual(false)}
              className={cn(
                "px-5 py-2 text-sm font-medium transition-colors",
                !isAnnual ? "bg-primary text-[var(--primary-foreground)]" : "text-muted-foreground"
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              aria-pressed={isAnnual}
              onClick={() => setIsAnnual(true)}
              className={cn(
                "px-5 py-2 text-sm font-medium transition-colors",
                isAnnual ? "bg-primary text-[var(--primary-foreground)]" : "text-muted-foreground"
              )}
            >
              Annual
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={cn(
                "card-animate relative flex flex-col border p-6 md:p-8 text-left transition-all duration-300",
                plan.highlighted
                  ? "border-primary/50 bg-card shadow-xl shadow-primary/15 md:scale-[1.03] z-10"
                  : "border-border bg-card/80 backdrop-blur hover:border-primary/20"
              )}
              style={{ animationDelay: `${0.32 + index * 0.08}s` }}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 border border-primary/40 bg-card px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary whitespace-nowrap">
                  Upgrade plan
                </span>
              )}
              <h3 className="text-xl font-medium text-foreground">{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">
                  {isAnnual && plan.annualPrice ? plan.annualPrice : plan.price}
                </span>
                {plan.price !== "Custom" && (
                  <span className="text-sm text-muted-foreground">
                    /{isAnnual ? "year" : "month"}
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>
              <ul className="mt-6 mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {plan.highlighted ? (
                <ShimmerButton
                  type="button"
                  className="w-full h-12 text-sm font-semibold text-[var(--primary-foreground)]"
                  background="var(--primary)"
                  shimmerColor="var(--primary-foreground)"
                  borderRadius="0"
                  onClick={() => navigate(plan.ctaTo)}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </ShimmerButton>
              ) : (
                <Link
                  to={plan.ctaTo}
                  className="inline-flex w-full items-center justify-center gap-2 border border-border bg-background py-3 text-sm font-semibold text-foreground hover:bg-card transition-colors"
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
