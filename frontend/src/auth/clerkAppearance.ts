export type ClerkThemeMode = "light" | "dark";

const clerkFont = '"Almarai", system-ui, sans-serif';

const clerkDarkVariables = {
  colorPrimary: "#dedbc8",
  colorBackground: "#141414",
  colorInputBackground: "#1a1a1a",
  colorInputText: "#e1e0cc",
  colorText: "#e1e0cc",
  colorTextSecondary: "#94a3b8",
  colorForeground: "#e1e0cc",
  colorMutedForeground: "#94a3b8",
  colorNeutral: "#e1e0cc",
  colorDanger: "#f87171",
  colorPopover: "#1a1a1a",
  borderRadius: "0.75rem",
  fontFamily: clerkFont,
} as const;

const clerkLightVariables = {
  colorPrimary: "#b8b49a",
  colorBackground: "#ffffff",
  colorInputBackground: "#f8f8f6",
  colorInputText: "#1a1a1a",
  colorText: "#1a1a1a",
  colorTextSecondary: "#64748b",
  colorForeground: "#1a1a1a",
  colorMutedForeground: "#64748b",
  colorNeutral: "#1a1a1a",
  colorDanger: "#dc2626",
  colorPopover: "#ffffff",
  borderRadius: "0.75rem",
  fontFamily: clerkFont,
} as const;

/** UserButton popover — dark surfaces */
export const clerkUserButtonElementsDark = {
  userButtonPopoverCard:
    "rounded-xl border border-white/12 bg-[#1a1a1a] shadow-[0_18px_50px_-12px_rgba(0,0,0,0.85)]",
  userButtonPopoverMain: "bg-[#1a1a1a]",
  userButtonPopoverActions: "bg-[#1a1a1a] p-1",
  userButtonPopoverActionButton:
    "text-[#e1e0cc] hover:bg-white/8 transition-colors rounded-lg",
  userButtonPopoverActionButtonText: "text-[#e1e0cc] font-medium",
  userButtonPopoverActionButtonIcon: "text-[#e1e0cc]",
  userPreview: "gap-3 px-4 py-3 border-b border-white/10",
  userPreviewTextContainer: "min-w-0",
  userPreviewMainIdentifier: "text-[#fdfcf8] font-medium truncate",
  userPreviewSecondaryIdentifier: "text-[#94a3b8] text-sm truncate",
  userButtonPopoverFooter: "bg-[#141414] border-t border-white/10",
} as const;

const clerkUserButtonElementsLight = {
  userButtonPopoverCard:
    "rounded-xl border border-black/10 bg-white shadow-[0_18px_50px_-12px_rgba(0,0,0,0.12)]",
  userButtonPopoverMain: "bg-white",
  userButtonPopoverActions: "bg-white p-1",
  userButtonPopoverActionButton:
    "text-[#1a1a1a] hover:bg-black/5 transition-colors rounded-lg",
  userButtonPopoverActionButtonText: "text-[#1a1a1a] font-medium",
  userButtonPopoverActionButtonIcon: "text-[#1a1a1a]",
  userPreview: "gap-3 px-4 py-3 border-b border-black/8",
  userPreviewTextContainer: "min-w-0",
  userPreviewMainIdentifier: "text-[#1a1a1a] font-medium truncate",
  userPreviewSecondaryIdentifier: "text-[#64748b] text-sm truncate",
  userButtonPopoverFooter: "bg-[#fafaf9] border-t border-black/8",
} as const;

function authFormElements(mode: ClerkThemeMode) {
  const dark = mode === "dark";
  return {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: dark
      ? "rounded-2xl border border-[#2a2a2a] bg-[#141414] shadow-none"
      : "rounded-2xl border border-[#e4e4e7] bg-white shadow-none",
    header: "hidden",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    logoBox: "hidden",
    logoImage: "hidden",
    socialButtonsBlockButton: dark
      ? "border border-[#2a2a2a] bg-[#1a1a1a] text-[#e1e0cc] hover:bg-[#222222] transition-colors [&_.cl-socialButtonsBlockButtonText]:text-[#e1e0cc]"
      : "border border-[#e4e4e7] bg-[#f4f4f5] text-[#1a1a1a] hover:bg-[#ececec] transition-colors [&_.cl-socialButtonsBlockButtonText]:text-[#1a1a1a]",
    socialButtonsBlockButtonText: dark ? "text-[#e1e0cc] font-medium" : "text-[#1a1a1a] font-medium",
    socialButtonsBlockButtonArrow: dark ? "text-[#e1e0cc]" : "text-[#1a1a1a]",
    formButtonPrimary:
      "bg-[#dedbc8] text-black font-semibold hover:bg-[#d4d1bc] transition-colors shadow-none [&>span]:text-black",
    formFieldInput: dark
      ? "bg-[#1a1a1a] border-[#2a2a2a] text-[#e1e0cc] placeholder:text-[#6b7280] focus:border-[#dedbc8]/50"
      : "bg-[#f8f8f6] border-[#e4e4e7] text-[#1a1a1a] placeholder:text-[#94a3b8] focus:border-[#b8b49a]",
    formFieldLabel: dark ? "text-[#94a3b8]" : "text-[#64748b]",
    dividerLine: dark ? "bg-[#2a2a2a]" : "bg-[#e4e4e7]",
    dividerText: dark ? "text-[#6b7280]" : "text-[#94a3b8]",
    footer: "hidden",
    footerAction: "hidden",
    footerActionLink: "hidden",
    footerPages: "hidden",
    identityPreviewEditButton: "text-[#b8b49a]",
    formFieldInputShowPasswordButton: dark ? "text-[#94a3b8]" : "text-[#64748b]",
    alertText: dark ? "text-[#e1e0cc]" : "text-[#1a1a1a]",
    formResendCodeLink: "text-[#b8b49a] hover:underline",
    alternativeMethodsBlockButton: dark
      ? "text-[#e1e0cc] border-[#2a2a2a]"
      : "text-[#1a1a1a] border-[#e4e4e7]",
  };
}

/** Sign-in / sign-up Clerk card for the active theme */
export function buildAuthClerkAppearance(mode: ClerkThemeMode = "dark") {
  const dark = mode === "dark";
  return {
    variables: dark ? clerkDarkVariables : clerkLightVariables,
    layout: {
      socialButtonsPlacement: "top" as const,
      showOptionalFields: false,
    },
    options: {
      unsafe_disableDevelopmentModeWarnings: true,
    },
    elements: {
      ...authFormElements(mode),
      ...(dark ? clerkUserButtonElementsDark : clerkUserButtonElementsLight),
    },
  };
}

/** @deprecated Use buildAuthClerkAppearance(mode) or useAuthClerkAppearance() */
export const authClerkAppearance = buildAuthClerkAppearance("dark");

export const clerkUserButtonElements = clerkUserButtonElementsDark;

/** Per-component UserButton overrides */
export function clerkUserButtonAppearance(
  mode: ClerkThemeMode = "dark",
  extra?: Record<string, string>
) {
  const dark = mode === "dark";
  return {
    variables: dark ? clerkDarkVariables : clerkLightVariables,
    elements: {
      ...(dark ? clerkUserButtonElementsDark : clerkUserButtonElementsLight),
      avatarBox: "w-9 h-9 ring-2 ring-[#dedbc8]/35",
      ...extra,
    },
  };
}
