/** Shared Clerk styling for login / register — matches PresenceIQ brand. */
export const authClerkAppearance = {
  variables: {
    colorPrimary: "#dedbc8",
    colorBackground: "#141414",
    colorInputBackground: "#1a1a1a",
    colorInputText: "#e1e0cc",
    colorText: "#e1e0cc",
    colorTextSecondary: "#94a3b8",
    colorDanger: "#f87171",
    borderRadius: "0.75rem",
    fontFamily: '"Almarai", system-ui, sans-serif',
  },
  layout: {
    socialButtonsPlacement: "top" as const,
    showOptionalFields: false,
  },
  options: {
    unsafe_disableDevelopmentModeWarnings: true,
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "rounded-2xl border border-[#2a2a2a] bg-[#141414] shadow-[0_24px_80px_rgba(0,0,0,0.45)]",
    header: "hidden",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    logoBox: "hidden",
    logoImage: "hidden",
    socialButtonsBlockButton:
      "border border-[#2a2a2a] bg-[#1a1a1a] text-[#e1e0cc] hover:bg-[#222222] transition-colors",
    formButtonPrimary:
      "bg-[#dedbc8] text-black font-medium hover:bg-[#d4d1bc] transition-colors shadow-none",
    formFieldInput:
      "bg-[#1a1a1a] border-[#2a2a2a] text-[#e1e0cc] focus:border-[#dedbc8]/50",
    formFieldLabel: "text-[#94a3b8]",
    dividerLine: "bg-[#2a2a2a]",
    dividerText: "text-[#6b7280]",
    footer: "hidden",
    footerAction: "hidden",
    footerActionLink: "hidden",
    footerPages: "hidden",
    identityPreviewEditButton: "text-[#dedbc8]",
    formFieldInputShowPasswordButton: "text-[#94a3b8]",
    alertText: "text-[#e1e0cc]",
    formResendCodeLink: "text-[#dedbc8]",
  },
};
