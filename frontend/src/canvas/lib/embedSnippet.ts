import { getBackendBaseUrl } from "@/lib/backendUrl";

export function buildEmbedSnippet(embedKey: string): string {
  const base = getBackendBaseUrl().replace(/\/$/, "");
  return `<script src="${base}/api/embed/${embedKey}" async></script>`;
}
