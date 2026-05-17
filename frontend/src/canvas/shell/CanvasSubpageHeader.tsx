import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useTenant } from "@/tenant/TenantContext";
import { t } from "../i18n/canvas.en";

type Props = {
  title: string;
  subtitle?: string;
};

export function CanvasSubpageHeader({ title, subtitle }: Props) {
  const { embedKey } = useTenant();
  const qs = `?embedKey=${encodeURIComponent(embedKey)}`;

  return (
    <div className="mb-6 flex flex-col gap-3 border-b border-border pb-4">
      <Link
        to={`/canvas${qs}`}
        className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-3.5" />
        {t("subpage.back")}
      </Link>
      <div>
        <h1 className="font-serif text-2xl tracking-tight text-foreground">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
