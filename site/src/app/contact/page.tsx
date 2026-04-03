import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch about SAP program governance, testing, and cutover readiness.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 md:py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl">
        Contact
      </h1>
      <p className="mt-4 text-lg text-[var(--muted)] leading-relaxed">
        Questions about executive SAP program advisory, downloads, or working
        together? Send a message and we will get back to you.
      </p>

      <div className="mt-10">
        <ContactForm />
      </div>
    </div>
  );
}
