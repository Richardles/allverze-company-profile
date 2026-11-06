export type ContactIntent =
  | "Custom Software Engineering"
  | "Mobile Application Development"
  | "Application Performance Monitoring"
  | "Performance & Automation Testing"
  | "Discovery & Advisory"
  | "Something else";

export interface ContactFormState {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface ContactPayload extends ContactFormState {
  botcheck?: string;
  timezone?: string;
  stage?: string;
}

export interface ContactResponse {
  success: boolean;
  /**
   * `pending` means the lead was delivered but the customer confirmation was
   * still in flight when the response budget ran out — it usually arrives a
   * moment later. Only `sent` means we know it landed.
   */
  confirmation?: "sent" | "failed" | "skipped" | "pending";
  leadRef?: string;
  message?: string;
}