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
  /**
   * Epoch ms captured the instant "Send Message" was clicked. Server-side it is
   * only used to measure click -> both-emails-settled; it is dropped if it is
   * wildly off from server time, so a wrong client clock cannot corrupt the log.
   */
  clickedAt?: number;
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