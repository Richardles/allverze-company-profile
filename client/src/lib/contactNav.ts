import type { NavigateFunction } from "react-router-dom";

export const CONTACT_FORM_ID = "contact-form";

export const CONTACT_FORM_STATE = { scrollTo: CONTACT_FORM_ID } as const;

export function openContactForm(navigate: NavigateFunction): void {
  navigate("/contact", { state: CONTACT_FORM_STATE });
}

export const SERVICE_MODULE_ID = (index: number): string => `module-${index + 1}`;

export function openServiceModule(navigate: NavigateFunction, index: number): void {
  navigate("/services", { state: { scrollTo: SERVICE_MODULE_ID(index) } });
}