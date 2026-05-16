const STORAGE_KEY = "theme";

export function initTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const useDark = stored === "dark" || (stored !== "light" && prefersDark);
  document.documentElement.classList.toggle("dark", useDark);
}
