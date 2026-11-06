import { useState, useCallback, type ReactNode } from "react";
import { ContactFormContext, type ContactFormContextValue } from "./ContactFormContext";
import { submitContact, ContactSubmissionError } from "../api/contact";
import { CONTACT_INTENTS } from "../data/contact";
import { getBrowserTimezone } from "../lib/browser";
import type { ContactFormState, ContactIntent } from "../types/contact";

export function ContactFormProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<ContactFormState>({ name: "", email: "", phone: "", message: "" });
  const [intent, setIntent] = useState<ContactIntent>(CONTACT_INTENTS[0]);
  const [stage, setStage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [confirmation, setConfirmation] = useState<"sent" | "failed" | null>(null);
  const [leadRef, setLeadRef] = useState<string | null>(null);

  const updateField = useCallback((field: keyof ContactFormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value })), []
  );

  const handleSubmit = useCallback(async () => {
    if (sending) return;
    setSending(true);
    setError("");
    try {
      const data = await submitContact({
        ...form,
        message: `[Intent: ${intent}]\n\n${form.message}`,
        botcheck: "",
        timezone: getBrowserTimezone(),
        ...(stage ? { stage } : {}),
      });
      setConfirmation(data.confirmation === "failed" ? "failed" : "sent");
      setLeadRef(data.leadRef ?? null);
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof ContactSubmissionError
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSending(false);
    }
  }, [form, intent, sending, stage]);

  const reset = useCallback(() => {
    setForm({ name: "", email: "", phone: "", message: "" });
    setIntent(CONTACT_INTENTS[0]);
    setStage("");
    setError("");
    setSubmitted(false);
    setConfirmation(null);
    setLeadRef(null);
  }, []);

  const value: ContactFormContextValue = {
    form,
    intent,
    sending,
    error,
    submitted,
    confirmation,
    leadRef,
    updateField,
    setIntent,
    stage,
    setStage,
    handleSubmit,
    reset,
  };

  return (
    <ContactFormContext.Provider value={value}>
      {children}
    </ContactFormContext.Provider>
  );
}