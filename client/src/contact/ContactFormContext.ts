import { createContext, useContext } from "react";
import type { ContactFormState, ContactIntent } from "../types/contact";

export interface ContactFormContextValue {
  form: ContactFormState;
  intent: ContactIntent;
  sending: boolean;
  error: string;
  submitted: boolean;
  confirmation: "sent" | "failed" | "pending" | null;
  leadRef: string | null;
  updateField: (field: keyof ContactFormState, value: string) => void;
  setIntent: (intent: ContactIntent) => void;
  stage: string;
  setStage: (stage: string) => void;
  handleSubmit: () => Promise<void>;
  reset: () => void;
}

export const ContactFormContext = createContext<ContactFormContextValue | null>(null);

export function useContactForm(): ContactFormContextValue {
  const ctx = useContext(ContactFormContext);
  if (!ctx) throw new Error("useContactForm must be used inside <ContactFormProvider>");
  return ctx;
}