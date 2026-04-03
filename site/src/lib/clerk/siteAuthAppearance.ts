import { dark } from "@clerk/themes";

/**
 * Dark auth UI: light foreground on navy (no charcoal-on-navy).
 * Uses Clerk Variables for tokens that drive labels/muted text, plus elements for overrides.
 */
export const siteAuthAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: "#2f8cff",
    colorPrimaryForeground: "#ffffff",
    colorTextOnPrimaryBackground: "#ffffff",
    colorForeground: "#f8fafc",
    colorMutedForeground: "#cbd5e1",
    colorText: "#f8fafc",
    colorTextSecondary: "#cbd5e1",
    colorBackground: "transparent",
    colorInput: "#040d18",
    colorInputBackground: "#040d18",
    colorInputForeground: "#f8fafc",
    colorInputText: "#f8fafc",
    /** Dark theme: neutral should read as light so borders/dividers stay visible */
    colorNeutral: "rgba(255, 255, 255, 0.72)",
    colorBorder: "rgba(148, 163, 184, 0.45)",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
  },
  layout: {
    socialButtonsVariant: "iconButton",
    logoPlacement: "none" as const,
  },
  elements: {
    rootBox: "w-full text-[#f8fafc]",
    main: "text-[#f8fafc]",
    card: "border-0 bg-transparent shadow-none p-0",
    headerTitle:
      "text-xl font-semibold tracking-tight !text-[#f8fafc] [color:rgb(248_250_252)]",
    headerSubtitle:
      "text-sm !text-[#e2e8f0] [color:rgb(226_232_240)] leading-relaxed",
    socialButtonsRoot: "gap-3",
    socialButtonsIconButton:
      "!border !border-[rgba(203,213,225,0.35)] !bg-[rgba(248,250,252,0.07)] hover:!bg-[rgba(248,250,252,0.12)] hover:!border-[rgba(203,213,225,0.5)]",
    socialButtonsProviderIcon: "!opacity-100 [filter:brightness(1.15)_contrast(1.08)]",
    dividerRow: "gap-3",
    dividerLine: "bg-[rgba(148,163,184,0.4)]",
    dividerText:
      "!text-[#e2e8f0] text-sm font-medium [color:rgb(226_232_240)] px-2",
    formFieldLabel:
      "!text-[#e8eef4] font-medium [color:rgb(232_238_244)]",
    formFieldLabel__emailAddress:
      "!text-[#e8eef4] font-medium [color:rgb(232_238_244)]",
    formFieldLabel__password:
      "!text-[#e8eef4] font-medium [color:rgb(232_238_244)]",
    formFieldLabel__identifier:
      "!text-[#e8eef4] font-medium [color:rgb(232_238_244)]",
    formFieldLabelRow__emailAddress: "items-center gap-2",
    formFieldLabelRow__password: "items-center gap-2",
    lastAuthenticationStrategyBadge:
      "!rounded-md !border !border-[rgba(47,140,255,0.45)] !bg-[rgba(47,140,255,0.18)] !px-2 !py-0.5 !text-[11px] !font-semibold !uppercase !tracking-wide !text-[#e2e8f0]",
    formFieldRow__phoneNumber: "!hidden",
    phoneInputBox: "!hidden",
    formFieldInput:
      "!border-[rgba(148,163,184,0.4)] !bg-[#040d18] !text-[#f8fafc] placeholder:!text-[#94a3b8] rounded-xl",
    formFieldInputShowPasswordButton:
      "!text-[#cbd5e1] hover:!text-[#f8fafc]",
    formFieldInputShowPasswordIcon:
      "!text-[#cbd5e1] hover:!text-[#f8fafc]",
    formButtonPrimary:
      "!bg-[#2f8cff] !text-white hover:!bg-[#1d7aee] !shadow-none font-semibold rounded-full",
    footer:
      "!border-t !border-[rgba(148,163,184,0.25)] !bg-transparent !pt-4 !text-[#cbd5e1]",
    footerAction:
      "!text-[#e2e8f0] [&_span]:!text-[#e2e8f0]",
    footerActionText: "!text-[#e2e8f0] font-normal [color:rgb(226_232_240)]",
    footerActionLink:
      "!text-[#5eb0ff] font-semibold hover:!text-[#93c8ff] [color:rgb(94_176_255)]",
    footerPages: "!text-[#9ca3af] [&_*]:!text-[#9ca3af]",
    footerPagesLink:
      "!text-[#94a3b8] hover:!text-[#cbd5e1]",
    identityPreviewText: "text-[#f8fafc]",
    identityPreviewEditButton: "text-[#5eb0ff] hover:text-[#93c8ff]",
    formFieldSuccessText: "text-[#6ee7b7]",
    formFieldErrorText: "text-[#fca5a5]",
    otpCodeFieldInput:
      "!border-[rgba(148,163,184,0.4)] !bg-[#040d18] !text-[#f8fafc]",
    alternativeMethodsBlockButton:
      "!border-[rgba(148,163,184,0.35)] !bg-[rgba(248,250,252,0.05)] hover:!bg-[rgba(248,250,252,0.1)] rounded-xl !text-[#e2e8f0]",
  },
};
